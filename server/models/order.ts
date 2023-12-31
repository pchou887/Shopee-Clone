import { Connection } from "mysql2/promise";
import { z } from "zod";
import instanceOfSetHeader from "../utils/instanceOfSetHeader.js";
import pool from "./dbPool.js";

/*
  id bigint unsigned NOT NULL AUTO_INCREMENT
  buyer_id bigint unsigned NOT NULL FOREIGN KEY
  payment
  status
  freight
  subtotal
  total
  recipient
  address
  phone
  created_at
  updated_at
**/

export const createOrder = async (
  userId: number,
  orderInfo: {
    shipping: string;
    payment: string;
    subtotal: number;
    freight: number;
    total: number;
  },
  recipient: {
    name: string;
    address: string;
    phone: string;
  },
  connection: Connection
) => {
  const { payment, subtotal, freight, total } = orderInfo;
  const { name, address, phone } = recipient;
  const results = await connection.query(
    `
    INSERT INTO \`order\` (
      buyer_id, payment, status, freight, subtotal, total, recipient, address, phone
    )
    VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)
  `,
    [userId, payment, "unpay", freight, subtotal, total, name, address, phone]
  );
  if (Array.isArray(results) && instanceOfSetHeader(results[0])) {
    return { orderId: results[0].insertId };
  }
  throw new Error("create order failed");
};

export const transitionStatusFromCreatedToPaid = async (
  orderId: number,
  connection: Connection
) => {
  await connection.query(
    `
      UPDATE \`order\`
      SET status = ?
      WHERE id = ? AND status = ?
    `,
    ["shipping", orderId, "shipping"]
  );
};

const UserIdAndTotalSchema = z.object({
  user_id: z.number(),
  total: z.number(),
});

export const getUserIdAndTotal = async () => {
  const [rows] = await pool.query(
    `
      SELECT user_id, total from \`order\`
    `
  );
  const orders = z.array(UserIdAndTotalSchema).parse(rows);
  return orders;
};

const OrderSchema = z.object({
  order_id: z.number(),
  payment: z.enum(["cash", "credit_card", "ATM"]),
  freight: z.number(),
  subtotal: z.number(),
  total: z.number(),
  recipient: z.string(),
  address: z.string(),
  phone: z.string(),
  product_id: z.number(),
  variant_id: z.number(),
  qty: z.number(),
});

export const findOrderByUserId = async (userId: number) => {
  const result = await pool.query(
    `
    SELECT order_id, payment, freight, subtotal, total, recipient, address, phone, product_id, variant_id, qty
    FROM \`order\` INNER JOIN order_list ON \`order\`.id = order_list.order_id
    WHERE buyer_id = ? ORDER BY order_id DESC
  `,
    [userId]
  );
  const order = z.array(OrderSchema).parse(result[0]);

  return order;
};
