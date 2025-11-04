// app/lib/redis.ts
import { Redis } from '@upstash/redis';

// Validação para garantir que as variáveis de ambiente foram carregadas
if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
  throw new Error('As variáveis de ambiente do Upstash Redis não estão configuradas.');
}

/**
 * An instance of the Upstash Redis client.
 * It is configured using the environment variables `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`.
 */
export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});