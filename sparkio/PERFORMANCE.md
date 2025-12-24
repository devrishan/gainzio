# Performance Optimization Guide

## Database Optimization

### Indexes

The Prisma schema includes indexes on commonly queried fields. Additional indexes can be added via migrations:

```prisma
// Example: Add composite index for task submissions
model TaskSubmission {
  // ... fields
  @@index([userId, status])
  @@index([taskId, status])
  @@index([submittedAt])
}
```

### Query Optimization Tips

1. **Use `select` to limit fields**: Only fetch fields you need
   ```typescript
   await prisma.user.findUnique({
     where: { id: userId },
     select: { id: true, username: true, phone: true },
   });
   ```

2. **Use `include` judiciously**: Only include relations you need
   ```typescript
   await prisma.user.findUnique({
     where: { id: userId },
     include: { wallet: true }, // Only if needed
   });
   ```

3. **Batch queries**: Use `Promise.all` for independent queries
   ```typescript
   const [user, wallet, referrals] = await Promise.all([
     prisma.user.findUnique({ where: { id: userId } }),
     prisma.wallet.findUnique({ where: { userId } }),
     prisma.referral.findMany({ where: { referrerId: userId } }),
   ]);
   ```

4. **Use pagination**: Always paginate large result sets
   ```typescript
   await prisma.taskSubmission.findMany({
     take: 20,
     skip: (page - 1) * 20,
   });
   ```

5. **Use transactions**: Group related writes
   ```typescript
   await prisma.$transaction([
     prisma.wallet.update({ ... }),
     prisma.transaction.create({ ... }),
   ]);
   ```

## Redis Caching

### Cache Strategy

1. **Cache hot data**: Leaderboards, top suggestions, user profiles
2. **Cache expensive queries**: Dashboard aggregations, statistics
3. **Invalidate on updates**: Clear cache when data changes

### Usage Example

```typescript
import { Cache, CacheKeys } from '@/lib/cache';

// Get or set with cache
const user = await Cache.getOrSet(
  CacheKeys.user(userId),
  () => prisma.user.findUnique({ where: { id: userId } }),
  3600, // 1 hour TTL
);

// Invalidate on update
await prisma.user.update({ where: { id: userId }, data: { ... } });
await Cache.delete(CacheKeys.user(userId));
```

## API Response Times

### Target Performance

- **P95 Response Time**: <200ms
- **Leaderboard Queries**: <100ms
- **Image Uploads**: <2s for 5MB files
- **Database Queries**: <50ms for simple queries

### Monitoring

Use the `measurePerformance` utility to track slow operations:

```typescript
import { measurePerformance } from '@/lib/performance';

const result = await measurePerformance(
  'fetchUserDashboard',
  () => fetchDashboardData(userId),
  { userId },
);
```

## Image Optimization

1. **Compress images**: Use sharp or similar for server-side compression
2. **Generate thumbnails**: Create multiple sizes for different use cases
3. **Use WebP format**: Better compression than JPEG/PNG
4. **Lazy load**: Load images only when needed

## CDN Configuration

1. **Static assets**: Serve from CDN (Next.js static files)
2. **S3 uploads**: Use CloudFront or similar for S3 files
3. **Cache headers**: Set appropriate cache headers

## Load Testing

Use tools like:
- **k6**: Load testing
- **Artillery**: API load testing
- **Apache Bench**: Simple HTTP benchmarking

Example k6 script:

```javascript
import http from 'k6/http';
import { check } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 100 },
    { duration: '1m', target: 200 },
    { duration: '30s', target: 0 },
  ],
};

export default function () {
  const res = http.get('https://api.example.com/api/tasks');
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 200ms': (r) => r.timings.duration < 200,
  });
}
```

## Monitoring

1. **Error tracking**: Use Sentry or similar
2. **Performance monitoring**: Use APM tools (New Relic, Datadog)
3. **Database monitoring**: Monitor slow queries, connection pools
4. **Redis monitoring**: Monitor memory usage, hit rates

## Best Practices

1. **Database connection pooling**: Configure Prisma connection pool
2. **Redis connection pooling**: Reuse Redis connections
3. **Async operations**: Use background jobs for heavy operations
4. **Rate limiting**: Prevent abuse and ensure fair resource usage
5. **Compression**: Enable gzip/brotli compression
6. **HTTP/2**: Use HTTP/2 for better multiplexing

