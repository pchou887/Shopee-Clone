import { Request, Response } from "express";
import { Connection } from "mysql2/promise";
import keyBy from "lodash.keyby";
import flow from "lodash.flow";
import * as dotenv from "dotenv";
import pool from "../models/dbPool.js";
import * as orderModel from "../models/order.js";
import * as orderDetailModel from "../models/orderDetail.js";
import * as userInfoModel from "../models/userInfo.js";
import * as redisModel from "../models/redis.js";
import {
  getProductsByIds,
  getOrderProductsByStoreId,
} from "../models/product.js";
import {
  getProductVariantsById,
  getProductVariantsByProductVariantIds,
  getVariantsStockWithLock,
  updateVariantsStock,
} from "../models/productVariant.js";
import { ValidationError } from "../utils/errorHandler.js";
import { getProductMainImage } from "../models/productImage.js";

dotenv.config();

const TAPPAY_PARTNER_KEY = process.env.TAPPAY_PARTNER_KEY;
const TAPPAY_MERCHANT_ID = process.env.TAPPAY_MERCHANT_ID;

interface OrderInfo {
  shipping: string;
  payment: string;
  subtotal: number;
  freight: number;
  total: number;
}

interface Recipient {
  name: string;
  phone: string;
  email: string;
  address: string;
}

async function payByPrime({
  prime,
  recipient,
  amount,
  details,
  orderId,
}: {
  prime: string;
  recipient: Recipient;
  amount: number;
  details: string;
  orderId: number;
}) {
  const data = {
    prime,
    partner_key: TAPPAY_PARTNER_KEY,
    merchant_id: TAPPAY_MERCHANT_ID,
    details,
    amount,
    cardholder: {
      phone_number: recipient.phone,
      name: recipient.name,
      email: recipient.email,
      address: recipient.address,
    },
    remember: false,
    order_number: orderId,
  };
  const result = fetch(
    "https://sandbox.tappaysdk.com/tpc/payment/pay-by-prime",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": TAPPAY_PARTNER_KEY ?? "",
      },
      body: JSON.stringify(data),
    }
  )
    .then((res) => res.json())
    .catch((err) => {
      throw err;
    });
  return result;
}

interface ProductInput {
  id: number;
  name: string;
  variantId: number;
  kind: string;
  price: number;
  qty: number;
}

interface Product extends ProductInput {}

interface VariantMap {
  [variantId: string]: {
    id: number;
    product_id: number;
    stock: number;
  };
}

async function checkProducts(inputList: ProductInput[]): Promise<Product[]> {
  const productIds = inputList.map(({ id }) => Number(id));
  const varaintIds = inputList.map(({ variantId }) => Number(variantId));
  const [productsFromServer, variantsFromServer] = await Promise.all([
    getProductsByIds(productIds),
    getProductVariantsById(varaintIds),
  ]);
  const productsFromServerMap = keyBy(productsFromServer, "id");
  const variantsFromServerMap = keyBy(variantsFromServer, "id");
  const checkProductExit = (product: ProductInput) => {
    const serverProduct = productsFromServerMap[product.id];
    if (!serverProduct)
      throw new ValidationError(`invalid product: ${product.id}`);
    return product;
  };
  const checkProductPriceMatch = (product: ProductInput) => {
    const serverVariant = variantsFromServerMap[product.variantId];
    if (serverVariant.price !== product.price) {
      throw new ValidationError(`invalid variant price: ${product.variantId}`);
    }
    return product;
  };
  const checkProductVariant = (product: ProductInput) => {
    const variant = variantsFromServerMap[product.variantId];
    if (!variant) {
      throw new ValidationError(`invalid variant: ${product.variantId}`);
    }
    const targetVariant = variant.kind === product.kind;
    if (!targetVariant) {
      throw new ValidationError(`invalid variant: ${product.variantId}`);
    }
    if (variant.stock < product.qty) {
      throw new ValidationError(
        `variant ${product.variantId} stock not enough`
      );
    }
  };
  inputList.forEach(
    flow(checkProductExit, checkProductPriceMatch, checkProductVariant)
  );
  return inputList.map((product) => {
    const variant = variantsFromServerMap[product.variantId];
    const targetVariant = variant.kind === product.kind;
    if (!targetVariant) {
      throw new ValidationError(`invalid variant: ${product.variantId}`);
    }
    return {
      ...product,
    };
  });
}

