# API Fetch and Save Functions

This module provides functions to fetch data from the Cash Sales API and save it to the database.

## Functions

### `fetchAndSaveCashSales(options)`

Fetches cash sales data from the API and saves it to the database.

**Parameters:**

- `options` (optional): Configuration object
  - `limit`: Number of records to fetch (default: 100)
  - `offset`: Number of records to skip (default: 0)
  - `dateFrom`: Start date filter (optional)
  - `dateTo`: End date filter (optional)
  - `upsert`: If true, update existing records instead of skipping (default: false)
  - `batchSize`: Number of records to process in each batch (default: 50)

**Returns:**

```typescript
{
  success: boolean;
  message: string;
  savedCount?: number;
  updatedCount?: number;
  errors?: string[];
}
```

**Example:**

```typescript
import { fetchAndSaveCashSales } from '@/actions/fetchapi';

// Fetch and save 50 records
const result = await fetchAndSaveCashSales({
  limit: 50,
  upsert: true
});

if (result.success) {
  console.log(
    `Saved ${result.savedCount} records, updated ${result.updatedCount} records`
  );
} else {
  console.error('Error:', result.message);
}
```

### `fetchAndSaveCashSaleById(id, upsert)`

Fetches a single cash sale by ID and saves it to the database.

**Parameters:**

- `id`: The ID of the cash sale to fetch
- `upsert`: If true, update existing record instead of skipping (default: false)

**Example:**

```typescript
import { fetchAndSaveCashSaleById } from '@/actions/fetchapi';

const result = await fetchAndSaveCashSaleById('cash-sale-123', true);
```

### `syncAllCashSales(options)`

Syncs all data from the API to the database. Use with caution for large datasets.

**Parameters:**

- `options`: Same as `fetchAndSaveCashSales` but without `limit` and `offset`

**Example:**

```typescript
import { syncAllCashSales } from '@/actions/fetchapi';

const result = await syncAllCashSales({
  upsert: true,
  batchSize: 25
});
```

## Environment Variables

Make sure these environment variables are set:

```env
NEXT_PUBLIC_API_BASE_URL=https://dev-api.qne.cloud/api/CashSales
NEXT_PUBLIC_DB_CODE=your_db_code_here
DATABASE_URL=your_database_connection_string
```

## Data Flow

1. **API Response** → `CashSaleAPI` interface
2. **Transform** → `transformAPIToDB()` function
3. **Database** → `tblcashsales` table

## Error Handling

All functions include comprehensive error handling:

- API connection errors
- Database operation errors
- Data validation errors
- Individual record processing errors (with batch processing)

## Batch Processing

For large datasets, the functions process records in batches to:

- Prevent memory issues
- Provide progress feedback
- Handle individual record errors without failing the entire operation

## Upsert Mode

When `upsert: true`:

- Existing records are updated with new data
- New records are inserted
- `updatedCount` tracks updated records

When `upsert: false` (default):

- Only new records are inserted
- Existing records are skipped
- `savedCount` tracks new records only
