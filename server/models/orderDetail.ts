import { Connection } from "mysql2/promise";

/*
  id bigint unsigned NOT NULL AUTO_INCREMENT
  order_id bigint unsigned NOT NULL FOREIGN KEY
  product_id bigint unsigned NOT NULL FOREIGN KEY
  variant_id bigint unsigned NOT NULL FOREIGN KEY
  product_title
  quantity
  price
  created_at
  updated_at
**/

interface ProductInput {
  id: number;
  name: string;
  variantId: number;
  price: number;
  qty: number;
}

export const createOrderDetails = async (
  orderId: number,
  products: ProductInput[],
  connection: Connection
) => {
  await connection.query(
    `
      INSERT INTO order_list (
        order_id, product_id, variant_id, price, qty)
      VALUES ?
    `,
    [
      products.map((product) => {
        const { id: productId, variantId, price, qty } = product;
        return [orderId, productId, variantId, price, qty];
      }),
    ]
  );
};
