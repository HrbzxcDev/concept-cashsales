# Vercel Deployment Guide for Alternative Approaches

This guide explains how to deploy and run the alternative approaches to cron jobs on Vercel.

## Overview

Vercel is a serverless platform, so some approaches work better than others:

✅ **Recommended for Vercel:**
- Webhook-based triggering
- Vercel Cron Jobs (modified)
- External service integration

❌ **Not suitable for Vercel:**
- Long-running polling
- Server-Sent Events (SSE)
- Persistent background processes

## 1. **Webhook-Based Approach (Primary Method)**

### Setup

1. **Deploy to Vercel:**
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Deploy
   vercel
   ```

2. **Set Environment Variables in Vercel Dashboard:**
   ```env
   # Required
   NEXTAUTH_URL=https://your-app.vercel.app
   NEXT_PUBLIC_API_BASE_URL=https://api.qne.cloud/api/CashSales
   NEXT_PUBLIC_DB_CODE=your_db_code_here
   DATABASE_URL=your_database_connection_string
   
   # Security
   WEBHOOK_SECRET=your_secure_secret_here
   ```

3. **Test the Webhook:**
   ```bash
   # Set your Vercel URL
   export VERCEL_URL=https://your-app.vercel.app
   export WEBHOOK_SECRET=your_secure_secret_here
   
   # Test webhook
   npm run vercel:test
   npm run vercel:webhook -- --limit=10
   ```

### Trigger via External Services

#### GitHub Actions
```yaml
# .github/workflows/fetch-data.yml
name: Fetch Data
on:
  schedule:
    - cron: '0 20 * * *'  # Daily at 8 PM
  workflow_dispatch:  # Manual trigger

jobs:
  fetch:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Fetch
        run: |
          curl -X POST "https://your-app.vercel.app/api/vercel-webhook" \
            -H "Content-Type: application/json" \
            -d '{
              "secret": "${{ secrets.WEBHOOK_SECRET }}",
              "action": "fetch",
              "limit": 100,
              "upsert": true,
              "description": "GitHub Actions Triggered Fetch"
            }'
```

#### Zapier Integration
1. Create a Zapier account
2. Set up a trigger (schedule, webhook, etc.)
3. Add a webhook action pointing to: `https://your-app.vercel.app/api/vercel-webhook`
4. Configure the webhook body:
   ```json
   {
     "secret": "your_webhook_secret",
     "action": "fetch",
     "limit": 100,
     "upsert": true,
     "description": "Zapier Triggered Fetch"
   }
   ```

#### Slack/Discord Bot
```javascript
// Slack slash command
app.command('/fetch-data', async ({ command, ack, respond }) => {
  await ack();
  
  const response = await fetch('https://your-app.vercel.app/api/vercel-webhook', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      secret: process.env.WEBHOOK_SECRET,
      action: 'fetch',
      limit: 100,
      upsert: true,
      description: 'Slack Command Triggered Fetch'
    })
  });
  
  const result = await response.json();
  await respond(`Fetch completed: ${result.message}`);
});
```

## 2. **Modified Vercel Cron Jobs**

### Update vercel.json
```json
{
  "crons": [
    {
      "path": "/api/vercel-webhook",
      "schedule": "0 20 * * *"
    }
  ]
}
```

### Custom Cron Endpoint
```typescript
// app/api/cron/vercel-cron/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // This will be called by Vercel's cron system
    const baseUrl = process.env.NEXTAUTH_URL || process.env.VERCEL_URL;
    const response = await fetch(`${baseUrl}/api/fetch-and-save?limit=100&upsert=true&description=Vercel%20Cron%20Job`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    
    return NextResponse.json({
      success: true,
      message: 'Vercel cron job completed',
      result
    });
    
  } catch (error) {
    console.error('Vercel cron error:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
```

## 3. **Local Management Script for Vercel**

### Usage
```bash
# Install dependencies
npm install

# Set environment variables
export VERCEL_URL=https://your-app.vercel.app
export WEBHOOK_SECRET=your_secure_secret_here

# Test connection
npm run vercel:test

# Trigger webhook
npm run vercel:webhook -- --limit=50 --upsert=true

# Direct fetch
npm run vercel:fetch -- --limit=100

# Check status
npm run vercel:status
```

### Advanced Usage
```bash
# Custom date range
npm run vercel:webhook -- --limit=200 --dateFrom=2024-01-01 --dateTo=2024-01-31 --description="Monthly Sync"

# Force upsert
npm run vercel:webhook -- --limit=100 --upsert=true --description="Force Update"

# Test with minimal data
npm run vercel:fetch -- --limit=1 --description="Connection Test"
```

## 4. **External Service Integration**

### IFTTT (If This Then That)
1. Create IFTTT account
2. Set up applet with webhook action
3. Configure webhook URL: `https://your-app.vercel.app/api/vercel-webhook`
4. Set webhook body:
   ```json
   {
     "secret": "your_webhook_secret",
     "action": "fetch",
     "limit": 100,
     "upsert": true,
     "description": "IFTTT Triggered Fetch"
   }
   ```

