# Monitoring & Observability Guide

This document outlines monitoring strategies and tools for the Earniq platform.

## Error Tracking

### Recommended Tools

1. **Sentry** (Recommended)
   - Free tier available
   - Automatic error capture
   - Source map support
   - Performance monitoring

   Setup:
   ```bash
   npm install @sentry/nextjs
   ```

   Configuration in `sentry.client.config.ts` and `sentry.server.config.ts`

2. **Bugsnag**
   - Alternative to Sentry
   - Good for mobile apps

3. **Rollbar**
   - Another alternative
   - Good integration with Node.js

## Performance Monitoring

### Application Performance Monitoring (APM)

1. **New Relic**
   - Full-stack monitoring
   - Database query analysis
   - Custom metrics

2. **Datadog**
   - Infrastructure + APM
   - Log aggregation
   - Custom dashboards

3. **AWS CloudWatch** (if using AWS)
   - Built-in monitoring
   - Custom metrics
   - Alarms

### Key Metrics to Monitor

- **API Response Times**
  - P50, P95, P99 latencies
  - Endpoint-specific metrics
  - Database query times

- **Database Performance**
  - Slow query log
  - Connection pool usage
  - Query execution times

- **Redis Performance**
  - Memory usage
  - Hit/miss rates
  - Command latency

- **Server Resources**
  - CPU usage
  - Memory usage
  - Disk I/O
  - Network I/O

## Logging

### Structured Logging

Use a logging library like Winston or Pino:

```typescript
import pino from 'pino';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
    },
  },
});

// Usage
logger.info({ userId, action: 'task_submitted' }, 'Task submitted');
logger.error({ error, userId }, 'Failed to process withdrawal');
```

### Log Aggregation

1. **ELK Stack** (Elasticsearch, Logstash, Kibana)
   - Self-hosted
   - Full control

2. **Datadog Logs**
   - Managed service
   - Easy integration

3. **AWS CloudWatch Logs**
   - If using AWS
   - Integrated with other AWS services

## Health Checks

### Application Health Endpoint

Create `/api/health` endpoint:

```typescript
export async function GET() {
  const checks = {
    database: await checkDatabase(),
    redis: await checkRedis(),
    s3: await checkS3(),
  };

  const healthy = Object.values(checks).every((check) => check.status === 'ok');

  return NextResponse.json(
    {
      status: healthy ? 'healthy' : 'degraded',
      checks,
      timestamp: new Date().toISOString(),
    },
    { status: healthy ? 200 : 503 },
  );
}
```

### Uptime Monitoring

Use services like:
- **UptimeRobot** (free tier)
- **Pingdom**
- **StatusCake**

## Alerts

### Critical Alerts

1. **Error Rate Spike**
   - Alert if error rate > 5% for 5 minutes

2. **High Latency**
   - Alert if P95 latency > 500ms for 5 minutes

3. **Database Issues**
   - Alert on connection pool exhaustion
   - Alert on slow queries (>1s)

4. **Payment Failures**
   - Alert on payout failures
   - Alert on webhook failures

5. **Service Downtime**
   - Alert if health check fails

### Alert Channels

- Email
- Slack
- PagerDuty (for critical alerts)
- SMS (for critical alerts)

## Custom Metrics

Track business metrics:

- User registrations per day
- Task submissions per day
- Withdrawal requests per day
- Revenue per day
- Active users
- Conversion rates

## Dashboard

Create dashboards showing:

1. **System Health**
   - API response times
   - Error rates
   - Database performance
   - Redis performance

2. **Business Metrics**
   - User growth
   - Task completion rates
   - Revenue
   - Withdrawal processing times

3. **Error Dashboard**
   - Error frequency
   - Error types
   - Affected users

## Implementation Checklist

- [ ] Set up error tracking (Sentry/Bugsnag)
- [ ] Set up APM (New Relic/Datadog)
- [ ] Implement structured logging
- [ ] Set up log aggregation
- [ ] Create health check endpoint
- [ ] Set up uptime monitoring
- [ ] Configure alerts
- [ ] Create monitoring dashboards
- [ ] Document runbooks for common issues

