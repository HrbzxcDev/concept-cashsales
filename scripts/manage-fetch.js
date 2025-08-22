#!/usr/bin/env node

const fetch = require('node-fetch');

const BASE_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000';

class FetchManager {
  constructor() {
    this.isPolling = false;
    this.pollingInterval = null;
    this.config = {
      interval: 3600000, // 1 hour
      limit: 100,
      upsert: true,
      description: 'Script Managed Fetch'
    };
  }

  async manualFetch(options = {}) {
    const params = new URLSearchParams();
    params.append('limit', options.limit || this.config.limit);
    params.append('upsert', (options.upsert !== undefined ? options.upsert : this.config.upsert).toString());
    if (options.dateFrom) params.append('dateFrom', options.dateFrom);
    if (options.dateTo) params.append('dateTo', options.dateTo);
    params.append('description', options.description || this.config.description);

    try {
      console.log('🔄 Triggering manual fetch...');
      const response = await fetch(`${BASE_URL}/api/fetch-and-save?${params.toString()}`);
      const result = await response.json();
      
      if (result.success) {
        console.log('✅ Fetch completed successfully');
        console.log(`📊 Saved: ${result.savedCount}, Updated: ${result.updatedCount}`);
      } else {
        console.log('❌ Fetch failed:', result.message);
      }
      
      return result;
    } catch (error) {
      console.error('❌ Error during fetch:', error.message);
      throw error;
    }
  }

  async startPolling(options = {}) {
    if (this.isPolling) {
      console.log('⚠️  Polling is already active');
      return;
    }

    this.config = { ...this.config, ...options };
    
    console.log(`🔄 Starting polling with ${this.config.interval / 1000 / 60} minute interval...`);
    
    this.isPolling = true;
    this.pollingInterval = setInterval(async () => {
      try {
        await this.manualFetch();
      } catch (error) {
        console.error('❌ Polling error:', error.message);
      }
    }, this.config.interval);

    // Trigger initial fetch
    await this.manualFetch();
  }

  stopPolling() {
    if (!this.isPolling) {
      console.log('⚠️  Polling is not active');
      return;
    }

    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }

    this.isPolling = false;
    console.log('🛑 Polling stopped');
  }

  async webhookTrigger(options = {}) {
    const body = {
      secret: process.env.WEBHOOK_SECRET || 'default_secret',
      action: 'fetch',
      limit: options.limit || this.config.limit,
      upsert: options.upsert !== undefined ? options.upsert : this.config.upsert,
      dateFrom: options.dateFrom,
      dateTo: options.dateTo,
      description: options.description || 'Script Webhook Trigger'
    };

    try {
      console.log('🔗 Triggering via webhook...');
      const response = await fetch(`${BASE_URL}/api/webhook/trigger-fetch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      
      const result = await response.json();
      
      if (result.success) {
        console.log('✅ Webhook trigger successful');
      } else {
        console.log('❌ Webhook trigger failed:', result.message);
      }
      
      return result;
    } catch (error) {
      console.error('❌ Webhook error:', error.message);
      throw error;
    }
  }

  async eventDrivenTrigger(options = {}) {
    const body = {
      force: options.force || false,
      limit: options.limit || this.config.limit,
      upsert: options.upsert !== undefined ? options.upsert : this.config.upsert
    };

    try {
      console.log('🎯 Triggering event-driven fetch...');
      const response = await fetch(`${BASE_URL}/api/event-driven/check-and-fetch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      
      const result = await response.json();
      
      if (result.success) {
        console.log('✅ Event-driven trigger successful');
      } else {
        console.log('❌ Event-driven trigger failed:', result.message);
      }
      
      return result;
    } catch (error) {
      console.error('❌ Event-driven error:', error.message);
      throw error;
    }
  }

  async getStatus() {
    try {
      const response = await fetch(`${BASE_URL}/api/polling/fetch-controller?action=status`);
      const result = await response.json();
      
      console.log('📊 System Status:');
      console.log(`   Polling Active: ${result.isPolling ? 'Yes' : 'No'}`);
      console.log(`   Next Trigger: ${result.nextTrigger || 'N/A'}`);
      console.log(`   Config:`, result.config);
      
      return result;
    } catch (error) {
      console.error('❌ Status check error:', error.message);
      throw error;
    }
  }
}

// CLI Interface
async function main() {
  const manager = new FetchManager();
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
      case 'fetch':
        await manager.manualFetch(options);
        break;
        
      case 'poll':
        if (options.stop) {
          manager.stopPolling();
        } else {
          await manager.startPolling(options);
        }
        break;
        
      case 'webhook':
        await manager.webhookTrigger(options);
        break;
        
      case 'event':
        await manager.eventDrivenTrigger(options);
        break;
        
      case 'status':
        await manager.getStatus();
        break;
        
      default:
        console.log(`
📋 Fetch Manager - Alternative to Cron Jobs

Usage: node manage-fetch.js <command> [options]

Commands:
  fetch                    Manual fetch with optional parameters
  poll                     Start/stop polling
  webhook                  Trigger via webhook
  event                    Trigger event-driven fetch
  status                   Get system status

Options:
  --limit=100             Number of records to fetch
  --upsert=true           Enable upsert mode
  --interval=3600000      Polling interval in milliseconds
  --dateFrom=2024-01-01   Start date for fetch
  --dateTo=2024-01-31     End date for fetch
  --description=text      Custom description
  --force=true            Force trigger (bypass conditions)
  --stop                  Stop polling (with poll command)

Examples:
  node manage-fetch.js fetch --limit=50 --upsert=true
  node manage-fetch.js poll --interval=1800000 --limit=100
  node manage-fetch.js poll --stop
  node manage-fetch.js webhook --limit=200
  node manage-fetch.js event --force=true
  node manage-fetch.js status
        `);
    }
  } catch (error) {
    console.error('❌ Command failed:', error.message);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down...');
  if (global.manager) {
    global.manager.stopPolling();
  }
  process.exit(0);
});

if (require.main === module) {
  main();
}

module.exports = FetchManager;
