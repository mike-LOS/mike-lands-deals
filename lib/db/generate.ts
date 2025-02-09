import { config } from 'dotenv';
import { resolve } from 'path';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import * as schema from './schema';
import { mkdir, writeFile } from 'fs/promises';
import { existsSync } from 'fs';

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') });

const generateMigrations = async () => {
  console.log('🔄 Starting migration generation...');

  if (!process.env.POSTGRES_URL) {
    throw new Error('POSTGRES_URL is not defined in environment variables');
  }

  try {
    // Use non-pooling connection for migrations
    const connectionString = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL;
    console.log('Using connection string:', connectionString);
    
    const connection = postgres(connectionString, { 
      max: 1,
      ssl: { rejectUnauthorized: false },
      connect_timeout: 10
    });

    const db = drizzle(connection, { schema });

    // Create migrations directory if it doesn't exist
    const migrationsDir = './lib/db/migrations';
    try {
      await mkdir(migrationsDir, { recursive: true });
    } catch (err) {
      // Ignore error if directory already exists
    }

    console.log('⏳ Generating migrations...');
    const start = Date.now();
    
    // Generate SQL migration
    const migration = `
-- Create schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS drizzle;

-- Drop old tables and their dependencies first
DROP TABLE IF EXISTS suggestions CASCADE;
DROP TABLE IF EXISTS documents CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS chats CASCADE;
DROP TABLE IF EXISTS session CASCADE;
DROP TABLE IF EXISTS account CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create the users table
CREATE TABLE IF NOT EXISTS users (
  id text PRIMARY KEY NOT NULL,
  email text UNIQUE,
  wallet_address text,
  wallet_public_key text,
  name text,
  image text,
  email_verified timestamp,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS email_idx ON users(email);
CREATE INDEX IF NOT EXISTS wallet_address_idx ON users(wallet_address);

-- Create account table
CREATE TABLE IF NOT EXISTS account (
  "userId" text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type varchar(255) NOT NULL,
  provider varchar(255) NOT NULL,
  "providerAccountId" varchar(255) NOT NULL,
  refresh_token text,
  access_token text,
  expires_at timestamp,
  token_type varchar(255),
  scope varchar(255),
  id_token text,
  session_state varchar(255)
);

-- Create session table
CREATE TABLE IF NOT EXISTS session (
  "sessionToken" varchar(255) PRIMARY KEY,
  "userId" text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires timestamp NOT NULL
);

-- Create chats table
CREATE TABLE IF NOT EXISTS chats (
  id text PRIMARY KEY NOT NULL,
  user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title text NOT NULL,
  visibility text NOT NULL DEFAULT 'private',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id text PRIMARY KEY NOT NULL,
  chat_id text NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
  role text NOT NULL,
  content json NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Create documents table
CREATE TABLE IF NOT EXISTS documents (
  id text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  title text NOT NULL,
  content text,
  kind text NOT NULL DEFAULT 'text',
  user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT documents_pk PRIMARY KEY (id, created_at)
);

-- Create suggestions table
CREATE TABLE IF NOT EXISTS suggestions (
  id text PRIMARY KEY NOT NULL,
  document_id text NOT NULL,
  document_created_at timestamp with time zone NOT NULL,
  original_text text NOT NULL,
  suggested_text text NOT NULL,
  description text,
  is_resolved boolean NOT NULL DEFAULT false,
  user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT suggestions_document_fk FOREIGN KEY (document_id, document_created_at) 
    REFERENCES documents(id, created_at) ON DELETE CASCADE
);
`;

    // Write migration to file
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
    const migrationPath = `${migrationsDir}/${timestamp}_initial_schema.sql`;
    await writeFile(migrationPath, migration);
    
    const end = Date.now();
    console.log('✅ Migration generated in', end - start, 'ms');
    console.log('Migration file created at:', migrationPath);

    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration generation failed:', error);
    process.exit(1);
  }
};

generateMigrations(); 