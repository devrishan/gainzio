# CDN Configuration Guide

This guide explains how to set up a Content Delivery Network (CDN) for the Earniq platform to improve performance and reduce server load.

## Why Use a CDN?

- **Faster Load Times**: Serve static assets from edge locations closer to users
- **Reduced Server Load**: Offload static file serving from your application server
- **Better Security**: DDoS protection and security features
- **Cost Savings**: Reduce bandwidth costs

## Recommended CDN Providers

### 1. Cloudflare (Recommended for Startups)

**Pros:**
- Free tier available
- Easy setup
- DDoS protection included
- Automatic SSL
- Good performance

**Setup Steps:**

1. Sign up at [cloudflare.com](https://cloudflare.com)
2. Add your domain
3. Update DNS nameservers
4. Configure caching rules:
   - Cache static assets (images, CSS, JS) for 1 year
   - Cache API responses for 0 seconds (or use cache-control headers)
5. Enable "Auto Minify" for CSS, JavaScript, HTML
6. Enable "Brotli" compression

**Configuration:**

```javascript
// next.config.js
module.exports = {
  images: {
    domains: ['your-cloudflare-domain.com'],
    loader: 'custom',
    loaderFile: './lib/image-loader.js',
  },
};
```

### 2. AWS CloudFront (If Using AWS)

**Pros:**
- Integrated with S3
- Good for AWS ecosystem
- Pay-as-you-go pricing

**Setup Steps:**

1. Create CloudFront distribution
2. Set origin to your S3 bucket (for static assets)
3. Set origin to your Next.js app (for dynamic content)
4. Configure caching behaviors:
   - Static assets: Cache for 1 year
   - API routes: No cache
   - Pages: Cache with revalidation
5. Enable compression
6. Configure custom domain and SSL certificate

**S3 + CloudFront Setup:**

```typescript
// Update S3 upload to use CloudFront URL
export function getCloudFrontUrl(key: string): string {
  const distributionDomain = process.env.CLOUDFRONT_DOMAIN;
  return `https://${distributionDomain}/${key}`;
}
```

### 3. Vercel Edge Network (If Deploying on Vercel)

**Pros:**
- Built-in with Vercel
- Automatic optimization
- Zero configuration

**Setup:**
- Deploy to Vercel
- Edge network is automatically enabled
- Configure in `vercel.json`:

```json
{
  "headers": [
    {
      "source": "/static/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

## Image Optimization

### Next.js Image Component

Use Next.js Image component for automatic optimization:

```tsx
import Image from 'next/image';

<Image
  src={imageUrl}
  alt="Product"
  width={500}
  height={500}
  loading="lazy"
  placeholder="blur"
/>
```

### Client-Side Image Compression

Before uploading to S3, compress images on the client:

```typescript
// Install: npm install browser-image-compression
import imageCompression from 'browser-image-compression';

async function compressImage(file: File): Promise<File> {
  const options = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
  };
  return await imageCompression(file, options);
}
```

### Server-Side Image Processing (Optional)

For advanced scenarios, use Sharp:

```bash
npm install sharp
```

```typescript
import sharp from 'sharp';

async function processImage(buffer: Buffer): Promise<Buffer> {
  return await sharp(buffer)
    .resize(1920, 1080, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 80 })
    .toBuffer();
}
```

## Static Asset Caching

### Next.js Static Assets

Next.js automatically optimizes and caches static assets. Ensure proper cache headers:

```typescript
// middleware.ts or next.config.js
export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  if (request.nextUrl.pathname.startsWith('/_next/static')) {
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  }
  
  return response;
}
```

### S3 Uploaded Files

Configure S3 bucket for CloudFront:

1. Enable static website hosting (optional)
2. Set bucket policy for CloudFront access
3. Configure CloudFront origin access identity
4. Set cache-control headers on upload:

```typescript
const command = new PutObjectCommand({
  Bucket: BUCKET_NAME,
  Key: key,
  Body: file,
  ContentType: contentType,
  CacheControl: 'public, max-age=31536000, immutable', // 1 year
});
```

## API Response Caching

### Redis Caching

Already implemented for:
- Leaderboards (5 minutes)
- Top suggestions (1 hour)

### HTTP Cache Headers

Set appropriate cache headers for API responses:

```typescript
// For cacheable responses
response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');

// For private responses
response.headers.set('Cache-Control', 'private, no-cache');
```

## Monitoring CDN Performance

### Key Metrics

- **Cache Hit Ratio**: Should be >80% for static assets
- **Response Times**: P95 should be <100ms from CDN
- **Bandwidth Savings**: Track bandwidth saved by CDN
- **Error Rates**: Monitor 4xx/5xx errors

### Tools

- Cloudflare Analytics
- AWS CloudWatch (for CloudFront)
- Google Analytics (for user-side metrics)

## Implementation Checklist

- [ ] Choose CDN provider
- [ ] Set up CDN distribution
- [ ] Configure DNS
- [ ] Set up SSL certificate
- [ ] Configure caching rules
- [ ] Update image URLs to use CDN
- [ ] Enable compression
- [ ] Set up monitoring
- [ ] Test CDN performance
- [ ] Document CDN configuration

## Best Practices

1. **Cache Static Assets Aggressively**: Images, CSS, JS should be cached for 1 year
2. **Don't Cache API Responses**: Use Redis for API caching instead
3. **Use CDN for S3 Files**: Serve uploaded files through CDN
4. **Enable Compression**: Gzip/Brotli compression
5. **Optimize Images**: Use WebP format, appropriate sizes
6. **Monitor Performance**: Track cache hit rates and response times

