/**
 * Performance monitoring utilities
 */

export interface PerformanceMetric {
  name: string;
  duration: number;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

/**
 * Measure execution time of an async function
 */
export async function measurePerformance<T>(
  name: string,
  fn: () => Promise<T>,
  metadata?: Record<string, unknown>,
): Promise<T> {
  const start = performance.now();
  try {
    const result = await fn();
    const duration = performance.now() - start;

    // Log slow queries (>200ms)
    if (duration > 200) {
      console.warn(`[Performance] Slow operation: ${name} took ${duration.toFixed(2)}ms`, metadata);
    }

    return result;
  } catch (error) {
    const duration = performance.now() - start;
    console.error(`[Performance] Error in ${name} after ${duration.toFixed(2)}ms:`, error);
    throw error;
  }
}

/**
 * Create a performance timer
 */
export function createTimer(name: string) {
  const start = performance.now();

  return {
    end: (metadata?: Record<string, unknown>) => {
      const duration = performance.now() - start;
      if (duration > 200) {
        console.warn(`[Performance] Slow operation: ${name} took ${duration.toFixed(2)}ms`, metadata);
      }
      return duration;
    },
  };
}

/**
 * Batch database queries to reduce round trips
 */
export async function batchQueries<T>(
  queries: Array<() => Promise<T>>,
  batchSize: number = 10,
): Promise<T[]> {
  const results: T[] = [];

  for (let i = 0; i < queries.length; i += batchSize) {
    const batch = queries.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map((q) => q()));
    results.push(...batchResults);
  }

  return results;
}

