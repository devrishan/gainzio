import { prisma } from './prisma';
import { getRedis } from './redis';

export interface SuggestionScore {
  suggestionId: string;
  score: number;
  productName: string;
  platform: string;
  category: string | null;
  amount: number | null;
  createdAt: Date;
}

/**
 * Calculate score for a product suggestion
 * Factors:
 * - User engagement (user's task completion rate, referral count)
 * - Product popularity (how many times suggested)
 * - Conversion rate (if converted to task, how many submissions)
 * - Recency (newer suggestions get bonus)
 */
export async function calculateSuggestionScore(suggestionId: string): Promise<number> {
  const suggestion = await prisma.productSuggestion.findUnique({
    where: { id: suggestionId },
    include: {
      user: {
        include: {
          submissions: {
            where: { status: 'APPROVED' },
          },
          referralEvents: {
            where: { status: 'verified' },
          },
        },
      },
      convertedToTask: {
        include: {
          submissions: {
            where: { status: 'APPROVED' },
          },
        },
      },
    },
  });

  if (!suggestion) {
    return 0;
  }

  let score = 0;

  // User engagement factor (0-30 points)
  const userTaskCompletionRate =
    suggestion.user.submissions.length > 0
      ? suggestion.user.submissions.filter((s) => s.status === 'APPROVED').length /
      suggestion.user.submissions.length
      : 0;
  const userReferralCount = suggestion.user.referralEvents.length;
  const engagementScore = userTaskCompletionRate * 20 + Math.min(userReferralCount * 2, 10);
  score += engagementScore;

  // Product popularity factor (0-25 points)
  const similarSuggestions = await prisma.productSuggestion.count({
    where: {
      productName: {
        contains: suggestion.productName.substring(0, 10), // Partial match
      },
      status: { in: ['approved', 'converted'] },
    },
  });
  const popularityScore = Math.min(similarSuggestions * 2, 25);
  score += popularityScore;

  // Conversion rate factor (0-30 points)
  if (suggestion.convertedToTask) {
    const task = suggestion.convertedToTask;
    const submissionCount = task.submissions.length;
    const conversionScore = Math.min(submissionCount * 3, 30);
    score += conversionScore;
  } else if (suggestion.status === 'approved') {
    score += 10; // Bonus for approved but not yet converted
  }

  // Recency factor (0-15 points)
  const daysSinceCreation = Math.floor(
    (Date.now() - suggestion.createdAt.getTime()) / (1000 * 60 * 60 * 24),
  );
  const recencyScore = Math.max(0, 15 - daysSinceCreation); // Decay over 15 days
  score += recencyScore;

  // Amount factor (0-10 points) - higher value products get slight boost
  if (suggestion.amount) {
    const amountScore = Math.min(Number(suggestion.amount) / 1000, 10); // 1 point per 1000 rupees, max 10
    score += amountScore;
  }

  return Math.round(score * 100) / 100; // Round to 2 decimal places
}

/**
 * Get top suggestions with caching
 */
export async function getTopSuggestions(limit: number = 10): Promise<SuggestionScore[]> {
  const redis = getRedis();
  const cacheKey = `top_suggestions:${limit}`;

  // Try to get from cache first
  if (redis) {
    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (error) {
      console.warn('Error reading from cache:', error);
    }
  }

  // Get all approved/pending suggestions
  const suggestions = await prisma.productSuggestion.findMany({
    where: {
      status: { in: ['pending', 'approved', 'converted'] },
    },
    include: {
      user: {
        include: {
          submissions: {
            where: { status: 'APPROVED' },
          },
          referralEvents: {
            where: { status: 'verified' },
          },
        },
      },
      convertedToTask: {
        include: {
          submissions: {
            where: { status: 'APPROVED' },
          },
        },
      },
    },
    take: 100, // Calculate scores for top 100, then return top N
  });

  // Calculate scores
  const scoredSuggestions: SuggestionScore[] = [];
  for (const suggestion of suggestions) {
    const score = await calculateSuggestionScore(suggestion.id);
    scoredSuggestions.push({
      suggestionId: suggestion.id,
      score,
      productName: suggestion.productName,
      platform: suggestion.platform,
      category: suggestion.category,
      amount: suggestion.amount ? Number(suggestion.amount) : null,
      createdAt: suggestion.createdAt,
    });
  }

  // Sort by score and return top N
  const topSuggestions = scoredSuggestions
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  // Cache for 1 hour
  if (redis) {
    try {
      await redis.setex(cacheKey, 3600, JSON.stringify(topSuggestions));
    } catch (error) {
      console.warn('Error caching top suggestions:', error);
    }
  }

  return topSuggestions;
}

/**
 * Invalidate top suggestions cache (call when suggestions are updated)
 */
export async function invalidateTopSuggestionsCache(): Promise<void> {
  const redis = getRedis();
  if (!redis) {
    return;
  }

  try {
    const keys = await redis.keys('top_suggestions:*');
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (error) {
    console.warn('Error invalidating cache:', error);
  }
}

/**
 * Feature or unfeature a suggestion
 */
export async function featureSuggestion(suggestionId: string, featured: boolean): Promise<void> {
  const suggestion = await prisma.productSuggestion.findUnique({
    where: { id: suggestionId },
    select: { metadata: true }
  });

  if (!suggestion) return;

  const currentMetadata = (suggestion.metadata as Record<string, any>) || {};

  await prisma.productSuggestion.update({
    where: { id: suggestionId },
    data: {
      metadata: {
        ...currentMetadata,
        featured
      }
    }
  });

  await invalidateTopSuggestionsCache();
}
