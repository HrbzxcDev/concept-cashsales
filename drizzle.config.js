/* eslint-disable import/no-anonymous-default-export */
import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config ({ path: ".env"})

export default defineConfig ({
  dialect: 'postgresql',
  schema: './utils/db/schema.ts',
  out: './drizzle/migrations',

  dbCredentials: {
    url: process.env.DATABASE_URL,
    connectionString: process.env.DATABASE_URL,
  }
});
