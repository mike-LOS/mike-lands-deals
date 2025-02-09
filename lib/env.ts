import { z } from 'zod';

const envSchema = z.object({
  POSTGRES_URL: z.string().min(1),
  OPENAI_API_KEY: z.string().min(1),
});

export const env = envSchema.parse({
  POSTGRES_URL: process.env.POSTGRES_URL,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
}); 