async function placeOrder({
  userId,
  orderInfo,
  recipient,
  products,
  connection,
}: {
  userId: number;
  orderInfo: OrderInfo;
  recipient: Recipient;
  products: Product[];
  connection: Connection;
}) {
  const { shipping, payment, subtotal, freight, total } = orderInfo;
  const { name, address, phone } = recipient;
  connection.query("BEGIN");
  try {
    const { orderId } = await orderModel.createOrder(
      userId,
      {
        shipping,
        payment,
        subtotal,
        freight,
        total,
      },
      { name, address, phone },
      connection
    );
    await Promise.all([
      userInfoModel.createUserInfo(userId, recipient, connection),
      orderDetailModel.createOrderDetails(orderId, products, connection),
    ]);
    connection.query("COMMIT");
    return { orderId };
  } catch (err) {
    connection.query("ROLLBACK");
    throw err;
  }
}

async function confirmOrder({
  orderId,
  amount,
  prime,
  products,
  recipient,
  connection,
}: {
  orderId: number;
  amount: number;
  prime: string;
  products: Product[];
  recipient: Recipient;
  connection: Connection;
}) {
  try {
    connection.query("BEGIN");

    const variantIds = products.map(({ variantId }) => variantId);
    const variants = await getVariantsStockWithLock(variantIds, connection);
    const variantsMapWithNewStock = products.reduce(function (
      variantsMap: VariantMap,
      product
    ): VariantMap {
      variantsMap[product.variantId].stock -= product.qty;
      return variantsMap;
    },
    keyBy(variants, "id"));

    if (
      Object.values(variantsMapWithNewStock).some(
        (variant) => variant.stock < 0
      )
    ) {
      throw new Error("stock not enough!");
    }

    await updateVariantsStock(
      Object.values(variantsMapWithNewStock),
      connection
    );

    await orderModel.transitionStatusFromCreatedToPaid(orderId, connection);

    const result = await payByPrime({
      prime,
      recipient,
      amount,
      details: products[0].name,
      orderId,
    });

    if (result.status !== 0) {
      throw new Error(result.msg);
    }

    connection.query("COMMIT");
  } catch (err) {
    connection.query("ROLLBACK");
    throw err;
  }
}

export async function checkout(req: Request, res: Response) {
  const connection = await pool.getConnection();
  try {
    const userId = res.locals.userId;
    const { prime, order } = req.body;
    const { shipping, payment, subtotal, freight, total, recipient, list } =
      order;
    const products = await checkProducts(list);
    if (subtotal + freight !== total)
      throw new ValidationError("invalid total price");
    const { orderId } = await placeOrder({
      userId,
      orderInfo: {
        shipping,
        payment,
        subtotal,
        freight,
        total,
      },
      recipient,
      products,
      connection,
    });

    await confirmOrder({
      orderId,
      prime,
      amount: total,
      recipient,
      products,
      connection,
    });

    res.status(200).json({ data: { number: orderId } });
  } catch (err) {
    console.log(err);
    if (err instanceof ValidationError) {
      res.status(400).json({ errors: err.message });
      return;
    }
    if (err instanceof Error) {
      res.status(500).json({ errors: err.message });
      return;
    }
    res.status(500).json({ errors: "checkout failed" });
  } finally {
    connection.release();
  }
}
export async function snapUpCheckout(req: Request, res: Response) {
  const connection = await pool.getConnection();
  try {
    const userId = res.locals.userId;
    const { prime, order } = req.body;
    const { shipping, payment, subtotal, freight, total, recipient, list } =
      order;
    const { id, qty, variantId } = list;
    const userOrderStr = await redisModel.getStr(`userOrder:${userId}`);
    if (!userOrderStr) throw new ValidationError("invalid order");
    const nowTime = new Date().getTime();
    const expireTime = await redisModel.getZsetMemberScore(
      "order",
      `${userId}`
    );
    if (!expireTime || nowTime > Number(expireTime))
      throw new ValidationError("order timeout");
    const userOrder = JSON.parse(userOrderStr);
    if (
      userOrder.productId !== id &&
      userOrder.variantId !== variantId &&
      userOrder.amount !== qty
    )
      throw new ValidationError("invalid product");
    const products = await checkProducts(list);
    if (subtotal + freight !== total)
      throw new ValidationError("invalid total price");
    const { orderId } = await placeOrder({
      userId,
      orderInfo: {
        shipping,
        payment,
        subtotal,
        freight,
        total,
      },
      recipient,
      products,
      connection,
    });

    await confirmOrder({
      orderId,
      prime,
      amount: total,
      recipient,
      products,
      connection,
    });
    await redisModel.delStr(`userOrder:${userId}`);
    await redisModel.rmZsetMember("order", `${userId}`);
    await redisModel.decrStr("ordering");

    res.status(200).json({ data: { number: orderId } });
  } catch (err) {
    if (err instanceof ValidationError) {
      res.status(400).json({ errors: err.message });
      return;
    }
    if (err instanceof Error) {
      res.status(500).json({ errors: err.message });
      return;
    }
    res.status(500).json({ errors: "checkout failed" });
  } finally {
    connection.release();
  }
}

