import { config } from 'dotenv';
import { resolve } from 'path';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { users } from './schema';

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') });

if (!process.env.POSTGRES_URL) {
  throw new Error('POSTGRES_URL environment variable is not set');
}

async function verifyConnection() {
  console.log('🔄 Starting database verification...');
  
  const connectionString = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL;
  
  if (!connectionString) {
    throw new Error('No database connection string available');
  }
  
  console.log('Using connection string:', connectionString);

  const client = postgres(connectionString, {
    max: 1,
    idle_timeout: 20,
    connect_timeout: 10,
    ssl: { rejectUnauthorized: false },
    prepare: false,
  });

  const db = drizzle(client);

  try {
    // First try a simple connection test
    console.log('Testing database connection...');
    await client.unsafe('SELECT 1');
    console.log('✅ Basic connection successful');

    // Then try to query the users table
    console.log('Testing users table...');
    const result = await db.select().from(users).limit(1);
    console.log('✅ Users table exists and is queryable');
    console.log('Sample query result:', result);
    
  } catch (error) {
    console.error('❌ Error during verification:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
  } finally {
    console.log('Closing connection...');
    await client.end();
    process.exit(0);
  }
}

verifyConnection(); 