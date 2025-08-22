#!/usr/bin/env node

const fetch = require('node-fetch');

class VercelFetchManager {
  constructor() {
    this.baseUrl = process.env.VERCEL_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000';
    this.webhookSecret = process.env.WEBHOOK_SECRET || 'default_secret';
  }

  async triggerWebhook(options = {}) {
    const body = {
      secret: this.webhookSecret,
      action: 'fetch',
      limit: options.limit || 100,
      upsert: options.upsert !== undefined ? options.upsert : true,
      dateFrom: options.dateFrom,
      dateTo: options.dateTo,
      description: options.description || 'Vercel Script Triggered Fetch'
    };

    try {
      console.log('🔗 Triggering Vercel webhook...');
      console.log(`🌐 URL: ${this.baseUrl}/api/vercel-webhook`);
      
      const response = await fetch(`${this.baseUrl}/api/vercel-webhook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      
      const result = await response.json();
      
      if (result.success) {
        console.log('✅ Vercel webhook trigger successful');
        console.log(`📊 Result: ${result.message}`);
        if (result.result) {
          console.log(`📈 Saved: ${result.result.savedCount}, Updated: ${result.result.updatedCount}`);
        }
      } else {
        console.log('❌ Vercel webhook trigger failed:', result.message);
      }
      
      return result;
    } catch (error) {
      console.error('❌ Vercel webhook error:', error.message);
      throw error;
    }
  }

  async directFetch(options = {}) {
    const params = new URLSearchParams();
    params.append('limit', options.limit || '100');
    params.append('upsert', (options.upsert !== undefined ? options.upsert : true).toString());
    if (options.dateFrom) params.append('dateFrom', options.dateFrom);
    if (options.dateTo) params.append('dateTo', options.dateTo);
    params.append('description', options.description || 'Vercel Direct Fetch');

    try {
      console.log('🔄 Triggering direct fetch on Vercel...');
      console.log(`🌐 URL: ${this.baseUrl}/api/fetch-and-save`);
      
      const response = await fetch(`${this.baseUrl}/api/fetch-and-save?${params.toString()}`);
      const result = await response.json();
      
      if (result.success) {
        console.log('✅ Direct fetch successful');
        console.log(`📊 Saved: ${result.savedCount}, Updated: ${result.updatedCount}`);
      } else {
        console.log('❌ Direct fetch failed:', result.message);
      }
      
      return result;
    } catch (error) {
      console.error('❌ Direct fetch error:', error.message);
      throw error;
    }
  }

  async checkStatus() {
    try {
      console.log('📊 Checking Vercel deployment status...');
      
      const response = await fetch(`${this.baseUrl}/api/vercel-webhook`);
      const result = await response.json();
      
      console.log('✅ Vercel webhook endpoint is active');
      console.log(`🌐 Webhook URL: ${result.webhookUrl}`);
      console.log('📋 Usage:', result.usage);
      
      return result;
    } catch (error) {
      console.error('❌ Status check error:', error.message);
      throw error;
    }
  }

  async testConnection() {
    try {
      console.log('🔍 Testing Vercel connection...');
      
      const response = await fetch(`${this.baseUrl}/api/fetch-and-save?limit=1&description=Connection%20Test`);
      const result = await response.json();
      
      if (response.ok) {
        console.log('✅ Vercel connection successful');
        console.log(`📊 API Response: ${result.message}`);
      } else {
        console.log('❌ Vercel connection failed:', result.message);
      }
      
      return result;
    } catch (error) {
      console.error('❌ Connection test error:', error.message);
      throw error;
    }
  }
}

// CLI Interface
async function main() {
  const manager = new VercelFetchManager();
  const command = process.argv[2];
  const options = {};

  // Parse command line options
  for (let i = 3; i < process.argv.length; i++) {
    const arg = process.argv[i];
    if (arg.startsWith('--')) {
      const [key, value] = arg.slice(2).split('=');
      options[key] = value === 'true' ? true : value === 'false' ? false : value;
    }
  }

  try {
    switch (command) {
      case 'webhook':
        await manager.triggerWebhook(options);
        break;
        
      case 'fetch':
        await manager.directFetch(options);
        break;
        
      case 'status':
        await manager.checkStatus();
        break;
        
      case 'test':
        await manager.testConnection();
        break;
        
      default:
        console.log(`
🚀 Vercel Fetch Manager

Usage: node vercel-manage.js <command> [options]

Commands:
  webhook                 Trigger via Vercel webhook
  fetch                   Direct fetch on Vercel
  status                  Check Vercel deployment status
  test                    Test Vercel connection

Options:
  --limit=100            Number of records to fetch
  --upsert=true          Enable upsert mode
  --dateFrom=2024-01-01  Start date for fetch
  --dateTo=2024-01-31    End date for fetch
  --description=text     Custom description

Environment Variables:
  VERCEL_URL             Your Vercel deployment URL
  NEXTAUTH_URL           Your app URL
  WEBHOOK_SECRET         Webhook secret for security

Examples:
  node vercel-manage.js webhook --limit=50 --upsert=true
  node vercel-manage.js fetch --limit=100
  node vercel-manage.js status
  node vercel-manage.js test

For Vercel deployment:
  1. Set VERCEL_URL environment variable
  2. Set WEBHOOK_SECRET for security
  3. Deploy to Vercel
  4. Use webhook command to trigger fetches
        `);
    }
  } catch (error) {
    console.error('❌ Command failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = VercelFetchManager;
