import { config } from 'dotenv';
import postgres from 'postgres';

config({
  path: '.env.local',
});

const runReset = async () => {
  if (!process.env.POSTGRES_URL) {
    throw new Error('POSTGRES_URL is not defined');
  }

  const sql = postgres(process.env.POSTGRES_URL, { max: 1 });

  console.log('⏳ Dropping existing tables...');

  try {
    // Drop all tables with CASCADE to handle dependencies
    await sql.unsafe(`
      DROP TABLE IF EXISTS suggestions CASCADE;
      DROP TABLE IF EXISTS documents CASCADE;
      DROP TABLE IF EXISTS messages CASCADE;
      DROP TABLE IF EXISTS chats CASCADE;
      DROP TABLE IF EXISTS session CASCADE;
      DROP TABLE IF EXISTS account CASCADE;
      DROP TABLE IF EXISTS users CASCADE;
      DROP TABLE IF EXISTS suggestion CASCADE;
      DROP TABLE IF EXISTS document CASCADE;
      DROP TABLE IF EXISTS message CASCADE;
      DROP TABLE IF EXISTS chat CASCADE;
      DROP TABLE IF EXISTS dynamic_users CASCADE;
      DROP TABLE IF EXISTS "user" CASCADE;
      DROP TABLE IF EXISTS migrations CASCADE;
      DROP TABLE IF EXISTS __drizzle_migrations CASCADE;
      DROP SCHEMA IF EXISTS drizzle CASCADE;
    `);

    // Recreate drizzle schema
    await sql.unsafe(`
      CREATE SCHEMA IF NOT EXISTS drizzle;
    `);

    console.log('✅ Tables and schema reset successfully');
    await sql.end();
    process.exit(0);
  } catch (err) {
    console.error('❌ Failed to reset database:', err);
    await sql.end();
    process.exit(1);
  }
};

runReset().catch((err) => {
  console.error('❌ Reset failed');
  console.error(err);
  process.exit(1);
}); 