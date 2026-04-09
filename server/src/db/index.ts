import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema/schema';


const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString);

export const db = drizzle(client, { schema });

async function checkConnection() {
  try {
    await client`SELECT 1`;
    console.log("Database connected successfully!");
  } catch (error) {
    console.error("Database connection failed!");
    console.error(error);
  }
}

checkConnection();