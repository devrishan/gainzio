import { NextResponse } from 'next/server';
import { getTopSuggestions } from '@/lib/top-suggestions';
import { Cache, CacheKeys } from '@/lib/cache';
import { measurePerformance } from '@/lib/performance';
import { z } from 'zod';

const querySchema = z.object({
  limit: z.string().optional().transform((val) => (val ? parseInt(val) : 10)),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = querySchema.parse(Object.fromEntries(searchParams));

    // Cache top suggestions for 1 hour (as per plan)
    const cacheKey = `${CacheKeys.topSuggestions()}:${query.limit}`;
    const topSuggestions = await measurePerformance(
      'getTopSuggestions',
      () =>
        Cache.getOrSet(
          cacheKey,
          () => getTopSuggestions(query.limit),
          3600, // 1 hour
        ),
      { limit: query.limit },
    );

    return NextResponse.json({
      success: true,
      suggestions: topSuggestions,
    });
  } catch (error) {
    console.error('Error fetching top suggestions:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid query parameters', details: error.flatten() },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { success: false, error: 'Failed to fetch top suggestions' },
      { status: 500 },
    );
  }
}
