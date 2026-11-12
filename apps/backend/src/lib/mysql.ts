import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

let pool: mysql.Pool | null = null;

export function getMySQLPool(): mysql.Pool {
  if (!pool) {
    const host = process.env.GG_DB_HOST || "182.19.81.116";
    const port = Number(process.env.GG_DB_PORT || 3306);
    const user = process.env.GG_DB_USER || "gg_app_user";
    const password = (process.env.GG_DB_PASSWORD || "").trim().replace(/^["']|["']$/g, "");
    const database = process.env.GG_DB_NAME || "gg_app";

    pool = mysql.createPool({
      host,
      port,
      user,
      password,
      database,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      connectTimeout: 8000,
      enableKeepAlive: true,
      keepAliveInitialDelay: 10000,
    });
  }

  return pool;
}