interface VariantWithImageShema {
  id: number;
  name: string;
  varaintId: number;
  kind: string;
  price: number;
  image: string;
}
interface OrderListVariantSchema extends VariantWithImageShema {
  qty: number;
}

interface OrderSchema {
  order_id: number;
  payment: "cash" | "credit_card" | "ATM";
  freight: number;
  subtotal: number;
  total: number;
  recipient: string;
  address: string;
  phone: string;
  product_id: number;
  variant_id: number;
  qty: number;
}

interface UserOrdersSchema {
  order_id: number;
  payment: "cash" | "credit_card" | "ATM";
  freight: number;
  subtotal: number;
  total: number;
  recipient: string;
  address: string;
  phone: string;
  order_list: OrderListVariantSchema[];
}

const groupOrderList = (
  variants: {
    id: number;
    product_id: number;
    kind: string;
    stock: number;
    price: number;
  }[],
  productImages: {
    product_id: number;
    path: string;
    type: string;
    mimetype: string;
  }[],
  orders: OrderSchema[],
  products: {
    id: number;
    name: string;
  }[]
): UserOrdersSchema[] => {
  const productName = products.reduce(
    (obj: { [productId: number]: string }, ele) => {
      obj[ele.id] = ele.name;
      return obj;
    },
    {}
  );
  const imageObj = productImages.reduce(
    (obj: { [productId: number]: string }, ele) => {
      obj[ele.product_id] = `https://d1a26cbu5iquck.cloudfront.net/${ele.path}`;
      return obj;
    },
    {}
  );
  const varaintObj = variants.reduce(
    (obj: { [variantId: number]: VariantWithImageShema }, ele) => {
      obj[ele.id] = {
        id: ele.product_id,
        name: productName[ele.product_id],
        varaintId: ele.id,
        kind: ele.kind,
        price: ele.price,
        image: imageObj[ele.product_id],
      };
      return obj;
    },
    {}
  );
  const orderVariantQty = orders.reduce(
    (obj: { [variantId: number]: number }, ele) => {
      obj[ele.variant_id] = ele.qty;
      return obj;
    },
    {}
  );
  const orderVariant = orders.reduce(
    (obj: { [orderId: number]: OrderListVariantSchema[] }, ele) => {
      if (!obj[ele.order_id]) obj[ele.order_id] = [];
      obj[ele.order_id].push({
        ...varaintObj[ele.variant_id],
        qty: orderVariantQty[ele.variant_id],
      });
      return obj;
    },
    {}
  );
  const orderObj = orders.reduce(
    (obj: { [orderId: number]: UserOrdersSchema }, ele) => {
      if (obj[ele.order_id]) return obj;
      obj[ele.order_id] = {
        order_id: ele.order_id,
        payment: ele.payment,
        freight: ele.freight,
        subtotal: ele.subtotal,
        total: ele.total,
        recipient: ele.recipient,
        address: ele.address,
        phone: ele.phone,
        order_list: orderVariant[ele.order_id],
      };
      return obj;
    },
    {}
  );
  return Object.values(orderObj).reverse();
};

export const getStoreUserOrders = async (req: Request, res: Response) => {
  try {
    const storeId = Number(req.params.storeId);
    const userId = Number(req.params.userId);
    const orders = await orderModel.findOrderByUserId(userId);
    const orderProductIds = orders.map((ele) => ele.product_id);
    const orderVaraintIds = orders.map((ele) => ele.variant_id);
    const products = await getOrderProductsByStoreId(orderProductIds, storeId);
    const storeOrderProductIds = products.map((ele) => ele.id);
    const variants = await getProductVariantsByProductVariantIds(
      storeOrderProductIds,
      orderVaraintIds
    );
    const productsMainImage = await getProductMainImage(storeOrderProductIds);
    const data = groupOrderList(variants, productsMainImage, orders, products);
    res.status(200).json({ data });
  } catch (err) {
    if (err instanceof Error) {
      res.status(400).json({ errors: err.message });
      return;
    }
    res.status(500).json({ errors: "something wrong" });
  }
};
