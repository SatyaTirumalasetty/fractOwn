import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Optimize pool for better memory management
const poolConfig = {
  connectionString: process.env.DATABASE_URL,
  max: 5, // Reduce max connections to save memory
  idleTimeoutMillis: 30000, // Close idle connections after 30s
  connectionTimeoutMillis: 10000, // Timeout connection attempts after 10s
};

export const pool = new Pool(poolConfig);
export const db = drizzle({ client: pool, schema });

// Graceful shutdown handling
process.on('SIGTERM', async () => {
  console.log('Closing database pool...');
  await pool.end();
});