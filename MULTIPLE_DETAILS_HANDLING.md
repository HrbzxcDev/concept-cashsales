# Multiple Detail Lines Handling

## Overview

The cash sales details fetching function is designed to handle multiple detail lines for a single cash sales code, where each line has a different numbering (1, 2, 3, etc.). This is exactly what you see in the database table image showing cash sales code `00000430` with 3 detail lines.

## Example from Database

Based on the database table image, cash sales code `00000430` has 3 detail lines:

| Numbering | Stock Code | Description |
|-----------|------------|-------------|
| 1 | GOM1L | SHOTT CANE SUGAR (GO... |
| 2 | ES6027B-OS | CUBE SCALE 2.0 BLACI... |
| 3 | POWDCH15 | DOUBLE CHOCOLATE POI... |

## How the Function Works

### 1. Unique Identifier Logic

The function uses `cashsalescode` + `numbering` as the unique identifier:

```typescript
// Each detail line is uniquely identified by:
eq(cashsalesdetailsTable.cashsalescode, transformedData.cashsalescode) &&
eq(cashsalesdetailsTable.numbering, transformedData.numbering)
```

This means:
- `00000430` + `1` = Unique record
- `00000430` + `2` = Unique record  
- `00000430` + `3` = Unique record

### 2. Processing Multiple Lines

When the API returns multiple detail lines for a single cash sales code:

```json
{
  "details": [
    {
      "numbering": "1",
      "stock": "GOM1L",
      "description": "SHOTT CANE SUGAR",
      "qty": 5,
      "amount": 1000
    },
    {
      "numbering": "2", 
      "stock": "ES6027B-OS",
      "description": "CUBE SCALE 2.0",
      "qty": 2,
      "amount": 500
    },
    {
      "numbering": "3",
      "stock": "POWDCH15", 
      "description": "DOUBLE CHOCOLATE",
      "qty": 3,
      "amount": 750
    }
  ]
}
```

The function processes each line separately:

1. **Line 1** (numbering: "1") → Saved as separate record
2. **Line 2** (numbering: "2") → Saved as separate record  
3. **Line 3** (numbering: "3") → Saved as separate record

### 3. Console Output Example

```
Fetching details for cash sales code: 00000430
Found 3 detail lines for cash sales code: 00000430
Processing detail line - numbering: 1, stockcode: GOM1L
Inserted new detail line - numbering: 1
Processing detail line - numbering: 2, stockcode: ES6027B-OS  
Inserted new detail line - numbering: 2
Processing detail line - numbering: 3, stockcode: POWDCH15
Inserted new detail line - numbering: 3
```

## Testing the Function

### 1. Test with Specific Date Range

```bash
GET /api/test-multiple-details?dateFrom=2025-08-22&dateTo=2025-08-22&upsert=true
```

### 2. Test with Main API

```bash
GET /api/fetch-and-save?dateFrom=2025-08-22&dateTo=2025-08-22&upsert=true
```

### 3. Verify Results

The verification function will show:

```json
{
  "success": true,
  "message": "Successfully verified 3 detail lines for cash sales code 00000430",
  "detailLines": [
    {
      "numbering": "1",
      "stockcode": "GOM1L",
      "quantity": 5,
      "amount": 1000
    },
    {
      "numbering": "2", 
      "stockcode": "ES6027B-OS",
      "quantity": 2,
      "amount": 500
    },
    {
      "numbering": "3",
      "stockcode": "POWDCH15", 
      "quantity": 3,
      "amount": 750
    }
  ],
  "count": 3,
  "numberingValues": ["1", "2", "3"]
}
```

## Key Features

### ✅ Multiple Lines Support
- Handles any number of detail lines per cash sales code
- Each line with different numbering is saved separately
- No limit on the number of detail lines

### ✅ Duplicate Prevention
- Uses `cashsalescode` + `numbering` as unique identifier
- Prevents duplicate lines with same numbering
- Allows updates when using `upsert=true`

### ✅ Order Preservation
- Lines are processed in the order received from API
- Database records maintain the numbering sequence
- Can be sorted by numbering for display

### ✅ Error Handling
- If one line fails, others continue processing
- Detailed error logging for each line
- Graceful handling of missing or invalid data

## Database Schema Requirements

The function assumes the following database structure:

```sql
CREATE TABLE cashsalesdetails (
  id UUID PRIMARY KEY,
  cashsalescode VARCHAR(100) NOT NULL,
  numbering VARCHAR(30) NOT NULL,
  stockcode VARCHAR(100),
  description VARCHAR(100),
  quantity NUMERIC,
  amount NUMERIC,
  -- ... other fields
);
```

**Important**: The combination of `cashsalescode` + `numbering` should be unique for proper operation.

## Migration Notes

- The function is backward compatible
- Existing data will not be affected
- New fetches will correctly handle multiple detail lines
- You may want to re-fetch existing data to get missing detail lines

## Files Modified

1. `actions/fetchapi.ts` - Enhanced with verification function
2. `app/api/test-multiple-details/route.ts` - New test endpoint
3. `MULTIPLE_DETAILS_HANDLING.md` - This documentation

## Expected Results

When you run the function, you should see:

1. **Multiple detail lines saved** for each cash sales code
2. **Each line with unique numbering** saved as separate record
3. **Console logs showing** each line being processed
4. **Verification results** confirming all lines were saved correctly

This matches exactly what you see in the database table image with cash sales code `00000430` having 3 detail lines with numbering 1, 2, and 3.
