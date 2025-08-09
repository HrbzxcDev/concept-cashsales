import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/utils/db/drizzle';
import { cashsalesTable } from '@/utils/db/schema';
import { eq } from 'drizzle-orm';

// Types
interface ExternalAPICashSale {
  cashsalesid: string;
  cashsalesdate: string;
  cashsalescode: string;
  customer: string;
  stocklocation: string;
  status: boolean;
}

interface FetchAndSaveResponse {
  success: boolean;
  message: string;
  savedCount?: number;
  updatedCount?: number;
  errors?: string[];
  data?: any[];
}

/**
 * Transform external API data to database format
 */
function transformAPIToDB(apiData: any) {
  // Try different possible field names for cashsalesid
  const possibleIdFields = [
    'cashsalesid',
    'id',
    'cashsales_id',
    'cashSaleId',
    'cash_sales_id'
  ];
  let cashsalesid = null;

  for (const field of possibleIdFields) {
    if (apiData && apiData[field] && String(apiData[field]).trim() !== '') {
      cashsalesid = String(apiData[field]).trim();
      break;
    }
  }

  // Validate required fields
  if (!cashsalesid) {
    throw new Error(`Invalid cashsalesid: ${apiData.cashsalesid}`);
  }

  // Helper function to validate and format date
  function formatDate(dateValue: any): string {
    if (!dateValue || String(dateValue).trim() === '') {
      throw new Error('Date value is required but not provided');
    }

    const dateStr = String(dateValue).trim();

    // Try to parse the date
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) {
        throw new Error(`Invalid date format: ${dateStr}`);
      }
      return date.toISOString().split('T')[0]; // Return YYYY-MM-DD format
    } catch (error) {
      throw new Error(`Error parsing date: ${dateStr} - ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  return {
    cashsalesid: cashsalesid,
    cashsalesdate: formatDate(
      apiData.cashsalesdate || apiData.cashsales_date || apiData.cashSalesDate || apiData.date
    ),
    cashsalescode:
      apiData.cashsalescode || apiData.cashsales_code || apiData.cashSalesCode || apiData.code || '',
    customer: apiData.customer || apiData.customer_name || apiData.customerName || apiData.cust || '',
    stocklocation:
      apiData.stocklocation || apiData.stock_location || apiData.stockLocation || apiData.location || '',
    status: apiData.status || apiData.is_active || false
  };
}

/**
 * Server-side GET function that fetches data from external API and saves to database
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Get query parameters
    const limit = parseInt(searchParams.get('limit') || '1000');
    const upsert = searchParams.get('upsert') === 'true';
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');

    // External API configuration
    const API_BASE_URL =
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      'https://dev-api.qne.cloud/api/CashSales';
    const DB_CODE = process.env.NEXT_PUBLIC_DB_CODE || '';

    console.log('Starting fetch and save operation...');
    console.log('API URL:', API_BASE_URL);
    console.log('Limit:', limit);
    console.log('Upsert:', upsert);

    // Build query parameters for external API
    const queryParams = new URLSearchParams();
    if (limit > 0) {
      queryParams.append('limit', limit.toString());
    }

    if (dateFrom) {
      queryParams.append('dateFrom', dateFrom);
    }

    if (dateTo) {
      queryParams.append('dateTo', dateTo);
    }

    // Construct the full URL
    const url = queryParams.toString()
      ? `${API_BASE_URL}?${queryParams.toString()}`
      : API_BASE_URL;

    console.log('Fetching data from:', url);

    // Fetch data from external API
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        dbcode: DB_CODE
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    const apiData: ExternalAPICashSale[] = await response.json();
    console.log(`Fetched ${apiData.length} records from external API`);
    console.log(
      'Raw API response sample:',
      JSON.stringify(apiData.slice(0, 2), null, 2)
    );

    if (!Array.isArray(apiData) || apiData.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No data to save from external API',
        savedCount: 0,
        updatedCount: 0,
        data: []
      });
    }

    // Filter out invalid records (those without cashsalesid)
    const validRecords = apiData.filter((item) => {
      console.log('Checking item:', JSON.stringify(item, null, 2));
      console.log('Item keys:', Object.keys(item || {}));
      console.log('Item cashsalesid:', item?.cashsalesid);
      console.log('Item cashsalesid type:', typeof item?.cashsalesid);
      console.log('Item cashsalesid trimmed:', item?.cashsalesid?.trim());

      // Try different possible field names for cashsalesid
      const possibleIdFields = [
        'cashsalesid',
        'id',
        'cashsales_id',
        'cashSaleId',
        'cash_sales_id'
      ];
      let cashsalesid = null;

      for (const field of possibleIdFields) {
        const itemAny = item as any;
        if (item && itemAny[field] && String(itemAny[field]).trim() !== '') {
          cashsalesid = String(itemAny[field]).trim();
          console.log(`Found cashsalesid in field '${field}':`, cashsalesid);
          break;
        }
      }

      const isValid = cashsalesid !== null;

      console.log('Is valid:', isValid);

      if (!isValid) {
        console.warn(
          'Skipping invalid record - no valid cashsalesid found:',
          JSON.stringify(item, null, 2)
        );
      }
      return isValid;
    });

    console.log(
      `Filtered to ${validRecords.length} valid records out of ${apiData.length} total`
    );

    if (validRecords.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No valid records to save from external API',
        savedCount: 0,
        updatedCount: 0,
        data: []
      });
    }

    let savedCount = 0;
    let updatedCount = 0;
    const errors: string[] = [];
    const savedData: any[] = [];

    // Process each record
    for (const item of validRecords) {
      try {
        // Log the raw item for debugging
        console.log('Processing item:', JSON.stringify(item, null, 2));

            // Log the raw item before transformation for debugging
        console.log('=== DEBUGGING EMPTY FIELDS ===');
        console.log('Raw API item:', JSON.stringify(item, null, 2));
        console.log('Available fields in item:', Object.keys(item || {}));
        console.log('cashsalescode field:', item?.cashsalescode);
        console.log('customer field:', item?.customer);
        console.log('stocklocation field:', item?.stocklocation);
        console.log('status field:', item?.status);
        console.log('=== END DEBUG ===');

        const transformedData = transformAPIToDB(item);
        console.log(
          'Transformed data:',
          JSON.stringify(transformedData, null, 2)
        );

        if (upsert) {
          // Check if record exists
          const existingRecord = await db
            .select()
            .from(cashsalesTable)
            .where(eq(cashsalesTable.cashsalesid, transformedData.cashsalesid))
            .limit(1);

          if (existingRecord.length > 0) {
            // Update existing record
            const updatedRecord = await db
              .update(cashsalesTable)
              .set({
                ...transformedData,
                updatedAt: new Date()
              })
              .where(
                eq(cashsalesTable.cashsalesid, transformedData.cashsalesid)
              )
              .returning();

            updatedCount++;
            savedData.push(updatedRecord[0]);
          } else {
            // Insert new record
            const newRecord = await db
              .insert(cashsalesTable)
              .values({
                ...transformedData,
                createdAt: new Date(),
                updatedAt: new Date()
              })
              .returning();

            savedCount++;
            savedData.push(newRecord[0]);
          }
        } else {
          // Only insert if record doesn't exist
          const existingRecord = await db
            .select()
            .from(cashsalesTable)
            .where(eq(cashsalesTable.cashsalesid, transformedData.cashsalesid))
            .limit(1);

          if (existingRecord.length === 0) {
            const newRecord = await db
              .insert(cashsalesTable)
              .values({
                ...transformedData,
                createdAt: new Date(),
                updatedAt: new Date()
              })
              .returning();

            savedCount++;
            savedData.push(newRecord[0]);
          }
        }
      } catch (error) {
        const itemId = item?.cashsalesid || 'unknown';
        const errorMessage = `Error processing record ${itemId}: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`;
        console.error(errorMessage);
        console.error('Raw item data:', JSON.stringify(item, null, 2));
        errors.push(errorMessage);
      }
    }

    const responseData: FetchAndSaveResponse = {
      success: errors.length === 0,
      message: `Successfully processed ${validRecords.length} valid records (${
        apiData.length - validRecords.length
      } invalid skipped). Saved: ${savedCount}, Updated: ${updatedCount}${
        errors.length > 0 ? `, Errors: ${errors.length}` : ''
      }`,
      savedCount,
      updatedCount,
      data: savedData
    };

    if (errors.length > 0) {
      responseData.errors = errors;
    }

    console.log('Operation completed:', responseData.message);

    return NextResponse.json(responseData, { status: 200 });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : 'An unknown error occurred'
      },
      { status: 500 }
    );
  }
}
