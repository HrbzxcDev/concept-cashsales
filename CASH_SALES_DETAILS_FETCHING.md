# Cash Sales Details Fetching

This document explains the enhanced cash sales details fetching functionality that has been integrated into the main cash sales fetching process.

## Overview

The system now supports fetching cash sales details based on date ranges, similar to how cash sales codes are fetched. This ensures that when you refresh cash sales data, the corresponding details are also fetched for the same date range.

## New Functions

### 1. `fetchAndSaveCashSalesDetailsByDate(dateFrom, dateTo, options)`

Fetches and saves cash sales details for a specific date range.

**Parameters:**
- `dateFrom` (string): Start date in YYYY-MM-DD format
- `dateTo` (string): End date in YYYY-MM-DD format
- `options` (object):
  - `upsert` (boolean): If true, update existing records instead of skipping
  - `batchSize` (number): Number of records to process in each batch (default: 10)
  - `limit` (number): Maximum number of cash sales codes to process

**Example:**
```typescript
import { fetchAndSaveCashSalesDetailsByDate } from '@/actions/fetchapi';

const result = await fetchAndSaveCashSalesDetailsByDate(
  '2025-01-01',
  '2025-01-31',
  {
    upsert: true,
    batchSize: 5,
    limit: 100
  }
);
```

### 2. `fetchAndSaveCashSalesDetailsToday(options)`

Convenience function to fetch cash sales details for today's date.

**Parameters:**
- `options` (object): Same as above

**Example:**
```typescript
import { fetchAndSaveCashSalesDetailsToday } from '@/actions/fetchapi';

const result = await fetchAndSaveCashSalesDetailsToday({
  upsert: true,
  batchSize: 10
});
```

## API Endpoint Usage

The main `/api/fetch-and-save` endpoint now supports automatic details fetching.

### Query Parameters

- `fetchDetails=true`: Explicitly fetch cash sales details (existing functionality)
- `autoFetchDetails=true`: Automatically fetch details for the same date range as cash sales
- `detailsLimit=50`: Limit the number of cash sales codes to process for details
- `detailsBatchSize=10`: Batch size for processing details

### Examples

#### 1. Fetch cash sales and details for a specific date range
```
GET /api/fetch-and-save?dateFrom=2025-01-01&dateTo=2025-01-31&autoFetchDetails=true&upsert=true
```

#### 2. Fetch cash sales and details for today
```
GET /api/fetch-and-save?autoFetchDetails=true&upsert=true
```

#### 3. Fetch cash sales and details with custom batch settings
```
GET /api/fetch-and-save?autoFetchDetails=true&detailsLimit=100&detailsBatchSize=5&upsert=true
```

## How It Works

1. **Date Range Matching**: When `autoFetchDetails=true`, the system uses the same date range (`dateFrom` and `dateTo`) for both cash sales and details fetching.

2. **Database Query**: The system queries the cash sales table to find all cash sales codes within the specified date range.

3. **API Calls**: For each cash sales code found, it makes an API call to fetch the detailed information.

4. **Batch Processing**: Details are processed in batches to avoid overwhelming the API and improve performance.

5. **Upsert Support**: Supports both insert-only and upsert modes, just like the main cash sales fetching.

## Benefits

1. **Consistency**: Details are fetched for the same date range as cash sales, ensuring data consistency.

2. **Efficiency**: Only fetches details for cash sales that exist in the database for the specified date range.

3. **Flexibility**: Supports both manual and automatic details fetching.

4. **Performance**: Batch processing and configurable limits prevent API overload.

## Error Handling

- Individual detail line errors don't stop the entire process
- Failed API calls are logged and reported
- The system continues processing other cash sales codes even if some fail

## Activity Logging

All details fetching operations are logged in the API activity table with descriptive messages that include:
- Date range information
- Number of records saved/updated
- Success/failure status

## Migration Notes

- Existing `fetchDetails=true` parameter still works as before
- New `autoFetchDetails=true` parameter provides date-based fetching
- Both parameters can be used together (details will be fetched twice)
- No breaking changes to existing functionality

## Troubleshooting

### Date Filtering Issues

If the date-based fetching is not working as expected, you can use the debug endpoint to investigate:

```bash
# Test date filtering with specific date range
GET /api/debug-date-filter?dateFrom=2025-01-01&dateTo=2025-01-31

# Test with today's date
GET /api/debug-date-filter?dateFrom=2025-01-20&dateTo=2025-01-20
```

This will return information about:
- Total records in the database
- Sample dates available in the database
- Number of records found in the specified date range
- Sample filtered records

### Common Issues

1. **No records found**: Check if the date format matches what's stored in the database (YYYY-MM-DD)
2. **Wrong timezone**: Ensure dates are in the correct timezone (Asia/Manila)
3. **Empty database**: Verify that cash sales records exist in the database for the specified date range

### Debug Function

You can also use the debug function directly in your code:

```typescript
import { debugDateFiltering } from '@/actions/fetchapi';

const debugResult = await debugDateFiltering('2025-01-01', '2025-01-31');
console.log(debugResult);
```
