import type { Config } from 'drizzle-kit';
import { config } from 'dotenv';

config({ path: '.env.local' });

if (!process.env.POSTGRES_URL) {
  throw new Error('POSTGRES_URL is required');
}

const drizzleConfig = {
  schema: './lib/db/schema.ts',
  out: './lib/db/migrations',
  driver: 'pg' as const,
  dbCredentials: {
    connectionString: process.env.POSTGRES_URL,
  },
  verbose: true,
  strict: true,
} as const;

export default drizzleConfig;
