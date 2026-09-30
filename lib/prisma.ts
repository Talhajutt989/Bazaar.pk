import { PrismaClient } from '@prisma/client';

// Known Prisma & network connection error codes
const CONNECTION_ERROR_CODES = new Set([
  'P1000', // Authentication failed against database server
  'P1001', // Can't reach database server
  'P1002', // Database server was reached but timed out
  'P1003', // Database does not exist
  'P1008', // Operations timed out
  'P1017', // Server has closed the connection
]);

/**
 * Checks if an unknown error is related to database connectivity.
 */
export function isDatabaseConnectionError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;

  const err = error as { code?: string; message?: string; name?: string };

  if (err.code && CONNECTION_ERROR_CODES.has(err.code)) {
    return true;
  }

  const message = err.message || '';
  const name = err.name || '';

  return (
    name === 'PrismaClientInitializationError' ||
    name === 'PrismaClientRustPanicError' ||
    message.includes("Can't reach database server") ||
    message.includes('ECONNREFUSED') ||
    message.includes('ETIMEDOUT') ||
    message.includes('ENOTFOUND') ||
    message.includes('Connection refused') ||
    message.includes('server has closed the connection') ||
    message.includes('Engine is not ready')
  );
}

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['error', 'warn'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

/**
 * Perform a database health check with latency measurement.
 */
export async function checkDatabaseConnection(): Promise<{
  connected: boolean;
  latencyMs?: number;
  error?: string;
  code?: string;
}> {
  const start = Date.now();
  try {
    // Run lightweight ping query
    await prisma.$queryRaw`SELECT 1`;
    return {
      connected: true,
      latencyMs: Date.now() - start,
    };
  } catch (err: unknown) {
    const errorObj = err as { code?: string; message?: string };
    return {
      connected: false,
      error: errorObj.message || 'Unknown database connection error',
      code: errorObj.code,
    };
  }
}

/**
 * Safe database query helper for Server Components.
 * Automatically catches connection failures and returns a fallback value instead of crashing.
 */
export async function safeDbQuery<T>(
  queryFn: () => Promise<T>,
  fallback: T,
  retries = 2,
  delayMs = 500
): Promise<T> {
  let attempt = 0;
  while (attempt <= retries) {
    try {
      return await queryFn();
    } catch (error) {
      if (isDatabaseConnectionError(error)) {
        attempt++;
        if (attempt <= retries) {
          await new Promise((resolve) => setTimeout(resolve, delayMs * attempt));
          continue;
        }
        console.error(
          `[Prisma SafeQuery] Database connection unavailable after ${retries} retries. Using fallback data.`,
          error instanceof Error ? error.message : error
        );
        return fallback;
      }
      // For application errors (e.g. invalid query syntax), propagate error
      throw error;
    }
  }
  return fallback;
}

export default prisma;
