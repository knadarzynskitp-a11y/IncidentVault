import pg from 'pg';

const { Pool } = pg;

export const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

export async function connectDatabase() {
  try {
    await pool.query("SELECT NOW()");
    console.log("Połączono z PostgreSQL");
  } catch (error) {
    console.error("Błąd połączenia z PostgreSQL:", error);
    process.exit(1);
  }
}