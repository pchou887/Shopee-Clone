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
import * as productModel from "../models/product.js";
import * as productImageModel from "../models/productImage.js";
import * as productVariantModel from "../models/productVariant.js";
import { ValidationError } from "../utils/errorHandler.js";

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

const payByPrime = async ({
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
}) => {
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
};

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

const checkProducts = async (inputList: ProductInput[]): Promise<Product[]> => {
  const productIds = inputList.map(({ id }) => Number(id));
  const varaintIds = inputList.map(({ variantId }) => Number(variantId));
  const [productsFromServer, variantsFromServer] = await Promise.all([
    productModel.getProductsByIds(productIds),
    productVariantModel.getProductVariantsById(varaintIds),
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
};

const placeOrder = async ({
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
}) => {
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
};

const confirmOrder = async ({
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
}) => {
  try {
    connection.query("BEGIN");

    const variantIds = products.map(({ variantId }) => variantId);
    const variants = await productVariantModel.getVariantsStockWithLock(
      variantIds,
      connection
    );
    const variantsMapWithNewStock = products.reduce(
      (variantsMap: VariantMap, product): VariantMap => {
        variantsMap[product.variantId].stock -= product.qty;
        return variantsMap;
      },
      keyBy(variants, "id")
    );

    if (
      Object.values(variantsMapWithNewStock).some(
        (variant) => variant.stock < 0
      )
    ) {
      throw new Error("stock not enough!");
    }

    await productVariantModel.updateVariantsStock(
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
};

export const checkout = async (req: Request, res: Response) => {
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
};

export const snapUpCheckout = async (req: Request, res: Response) => {
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
};

interface OrderVariantSchema {
  varaintId: number;
  kind: string;
  price: number;
  image: string;
  id: number;
  name: string;
}
interface OrderListSchema extends OrderVariantSchema {
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
  order_list: OrderListSchema[];
}

const groupProduct = (
  products: {
    id: number;
    name: string;
    image: string;
  }[]
) => {
  return products.reduce(
    (
      obj: { [productId: number]: { id: number; name: string; image: string } },
      ele
    ) => {
      obj[ele.id] = {
        id: ele.id,
        name: ele.name,
        image: ele.image,
      };
      return obj;
    },
    {}
  );
};

const mapImages = (imagesObj: {
  [productId: string]: { main_image: string; images: string[] };
}) => {
  return <Product extends { id: number }>(product: Product) => ({
    ...product,
    image:
      `https://d1a26cbu5iquck.cloudfront.net/${
        imagesObj[product.id]?.main_image
      }` ?? "",
  });
};

const groupOrderVariant = (
  variants: {
    id: number;
    product_id: number;
    kind: string;
    stock: number;
    price: number;
  }[],
  productObj: {
    [productId: string]: { id: number; name: string; image: string };
  }
) => {
  return variants.reduce(
    (obj: { [variantId: number]: OrderVariantSchema }, ele) => {
      obj[ele.id] = {
        varaintId: ele.id,
        kind: ele.kind,
        price: ele.price,
        image: productObj[ele.product_id].image,
        id: ele.product_id,
        name: productObj[ele.product_id].name,
      };
      return obj;
    },
    {}
  );
};

const groupOrderList = (
  orders: OrderSchema[],
  variantObj: { [variantId: number]: OrderVariantSchema }
) => {
  const orderVariant = orders.reduce(
    (obj: { [orderId: number]: OrderListSchema[] }, ele) => {
      if (!obj[ele.order_id]) obj[ele.order_id] = [];
      obj[ele.order_id].push({
        ...variantObj[ele.variant_id],
        qty: ele.qty,
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
    const productsData = await productModel.getOrderProductsByStoreId(
      orderProductIds,
      storeId
    );
    const storeOrderProductIds = productsData.map((ele) => ele.id);
    const storeUserOrders = orders.filter((ele) =>
      storeOrderProductIds.includes(ele.product_id)
    );
    const variants =
      await productVariantModel.getProductVariantsByProductVariantIds(
        storeOrderProductIds,
        orderVaraintIds
      );
    const productsMainImage = await productImageModel.getProductMainImage(
      storeOrderProductIds
    );
    const imageObj = productImageModel.groupImages(productsMainImage);
    const productsWithImage = productsData.map(mapImages(imageObj));
    const productObj = groupProduct(productsWithImage);
    const varaintObj = groupOrderVariant(variants, productObj);
    const data = groupOrderList(storeUserOrders, varaintObj);
    res.status(200).json({ data });
  } catch (err) {
    if (err instanceof Error) {
      res.status(400).json({ errors: err.message });
      return;
    }
    res.status(500).json({ errors: "something wrong" });
  }
};
