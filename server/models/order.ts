import { Connection } from "mysql2/promise";
import { z } from "zod";
import { ResultSetHeader } from "mysql2";
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

function instanceOfSetHeader(object: any): object is ResultSetHeader {
  return "insertId" in object;
}

export async function createOrder(
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
) {
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
}

export async function transitionStatusFromCreatedToPaid(
  orderId: number,
  connection: Connection
) {
  await connection.query(
    `
      UPDATE \`order\`
      SET status = ?
      WHERE id = ? AND status = ?
    `,
    ["unpay", orderId, "shipping"]
  );
}

const UserIdAndTotalSchema = z.object({
  user_id: z.number(),
  total: z.number(),
});

export async function getUserIdAndTotal() {
  const [rows] = await pool.query(
    `
      SELECT user_id, total from \`order\`
    `
  );
  const orders = z.array(UserIdAndTotalSchema).parse(rows);
  return orders;
}
