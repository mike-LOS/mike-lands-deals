import { config } from 'dotenv';
import { resolve, join } from 'path';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import { readdir, readFile } from 'fs/promises';

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') });

const runMigrate = async () => {
  console.log('🔄 Starting database migration...');

  if (!process.env.POSTGRES_URL) {
    throw new Error('POSTGRES_URL is not defined in environment variables');
  }

  try {
    // Use non-pooling connection for migrations
    const connectionString = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL;
    
    if (!connectionString) {
      throw new Error('No database connection string available');
    }
    
    console.log('Using connection string:', connectionString);
    
    const connection = postgres(connectionString, { 
      max: 1,
      ssl: { rejectUnauthorized: false },
      connect_timeout: 10
    });

    const db = drizzle(connection, { schema });

    // Create drizzle schema if it doesn't exist
    await connection.unsafe(`
      CREATE SCHEMA IF NOT EXISTS drizzle;
    `);

    console.log('⏳ Running migrations...');
    const start = Date.now();

    // Read and execute migration files
    const migrationsDir = './lib/db/migrations';
    const files = await readdir(migrationsDir);
    const sqlFiles = files.filter(f => f.endsWith('.sql')).sort();

    for (const file of sqlFiles) {
      console.log(`Executing migration: ${file}`);
      const sql = await readFile(join(migrationsDir, file), 'utf-8');
      await connection.unsafe(sql);
    }
    
    const end = Date.now();
    console.log('✅ Migrations completed in', end - start, 'ms');

    // Verify the schema was created correctly
    try {
      const result = await db.select().from(schema.users).limit(1);
      console.log('✅ Users table verified');
    } catch (verifyError) {
      console.error('❌ Schema verification failed:', verifyError);
    }

    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
};

runMigrate();
