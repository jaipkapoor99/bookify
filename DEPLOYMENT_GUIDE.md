# Deployment Guide

This guide covers deploying Bookify to production environments, including setup for various hosting platforms and best practices.

## 🚀 Quick Deployment Options

### Option 1: Vercel (Recommended)

- **Pros**: Zero-config deployment, automatic HTTPS, global CDN
- **Cons**: Serverless limitations for complex backends
- **Best for**: Frontend-heavy applications with Supabase backend

### Option 2: Netlify

- **Pros**: Easy setup, built-in CI/CD, form handling
- **Cons**: Build time limitations on free tier
- **Best for**: Static sites with JAMstack architecture

### Option 3: AWS Amplify

- **Pros**: AWS integration, scalable, full-stack capabilities
- **Cons**: More complex setup, AWS-specific
- **Best for**: Enterprise applications requiring AWS services

### Option 4: DigitalOcean App Platform

- **Pros**: Simple setup, integrated with DO services
- **Cons**: Limited global presence
- **Best for**: Medium-scale applications

## 🔧 Pre-Deployment Setup

### 1. Environment Variables

Create production environment variables:

```env
# Supabase Configuration
VITE_SUPABASE_URL="https://your-project.supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-key"

# Optional: For analytics or monitoring
VITE_ANALYTICS_ID="your-analytics-id"
VITE_SENTRY_DSN="your-sentry-dsn"
```

### 2. Supabase Production Setup

#### Database Configuration

1. **Create Production Project**

   ```bash
   # Create new Supabase project
   supabase projects create "booking-platform-prod"
   ```

2. **Run Migrations**

   ```bash
   # Link to production project
   supabase link --project-ref your-project-ref

   # Push migrations
   supabase db push
   ```

3. **Set up RLS Policies**
   ```sql
   -- Run in Supabase SQL Editor
   -- Enable RLS on all tables
   ALTER TABLE events ENABLE ROW LEVEL SECURITY;
   ALTER TABLE venues ENABLE ROW LEVEL SECURITY;
   ALTER TABLE events_venues ENABLE ROW LEVEL SECURITY;
   ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
   ALTER TABLE users ENABLE ROW LEVEL SECURITY;
   ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
   ```

#### Authentication Setup

1. **Configure OAuth Providers**

   - Go to Authentication > Providers in Supabase dashboard
   - Enable Google OAuth
   - Add production URLs to redirect URLs

2. **Set up Email Templates**
   - Customize email templates in Authentication > Email Templates
   - Update URLs to production domain

#### Storage Configuration

1. **Create Storage Buckets**

   ```sql
   -- Create event-images bucket
   INSERT INTO storage.buckets (id, name, public)
   VALUES ('event-images', 'event-images', true);
   ```

2. **Set up Storage Policies**

   ```sql
   -- Allow public read access
   CREATE POLICY "Public Access" ON storage.objects
   FOR SELECT USING (bucket_id = 'event-images');

   -- Allow authenticated uploads
   CREATE POLICY "Authenticated Upload" ON storage.objects
   FOR INSERT TO authenticated
   WITH CHECK (bucket_id = 'event-images');
   ```

## 📦 Vercel Deployment (Detailed)

### 1. Connect Repository

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel
```

### 2. Environment Variables

Add in Vercel dashboard under Settings > Environment Variables:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Build Configuration

Create `vercel.json`:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist",
        "framework": "vite"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "functions": {
    "src/pages/api/*.ts": {
      "runtime": "@vercel/node"
    }
  }
}
```

### 4. Custom Domain Setup

1. Add domain in Vercel dashboard
2. Configure DNS records
3. SSL certificates are automatic

## 🌐 Netlify Deployment

### 1. Build Settings

```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

### 2. Environment Variables

Add in Netlify dashboard under Site settings > Environment variables:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Deploy

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod --dir=dist
```

## ☁️ AWS Amplify Deployment

### 1. AWS Amplify Setup

```bash
# Install AWS CLI and Amplify CLI
npm install -g @aws-amplify/cli

# Configure AWS credentials
aws configure

# Initialize Amplify
amplify init
```

### 2. Build Configuration

Create `amplify.yml`:

```yaml
version: 1
backend:
  phases:
    build:
      commands:
        - "# Execute Amplify CLI with the helper script"
        - amplifyPush --simple
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: dist
    files:
      - "**/*"
  cache:
    paths:
      - node_modules/**/*
```

### 3. Environment Variables

```bash
# Add environment variables
amplify env add prod
amplify env checkout prod
```

## 🔐 Security Best Practices

### 1. Environment Variables

- Never commit `.env` files to version control
- Use different keys for development and production
- Rotate API keys regularly

### 2. CORS Configuration

Configure CORS in Supabase:

```sql
-- Allow your production domain
INSERT INTO auth.cors_domains (domain) VALUES ('https://yourdomain.com');
```