### Microsoft Power Automate
1. Create flow with HTTP action
2. Set method to POST
3. Set URL to: `https://your-app.vercel.app/api/vercel-webhook`
4. Set body:
   ```json
   {
     "secret": "your_webhook_secret",
     "action": "fetch",
     "limit": 100,
     "upsert": true,
     "description": "Power Automate Triggered Fetch"
   }
   ```

### Google Apps Script
```javascript
function triggerFetch() {
  const url = 'https://your-app.vercel.app/api/vercel-webhook';
  const payload = {
    secret: 'your_webhook_secret',
    action: 'fetch',
    limit: 100,
    upsert: true,
    description: 'Google Apps Script Triggered Fetch'
  };
  
  const options = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    payload: JSON.stringify(payload)
  };
  
  const response = UrlFetchApp.fetch(url, options);
  Logger.log(response.getContentText());
}

// Set up time-based trigger
function createTrigger() {
  ScriptApp.newTrigger('triggerFetch')
    .timeBased()
    .everyDays(1)
    .atHour(20)
    .create();
}
```

## 5. **Monitoring and Logging**

### Vercel Dashboard
- Check Function Logs in Vercel dashboard
- Monitor execution times and errors
- Set up alerts for failed executions

### Database Monitoring
```sql
-- Check recent activity
SELECT * FROM apifetched_table 
WHERE description LIKE '%Vercel%'
ORDER BY created_at DESC 
LIMIT 10;

-- Check success rate
SELECT 
  description,
  COUNT(*) as total_runs,
  SUM(CASE WHEN status = true THEN 1 ELSE 0 END) as successful_runs,
  ROUND(SUM(CASE WHEN status = true THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) as success_rate
FROM apifetched_table 
WHERE description LIKE '%Vercel%'
GROUP BY description;
```

### Health Check Endpoint
```typescript
// app/api/health/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/utils/db/drizzle';
import { apifetchedTable } from '@/utils/db/schema';
import { sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    // Check database connection
    const recentActivity = await db
      .select({ count: sql<number>`count(*)` })
      .from(apifetchedTable)
      .where(sql`${apifetchedTable.createdAt} >= NOW() - INTERVAL '24 hours'`);
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
      recentActivity: recentActivity[0]?.count || 0,
      environment: process.env.NODE_ENV
    });
  } catch (error) {
    return NextResponse.json(
      { status: 'unhealthy', error: error.message },
      { status: 500 }
    );
  }
}
```

## 6. **Security Best Practices**

### Environment Variables
- Never commit secrets to Git
- Use Vercel's environment variable system
- Rotate secrets regularly

### Webhook Security
```typescript
// Enhanced webhook validation
function validateWebhook(request: NextRequest) {
  const signature = request.headers.get('x-webhook-signature');
  const body = await request.text();
  const expectedSignature = crypto
    .createHmac('sha256', process.env.WEBHOOK_SECRET)
    .update(body)
    .digest('hex');
    
  return signature === expectedSignature;
}
```

### Rate Limiting
```typescript
// Add rate limiting to webhook endpoint
import { rateLimit } from '@/lib/rate-limit';

const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500
});

export async function POST(request: NextRequest) {
  try {
    await limiter.check(request, 10, 'WEBHOOK'); // 10 requests per minute
    // ... rest of webhook logic
  } catch {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }
}
```

## 7. **Troubleshooting**

### Common Issues

1. **Function Timeout:**
   - Vercel functions have a 10-second timeout limit
   - Optimize your fetch-and-save function
   - Consider breaking large operations into smaller chunks

2. **Cold Starts:**
   - First request may be slow
   - Use Vercel's cron jobs to keep functions warm
   - Consider using edge functions for faster response

3. **Database Connection:**
   - Ensure database is accessible from Vercel
   - Use connection pooling
   - Check database credentials

### Debug Commands
```bash
# Test webhook endpoint
curl -X POST "https://your-app.vercel.app/api/vercel-webhook" \
  -H "Content-Type: application/json" \
  -d '{"secret":"test","action":"fetch","limit":1}'

# Check health
curl "https://your-app.vercel.app/api/health"

# View logs
vercel logs your-app-name
```

## 8. **Migration Checklist**

- [ ] Deploy to Vercel
- [ ] Set environment variables
- [ ] Test webhook endpoint
- [ ] Set up external triggers (GitHub Actions, Zapier, etc.)
- [ ] Configure monitoring and alerts
- [ ] Update documentation
- [ ] Test all scenarios
- [ ] Monitor performance

## 9. **Performance Optimization**

### Function Optimization
- Minimize dependencies
- Use edge functions where possible
- Implement proper error handling
- Add request/response caching

### Database Optimization
- Use connection pooling
- Implement query optimization
- Add database indexes
- Monitor query performance

### Monitoring
- Set up Vercel analytics
- Monitor function execution times
- Track error rates
- Set up alerts for failures
