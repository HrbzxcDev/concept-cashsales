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
   - `DATABASE_URL`

3. **Authentication Variables** (if your API requires authentication):

   - `API_KEY` or `NEXT_PUBLIC_API_KEY` - For API key authentication
   - `CRON_SECRET` - For cron-specific secret token
   - `SESSION_TOKEN` - For session-based authentication
   - `BASIC_AUTH_USERNAME` and `BASIC_AUTH_PASSWORD` - For basic authentication
   - `CUSTOM_AUTH_HEADER` and `CUSTOM_AUTH_VALUE` - For custom authentication headers

4. **Cron Job Configuration**: The `vercel.json` file is already configured to run the cron job daily at 8:00 PM.

### How it Works

- The cron job runs at `/api/cron/fetch-data` daily at 8:00 PM (20:00)
- It internally calls your `/api/fetch-and-save` endpoint with authentication headers
- Logs are available in Vercel dashboard
- Activity is tracked in the database

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
curl -X GET "http://localhost:3000/api/cron/fetch-data"
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
curl -X GET "http://localhost:3000/api/cron/fetch-data"
```

## Environment Variables

Make sure these are set in your environment:

### Required Variables

```env
NEXT_PUBLIC_API_BASE_URL=https://dev-api.qne.cloud/api/CashSales
NEXT_PUBLIC_DB_CODE=your_db_code_here
DATABASE_URL=your_database_connection_string
NEXTAUTH_URL=http://localhost:3000
```

### Authentication Variables (if needed)

```env
# API Key Authentication
API_KEY=your_api_key_here
# OR
NEXT_PUBLIC_API_KEY=your_api_key_here

# Cron Secret Token
CRON_SECRET=your_cron_secret_here

# Session Token
SESSION_TOKEN=your_session_token_here

# Basic Authentication
BASIC_AUTH_USERNAME=your_username
BASIC_AUTH_PASSWORD=your_password

# Custom Authentication Headers
CUSTOM_AUTH_HEADER=X-Custom-Auth
CUSTOM_AUTH_VALUE=your_custom_auth_value
```

## Monitoring and Logs

### Local Development

- Check console output for job execution logs
- Logs show start time, completion, and any errors

### Vercel Production

- Check Vercel dashboard for function logs
- Monitor function execution times and errors
- Check database activity table for operation history

### Custom Logging

The cron endpoint automatically logs all activities to the database:

- Successful operations with record counts
- Failed operations with error messages
- No data scenarios

## Troubleshooting

### Common Issues

1. **Authentication Errors**

   - Check if your API requires authentication
   - Verify authentication environment variables are set
   - Test with different authentication methods:
     - API Key: Set `API_KEY` or `NEXT_PUBLIC_API_KEY`
     - Secret Token: Set `CRON_SECRET`
     - Basic Auth: Set `BASIC_AUTH_USERNAME` and `BASIC_AUTH_PASSWORD`
     - Custom Headers: Set `CUSTOM_AUTH_HEADER` and `CUSTOM_AUTH_VALUE`

2. **API Connection Errors**

   - Check `NEXT_PUBLIC_API_BASE_URL` is correct
   - Verify `NEXT_PUBLIC_DB_CODE` is set
   - Test API endpoint manually

3. **Database Connection Errors**

   - Ensure database is running
   - Check database credentials
   - Verify schema is up to date

4. **Cron Job Not Running**

   - Check if the service is started
   - Verify schedule syntax
   - Check for errors in logs

5. **Memory Issues**
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
5. **Authentication**: Use secure authentication methods and rotate keys regularly

## Performance Optimization

1. **Batch Size**: The cron job fetches 100 records by default
2. **Date Range**: Automatically fetches yesterday and today's data
3. **Error Handling**: Continues processing even if individual records fail
4. **Activity Tracking**: All operations are logged to the database

## Testing

Test the automation manually:

```bash
# Test the cron endpoint directly
curl "http://localhost:3000/api/cron/fetch-data"

# Test the regular API endpoint
curl "http://localhost:3000/api/fetch-and-save?limit=10&upsert=true"
```