### 3. CSP Headers

Add Content Security Policy headers:

```typescript
// For Vercel, add to vercel.json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://*.supabase.co;"
        }
      ]
    }
  ]
}
```

### 4. Rate Limiting

Configure rate limiting in Supabase dashboard:

- API Gateway settings
- Database connection limits
- Authentication rate limits

## 📊 Monitoring and Analytics

### 1. Error Tracking

Set up Sentry for error monitoring:

```bash
# Install Sentry
npm install @sentry/react @sentry/vite-plugin
```

```typescript
// src/main.tsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
});
```

### 2. Performance Monitoring

Add performance monitoring:

```typescript
// Web Vitals tracking
import { getCLS, getFID, getFCP, getLCP, getTTFB } from "web-vitals";

function sendToAnalytics(metric) {
  // Send to your analytics service
  console.log(metric);
}

getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getFCP(sendToAnalytics);
getLCP(sendToAnalytics);
getTTFB(sendToAnalytics);
```

### 3. Uptime Monitoring

Set up monitoring services:

- **UptimeRobot**: Free uptime monitoring
- **Pingdom**: Advanced monitoring with alerts
- **New Relic**: Full-stack monitoring

## 🚀 Performance Optimization

### 1. Build Optimization

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          supabase: ["@supabase/supabase-js"],
          ui: ["@radix-ui/react-dialog", "@radix-ui/react-dropdown-menu"],
        },
      },
    },
  },
});
```

### 2. Image Optimization

```typescript
// Use optimized image loading
const ImageWithFallback = ({ src, alt, ...props }) => {
  return <img src={src} alt={alt} loading="lazy" decoding="async" {...props} />;
};
```

### 3. Database Optimization

```sql
-- Add indexes for performance
CREATE INDEX CONCURRENTLY idx_events_venues_date
ON events_venues(event_venue_date);

CREATE INDEX CONCURRENTLY idx_tickets_created_at
ON tickets(created_at);
```

## 🔄 CI/CD Pipeline

### GitHub Actions Example

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: "18"

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test

      - name: Build
        run: npm run build
        env:
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: "--prod"
```

## 🧪 Testing in Production

### 1. Health Checks

Create health check endpoints:

```typescript
// src/api/health.ts
export async function healthCheck() {
  try {
    const { data, error } = await supabase
      .from("events")
      .select("count")
      .limit(1);

    return {
      status: "healthy",
      database: error ? "unhealthy" : "healthy",
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      status: "unhealthy",
      error: error.message,
      timestamp: new Date().toISOString(),
    };
  }
}
```

### 2. Smoke Tests

```bash
# Run smoke tests after deployment
curl -f https://yourdomain.com/api/health || exit 1
```

## 📋 Post-Deployment Checklist

### Essential Checks

- [ ] All environment variables configured
- [ ] Database migrations applied
- [ ] RLS policies enabled
- [ ] OAuth providers configured
- [ ] Custom domain configured with SSL
- [ ] Error tracking enabled
- [ ] Performance monitoring active
- [ ] Backup strategy implemented

### Performance Checks

- [ ] Lighthouse score > 90
- [ ] First Contentful Paint < 2s
- [ ] Time to Interactive < 3s
- [ ] Cumulative Layout Shift < 0.1

### Security Checks

- [ ] HTTPS enforced
- [ ] Security headers configured
- [ ] API keys rotated
- [ ] CORS properly configured
- [ ] Rate limiting enabled

## 🔧 Troubleshooting

### Common Issues

#### 1. Build Failures

```bash
# Clear cache and rebuild
rm -rf node_modules package-lock.json dist
npm install
npm run build
```

#### 2. Environment Variables Not Loading

- Check variable names match exactly
- Ensure variables are prefixed with `VITE_`
- Restart development server after changes

#### 3. Supabase Connection Issues

- Verify URL and API key
- Check CORS configuration
- Ensure RLS policies are correct

#### 4. OAuth Issues

- Verify redirect URLs
- Check provider configuration
- Ensure site URL is correct in Supabase

### Monitoring Commands

```bash
# Check deployment status
vercel inspect your-deployment-url

# View logs
vercel logs your-deployment-url

# Check build output
vercel build --debug
```

## 📞 Support and Maintenance

### Regular Tasks

- **Weekly**: Check error logs and performance metrics
- **Monthly**: Update dependencies and security patches
- **Quarterly**: Review and optimize database performance
- **Annually**: Rotate API keys and review security settings

### Backup Strategy

- **Database**: Automated daily backups via Supabase
- **Storage**: Regular exports of image assets
- **Code**: Version control with Git
- **Configuration**: Document all environment variables

This deployment guide provides comprehensive instructions for deploying Bookify to production. Choose the deployment option that best fits your needs and follow the security best practices to ensure a robust production environment.
