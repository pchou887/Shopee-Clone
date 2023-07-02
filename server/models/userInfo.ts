import { Connection } from "mysql2/promise";
import { ResultSetHeader } from "mysql2";

/*
  id bigint unsigned NOT NULL AUTO_INCREMENT
  order_id bigint unsigned NOT NULL FOREIGN KEY
  name
  phone
  address
**/

function instanceOfSetHeader(object: any): object is ResultSetHeader {
  return "insertId" in object;
}

export async function createUserInfo(
  userId: number,
  recipient: {
    name: string;
    phone: string;
    email: string;
    address: string;
  },
  connection: Connection
) {
  const { name, phone, address } = recipient;
  const results = await connection.query(
    `
    INSERT INTO user_info (
      user_id, name, address, phone
    )
    VALUES(?, ?, ?, ?)
  `,
    [userId, name, address, phone]
  );
  if (Array.isArray(results) && instanceOfSetHeader(results[0])) {
    return results[0].insertId;
  }
  throw new Error("create campaign failed");
}
