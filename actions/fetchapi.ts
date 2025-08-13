import { db } from '@/utils/db/drizzle';
import { cashsalesTable } from '@/utils/db/schema';
import { eq } from 'drizzle-orm';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  'https://dev-api.qne.cloud/api/cashsales';

// Define the type for cash sales data from API
export interface CashSaleAPI {
  id: string;
  cashsalesid: string;
  cashsalesdate: string;
  cashsalescode?: string; // Optional since API might not provide this
  customer: string;
  stocklocation?: string; // Optional since API might not provide this
  status: boolean;
  // Add more fields as needed based on your API response
}

// Define the type for database cash sales data
export interface CashSaleDB {
  id: string;
  cashsalesid: string;
  cashsalesdate: string;
  cashsalescode: string; // Empty string if not provided by API
  customer: string;
  stocklocation: string; // Empty string if not provided by API
  status: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Detailed API response for a single Cash Sales record (via Find?code=)
export interface CashSaleDetailLine {
  id: string;
  numbering: string;
  stock: string;
  description: string;
  qty: number;
  uom: string;
  unitPrice: number;
  discount: string | number | null;
  amount: number;
  taxCode: string | null;
  taxAmount: number | null;
  netAmount: number | null;
  glAccount?: string | null;
  stockLocation?: string | null;
  costCentre?: string | null;
  project?: string | null;
  serialNumber?: string | null;
  cashSales?: string | null;
}

export interface CashSaleDetailResponse {
  id: string;
  cashSalesDate: string;
  cashSalesCode: string;
  customer: string;
  customerName?: string | null;
  term?: string | null;
  stockLocation?: string | null;
  currency?: string | null;
  attention?: string | null;
  salesPerson?: string | null;
  depositTo?: string | null;
  referenceNo?: string | null;
  currencyRate?: number | null;
  isChequeNo?: string | boolean | null;
  isPostToAR?: boolean | null;
  isTaxInclusive?: boolean | null;
  isRounding?: boolean | null;
  useMultiPayment?: boolean | null;
  project?: string | null;
  costCentre?: string | null;
  multiPayments?: unknown[];
  details?: CashSaleDetailLine[];
}

/**
 * Fetch one cash sale with full details by cash sales code using the Find endpoint.
 */
export async function fetchCashSaleDetailByCode(
  code: string
): Promise<CashSaleDetailResponse> {
  const baseFindUrl =
    process.env.NEXT_PUBLIC_API_FIND_URL ||
    'https://dev-api.qne.cloud/api/CashSales/Find';

  const url = `${baseFindUrl}?code=${encodeURIComponent(code)}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      dbcode: process.env.NEXT_PUBLIC_DB_CODE || ''
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
  }

  const detail: CashSaleDetailResponse = await response.json();
  return detail;
}

export interface FetchAndSaveResponse {
  success: boolean;
  message: string;
  savedCount?: number;
  updatedCount?: number;
  errors?: string[];
}

export interface FetchAndSaveOptions {
  limit?: number;
  offset?: number;
  dateFrom?: string;
  dateTo?: string;
  upsert?: boolean; // If true, update existing records instead of skipping
  batchSize?: number; // Number of records to process in each batch
}

/**
 * Transforms API data to database format
 */
function transformAPIToDB(
  apiData: CashSaleAPI
): Omit<CashSaleDB, 'id' | 'createdAt' | 'updatedAt'> {
  // Note: cashsalescode and stocklocation are now optional
  // They can be null if not provided by the API

  return {
    cashsalesid: apiData.cashsalesid,
    cashsalesdate: apiData.cashsalesdate,
    cashsalescode: apiData.cashsalescode || '',
    customer: apiData.customer,
    stocklocation: apiData.stocklocation || '',
    status: apiData.status
  };
}

/**
 * Fetches data from API and saves to database
 */
export async function fetchAndSaveCashSales(
  options: FetchAndSaveOptions = {}
): Promise<FetchAndSaveResponse> {
  const {
    limit = 100,
    offset = 0,
    dateFrom,
    dateTo,
    upsert = false,
    batchSize = 100
  } = options;

  try {
    console.log('Starting fetch and save operation...');

    // Build query parameters
    const queryParams = new URLSearchParams();

    if (limit) {
      queryParams.append('limit', limit.toString());
    }

    if (offset) {
      queryParams.append('offset', offset.toString());
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

    // Fetch data from API
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        dbcode: process.env.NEXT_PUBLIC_DB_CODE || ''
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    const apiData: CashSaleAPI[] = await response.json();
    console.log(`Fetched ${apiData.length} records from API`);

    if (!Array.isArray(apiData) || apiData.length === 0) {
      return {
        success: true,
        message: 'No data to save',
        savedCount: 0,
        updatedCount: 0
      };
    }

    let savedCount = 0;
    let updatedCount = 0;
    const errors: string[] = [];

    // Process data in batches
    for (let i = 0; i < apiData.length; i += batchSize) {
      const batch = apiData.slice(i, i + batchSize);
      console.log(
        `Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(
          apiData.length / batchSize
        )}`
      );

      for (const item of batch) {
        try {
          const transformedData = transformAPIToDB(item);

          if (upsert) {
            // Check if record exists
            const existingRecord = await db
              .select()
              .from(cashsalesTable)
              .where(
                eq(cashsalesTable.cashsalesid, transformedData.cashsalesid)
              )
              .limit(1);

            if (existingRecord.length > 0) {
              // Update existing record
              await db
                .update(cashsalesTable)
                .set({
                  ...transformedData
                })
                .where(
                  eq(cashsalesTable.cashsalesid, transformedData.cashsalesid)
                );
              updatedCount++;
            } else {
              // Insert new record
              await db.insert(cashsalesTable).values(transformedData);
              savedCount++;
            }
          } else {
            // Only insert if record doesn't exist
            const existingRecord = await db
              .select()
              .from(cashsalesTable)
              .where(
                eq(cashsalesTable.cashsalesid, transformedData.cashsalesid)
              )
              .limit(1);

            if (existingRecord.length === 0) {
              await db.insert(cashsalesTable).values(transformedData);
              savedCount++;
            }
          }
        } catch (error) {
          const errorMessage = `Error processing record ${item.cashsalesid}: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`;
          console.error(errorMessage);
          errors.push(errorMessage);
        }
      }
    }

    const message = `Successfully processed ${
      apiData.length
    } records. Saved: ${savedCount}, Updated: ${updatedCount}${
      errors.length > 0 ? `, Errors: ${errors.length}` : ''
    }`;

    return {
      success: true,
      message,
      savedCount,
      updatedCount,
      errors: errors.length > 0 ? errors : undefined
    };
  } catch (error) {
    console.error('Error in fetchAndSaveCashSales:', error);

    return {
      success: false,
      message:
        error instanceof Error ? error.message : 'An unknown error occurred'
    };
  }
}

/**
 * Fetches and saves a single cash sale by ID
 */
export async function fetchAndSaveCashSaleById(
  id: string,
  upsert: boolean = false
): Promise<FetchAndSaveResponse> {
  try {
    console.log(`Fetching and saving cash sale with ID: ${id}`);

    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        dbcode: process.env.NEXT_PUBLIC_DB_CODE || ''
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    const apiData: CashSaleAPI = await response.json();
    const transformedData = transformAPIToDB(apiData);

    if (upsert) {
      // Check if record exists
      const existingRecord = await db
        .select()
        .from(cashsalesTable)
        .where(eq(cashsalesTable.cashsalesid, transformedData.cashsalesid))
        .limit(1);

      if (existingRecord.length > 0) {
        // Update existing record
        await db
          .update(cashsalesTable)
          .set({
            ...transformedData
          })
          .where(eq(cashsalesTable.cashsalesid, transformedData.cashsalesid));

        return {
          success: true,
          message: `Updated cash sale with ID: ${id}`,
          updatedCount: 1
        };
      }
    }

    // Insert new record
    await db.insert(cashsalesTable).values(transformedData);

    return {
      success: true,
      message: `Saved cash sale with ID: ${id}`,
      savedCount: 1
    };
  } catch (error) {
    console.error(`Error fetching and saving cash sale with ID ${id}:`, error);

    return {
      success: false,
      message:
        error instanceof Error ? error.message : 'An unknown error occurred'
    };
  }
}

/**
 * Syncs all data from API to database (use with caution for large datasets)
 */
export async function syncAllCashSales(
  options: Omit<FetchAndSaveOptions, 'limit' | 'offset'> = {}
): Promise<FetchAndSaveResponse> {
  try {
    console.log('Starting full sync operation...');

    // First, get total count or fetch all data
    const response = await fetch(API_BASE_URL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        dbcode: process.env.NEXT_PUBLIC_DB_CODE || ''
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const allData: CashSaleAPI[] = await response.json();
    console.log(`Total records to sync: ${allData.length}`);

    // Use the existing function with all data
    return await fetchAndSaveCashSales({
      ...options,
      limit: allData.length,
      offset: 0
    });
  } catch (error) {
    console.error('Error in syncAllCashSales:', error);

    return {
      success: false,
      message:
        error instanceof Error ? error.message : 'An unknown error occurred'
    };
  }
}

/**
 * Fetches cash sales data for a specific date
 */
export async function fetchCashSalesByDate(
  date: string,
  options: {
    fromAPI?: boolean;
    fromDB?: boolean;
    upsert?: boolean;
  } = {}
): Promise<{
  success: boolean;
  message: string;
  apiData?: CashSaleAPI[];
  dbData?: CashSaleDB[];
  savedCount?: number;
  updatedCount?: number;
  errors?: string[];
}> {
  const { fromAPI = true, fromDB = true, upsert = false } = options;

  try {
    console.log(`Fetching cash sales data for date: ${date}`);

    let apiData: CashSaleAPI[] = [];
    let dbData: CashSaleDB[] = [];
    let savedCount = 0;
    let updatedCount = 0;
    const errors: string[] = [];

    // Fetch from API if requested
    if (fromAPI) {
      try {
        const queryParams = new URLSearchParams();
        queryParams.append('dateFrom', date);
        queryParams.append('dateTo', date);

        const url = `${API_BASE_URL}?${queryParams.toString()}`;
        console.log('Fetching from API:', url);

        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            dbcode: process.env.NEXT_PUBLIC_DB_CODE || ''
          }
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('API Error Response:', errorText);
          throw new Error(
            `HTTP error! status: ${response.status} - ${errorText}`
          );
        }

        apiData = await response.json();
        console.log(
          `Fetched ${apiData.length} records from API for date ${date}`
        );

        // Save to database if upsert is enabled
        if (upsert && apiData.length > 0) {
          for (const item of apiData) {
            try {
              const transformedData = transformAPIToDB(item);

              // Check if record exists
              const existingRecord = await db
                .select()
                .from(cashsalesTable)
                .where(
                  eq(cashsalesTable.cashsalesid, transformedData.cashsalesid)
                )
                .limit(1);

              if (existingRecord.length > 0) {
                // Update existing record
                await db
                  .update(cashsalesTable)
                  .set({
                    ...transformedData
                  })
                  .where(
                    eq(cashsalesTable.cashsalesid, transformedData.cashsalesid)
                  );
                updatedCount++;
              } else {
                // Insert new record
                await db.insert(cashsalesTable).values(transformedData);
                savedCount++;
              }
            } catch (error) {
              const errorMessage = `Error processing record ${
                item.cashsalesid
              }: ${error instanceof Error ? error.message : 'Unknown error'}`;
              console.error(errorMessage);
              errors.push(errorMessage);
            }
          }
        }
      } catch (error) {
        const errorMessage = `Error fetching from API: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`;
        console.error(errorMessage);
        errors.push(errorMessage);
      }
    }

    // Fetch from database if requested
    if (fromDB) {
      try {
        // Convert date to start and end of day for database query
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        dbData = await db.select().from(cashsalesTable).where(
          // Assuming cashsalesdate is stored as a string in YYYY-MM-DD format
          // You might need to adjust this based on your actual date format
          eq(cashsalesTable.cashsalesdate, date)
        );

        console.log(
          `Fetched ${dbData.length} records from database for date ${date}`
        );
      } catch (error) {
        const errorMessage = `Error fetching from database: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`;
        console.error(errorMessage);
        errors.push(errorMessage);
      }
    }

    const message = `Successfully fetched data for date ${date}. API: ${
      apiData.length
    } records, DB: ${dbData.length} records${
      upsert ? `, Saved: ${savedCount}, Updated: ${updatedCount}` : ''
    }${errors.length > 0 ? `, Errors: ${errors.length}` : ''}`;

    return {
      success: errors.length === 0,
      message,
      apiData: fromAPI ? apiData : undefined,
      dbData: fromDB ? dbData : undefined,
      savedCount: upsert ? savedCount : undefined,
      updatedCount: upsert ? updatedCount : undefined,
      errors: errors.length > 0 ? errors : undefined
    };
  } catch (error) {
    console.error(`Error in fetchCashSalesByDate for date ${date}:`, error);

    return {
      success: false,
      message:
        error instanceof Error ? error.message : 'An unknown error occurred'
    };
  }
}

/**
 * Fetches cash sales data for today's date
 */
export async function fetchCashSalesToday(
  options: {
    fromAPI?: boolean;
    fromDB?: boolean;
    upsert?: boolean;
  } = {}
): Promise<{
  success: boolean;
  message: string;
  apiData?: CashSaleAPI[];
  dbData?: CashSaleDB[];
  savedCount?: number;
  updatedCount?: number;
  errors?: string[];
}> {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
  return fetchCashSalesByDate(today, options);
}
