# Automation Setup for Fetch-and-Save Operation

This guide explains how to set up automatic execution of the fetch-and-save API operation.

## Overview

The fetch-and-save operation fetches data from an external API and saves it to your database. This can be automated in several ways:

## Method 1: Vercel Cron Jobs (Recommended for Production)

### Setup

1. **Deploy to Vercel**: Make sure your app is deployed to Vercel
2. **Configure Environment Variables**: Set these in your Vercel dashboard:

   - `NEXT_PUBLIC_API_BASE_URL`
   - `NEXT_PUBLIC_DB_CODE`
   - `NEXTAUTH_URL`

3. **Cron Job Configuration**: The `vercel.json` file is already configured to run the cron job every hour.

### How it Works

- The cron job runs at `/api/cron/fetch-data` every hour
- It internally calls your `/api/fetch-and-save` endpoint
- Logs are available in Vercel dashboard

### Customize Schedule

Edit `vercel.json` to change the schedule:

```json
{
  "crons": [
    {
      "path": "/api/cron/fetch-data",
      "schedule": "0 */2 * * *" // Every 2 hours
    }
  ]
}
```

## Method 2: Local Node.js Cron (Development/Testing)

### Prerequisites

- Node.js installed
- Dependencies installed: `npm install`

### Quick Start

#### Windows

```bash
# Option 1: Using batch file
start-cron.bat

# Option 2: Using PowerShell
.\start-cron.ps1

# Option 3: Direct npm command
npm run cron:start
```

#### Mac/Linux

```bash
npm run cron:start
```

### Development Mode (Auto-restart on changes)

```bash
npm run cron:dev
```

### Customize Schedule

Edit `scripts/init-cron.ts` to change the schedule:

```typescript
// Available schedules in CRON_SCHEDULES:
EVERY_MINUTE: '* * * * *';
EVERY_5_MINUTES: '*/5 * * * *';
EVERY_10_MINUTES: '*/10 * * * *';
EVERY_30_MINUTES: '*/30 * * * *';
EVERY_HOUR: '0 * * * *';
EVERY_DAY_AT_MIDNIGHT: '0 0 * * *';
EVERY_DAY_AT_6AM: '0 6 * * *';
EVERY_WEEK: '0 0 * * 0';

// Example: Change to every 30 minutes
cronService.scheduleJob({
  name: 'fetch-and-save-data',
  schedule: CRON_SCHEDULES.EVERY_30_MINUTES,
  task: fetchAndSaveData
});
```

## Method 3: System Cron (Linux/Mac)

### Setup

1. Create a script file:

```bash
#!/bin/bash
cd /path/to/your/project
curl -X GET "http://localhost:3000/api/fetch-and-save?limit=100&upsert=true"
```

2. Make it executable:

```bash
chmod +x /path/to/script.sh
```

3. Add to crontab:

```bash
crontab -e
# Add this line to run every hour:
0 * * * * /path/to/script.sh
```

## Method 4: Windows Task Scheduler

### Setup

1. Open Task Scheduler
2. Create Basic Task
3. Set trigger (e.g., every hour)
4. Set action to run:

```cmd
npm run cron:start
```

## Method 5: Docker with Cron

### Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Install cron
RUN apk add --no-cache dcron

# Copy cron script
COPY docker-cron.sh /docker-cron.sh
RUN chmod +x /docker-cron.sh

# Add cron job
RUN echo "0 * * * * /docker-cron.sh" > /etc/crontabs/root

CMD ["crond", "-f", "-d", "8"]
```

### docker-cron.sh

```bash
#!/bin/sh
cd /app
curl -X GET "http://localhost:3000/api/fetch-and-save?limit=100&upsert=true"
```

## Environment Variables

Make sure these are set in your environment:

```env
NEXT_PUBLIC_API_BASE_URL=https://dev-api.qne.cloud/api/CashSales
NEXT_PUBLIC_DB_CODE=your_db_code_here
NEXTAUTH_URL=http://localhost:3000
```

## Monitoring and Logs

### Local Development

- Check console output for job execution logs
- Logs show start time, completion, and any errors

### Vercel Production

- Check Vercel dashboard for function logs
- Monitor function execution times and errors

### Custom Logging

You can add custom logging by modifying the cron service:

```typescript
// In lib/cron-service.ts
const job = cron.schedule(schedule, async () => {
  const startTime = new Date();
  console.log(`[${startTime.toISOString()}] Starting: ${name}`);

  try {
    await task();
    const endTime = new Date();
    const duration = endTime.getTime() - startTime.getTime();
    console.log(
      `[${endTime.toISOString()}] Completed: ${name} (${duration}ms)`
    );
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in ${name}:`, error);
  }
});
```

## Troubleshooting

### Common Issues

1. **API Connection Errors**

   - Check `NEXT_PUBLIC_API_BASE_URL` is correct
   - Verify `NEXT_PUBLIC_DB_CODE` is set
   - Test API endpoint manually

2. **Database Connection Errors**

   - Ensure database is running
   - Check database credentials
   - Verify schema is up to date

3. **Cron Job Not Running**

   - Check if the service is started
   - Verify schedule syntax
   - Check for errors in logs

4. **Memory Issues**
   - Monitor memory usage
   - Consider reducing batch size
   - Add error handling for large datasets

### Debug Mode

Run with additional logging:

```bash
DEBUG=* npm run cron:start
```

## Security Considerations

1. **API Keys**: Store sensitive data in environment variables
2. **Rate Limiting**: Be mindful of external API rate limits
3. **Error Handling**: Implement proper error handling and retry logic
4. **Monitoring**: Set up alerts for failed jobs

## Performance Optimization

1. **Batch Size**: Adjust the `limit` parameter based on your needs
2. **Upsert Mode**: Use `upsert=true` to avoid duplicates
3. **Date Filtering**: Use `dateFrom` and `dateTo` parameters to limit data
4. **Concurrent Jobs**: Avoid running multiple instances simultaneously

## Testing

Test the automation manually:

```bash
# Test the API endpoint directly
curl "http://localhost:3000/api/fetch-and-save?limit=10&upsert=true"

# Test the cron endpoint
curl "http://localhost:3000/api/cron/fetch-data"
```
