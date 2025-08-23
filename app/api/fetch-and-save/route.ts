import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/utils/db/drizzle';
import {
  cashsalesTable,
  apiactivityTable,
} from '@/utils/db/schema';
import { eq, and } from 'drizzle-orm';
import {
  fetchAndSaveCashSalesDetails
} from '@/actions/fetchapi';

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
  detailsResult?: {
    success: boolean;
    message: string;
    savedCount?: number;
    updatedCount?: number;
    errors?: string[];
  } | null;
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
      // Return YYYY-MM-DD format in Philippine timezone
      return date.toLocaleDateString('en-CA', { timeZone: 'Asia/Manila' });
    } catch (error) {
      throw new Error(
        `Error parsing date: ${dateStr} - ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  }

  return {
    cashsalesid: cashsalesid,
    cashsalesdate: formatDate(
      apiData.cashsalesdate ||
        apiData.cashsales_date ||
        apiData.cashSalesDate ||
        apiData.date
    ),
    cashsalescode:
      apiData.cashsalescode ||
      apiData.cashsales_code ||
      apiData.cashSalesCode ||
      apiData.code ||
      '',
    customer:
      apiData.customer ||
      apiData.customer_name ||
      apiData.customerName ||
      apiData.cust ||
      '',
    stocklocation:
      apiData.stocklocation ||
      apiData.stock_location ||
      apiData.stockLocation ||
      apiData.location ||
      '',
    status: apiData.status || apiData.is_active || true
  };
}

/**
 * Save API fetch activity to the database
 */
async function saveAPIFetchActivity(
  description: string,
  count: number,
  status: boolean
) {
  try {
    const now = new Date();
    const currentDate = now.toLocaleDateString('en-CA', {
      timeZone: 'Asia/Manila'
    }); // YYYY-MM-DD format in Philippine timezone
    const currentTime = now
      .toLocaleTimeString('en-GB', { timeZone: 'Asia/Manila' })
      .split(' ')[0]; // HH:MM:SS format in Philippine timezone

    // Create activity record
    const activityRecord = await db
      .insert(apiactivityTable)
      .values({
        description: description,
        count: count.toString(),
        datefetched: currentDate,
        timefetched: currentTime,
        status: status,
        createdAt: now,
        updatedAt: now
      })
      .returning();

    console.log('API fetch activity saved:', {
      id: activityRecord[0].id,
      description: activityRecord[0].description,
      count: activityRecord[0].count,
      datefetched: activityRecord[0].datefetched,
      timefetched: activityRecord[0].timefetched,
      status: activityRecord[0].status
    });

    return activityRecord[0];
  } catch (error) {
    console.error('Error saving API fetch activity:', error);
    throw error;
  }
}

/**
 * Server-side GET function that fetches data from external API and saves to database
 */
export async function GET(request: NextRequest) {
  const requestURL = new URL(request.url);
  const customDescription = requestURL.searchParams.get('description') || '';
  const { searchParams } = requestURL;

  // Get query parameters
  const limit = parseInt(searchParams.get('limit') || '1000');
  const upsert = searchParams.get('upsert') === 'true';
  const dateFrom = searchParams.get('dateFrom');
  const dateTo = searchParams.get('dateTo');
  const fetchDetails = searchParams.get('fetchDetails') !== 'false'; // Default to true unless explicitly set to false
  const autoFetchDetails = searchParams.get('autoFetchDetails') !== 'false'; // Default to true unless explicitly set to false
  const detailsLimit = parseInt(searchParams.get('detailsLimit') || '100');
  const detailsBatchSize = parseInt(
    searchParams.get('detailsBatchSize') || '100'
  );

  try {
    // External API configuration
    const API_BASE_URL =
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      'https://api.qne.cloud/api/CashSales';
    const DB_CODE = process.env.NEXT_PUBLIC_DB_CODE || '';

    // Get today's date in YYYY-MM-DD format (Philippine timezone)
    const now = new Date();
    const today = now.toLocaleDateString('en-CA', { timeZone: 'Asia/Manila' }); // YYYY-MM-DD format in Philippine timezone
    const yesterdayDate = new Date(now);
    yesterdayDate.setDate(now.getDate() - 1);
    const yesterday = yesterdayDate.toLocaleDateString('en-CA', {
      timeZone: 'Asia/Manila'
    }); // YYYY-MM-DD format in Philippine timezone

    // Build OData query parameters for external API
    const queryParams = new URLSearchParams();

    // Add OData parameters
    queryParams.append('$skip', '0');
    queryParams.append('$top', limit > 0 ? limit.toString() : '1000');
    // Use provided date range if available, otherwise default to [yesterday, today)
    const fromDate = dateFrom || yesterday;
    const toDate = dateTo || today;

    console.log('Starting fetch and save operation...');
    console.log('API URL:', API_BASE_URL);
    console.log('DB CODE:', DB_CODE);
    console.log('Limit:', limit);
    console.log('Upsert:', upsert);
    console.log('Date From:', fromDate);
    console.log('Date To:', toDate);
    console.log('Fetch Details:', fetchDetails);
    console.log('Auto Fetch Details:', autoFetchDetails);
    queryParams.append(
      '$filter',
      `cashsalesdate ge ${fromDate} and cashsalesdate le ${toDate}`
    );

    // Construct the full URL
    const url = `${API_BASE_URL}?${queryParams.toString()}`;

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
      throw new Error(
        `HTTP error! status: <span class="text-[#ef4444]">${response.status}</span> - ${errorText}`
      );
    }

    const apiData: ExternalAPICashSale[] = await response.json();
    console.log(`Fetched ${apiData.length} Records From External API`);
    // console.log(
    //   'Raw API response sample:',
    //   JSON.stringify(apiData.slice(0, 2), null, 2)
    // );

    if (!Array.isArray(apiData) || apiData.length === 0) {
      // Save activity for empty response, but avoid duplicates for the same date
      try {
        const existingNoData = await db
          .select({ id: apiactivityTable.id })
          .from(apiactivityTable)
          .where(
            and(
              eq(apiactivityTable.datefetched, today),
              eq(
                apiactivityTable.description,
                'API Fetch Operation - No Data Returned From External API'
              )
            )
          )
          .limit(1);

        if (existingNoData.length === 0) {
          const baseNoDataDesc = 'API Fetch Operation - No Data Returned ';
          let noDataDescription = customDescription
            ? `${customDescription} - ${baseNoDataDesc}`
            : baseNoDataDesc;

          // Add date range to description if it's a manual fetch with date range
          if (customDescription && dateFrom && dateTo) {
            const formatDateForDisplay = (dateStr: string) => {
              const date = new Date(dateStr);
              return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              });
            };
            const fromDisplay = formatDateForDisplay(dateFrom);
            const toDisplay = formatDateForDisplay(dateTo);
            noDataDescription = `${customDescription} (${fromDisplay} to ${toDisplay}) - ${baseNoDataDesc}`;
          }

          await saveAPIFetchActivity(noDataDescription, 0, true);
        } else {
          console.log(
            `Skipping duplicate no-data activity for ${today} (already logged)`
          );
        }
      } catch (activityError) {
        console.error(
          'Failed to save API fetch activity for empty response:',
          activityError
        );
      }

      return NextResponse.json({
        success: true,
        message: 'No Data To Save From External API',
        savedCount: 0,
        updatedCount: 0,
        data: []
      });
    }

    // Filter out invalid records (those without cashsalesid)
    const validRecords = apiData.filter((item) => {
      // console.log('Checking item:', JSON.stringify(item, null, 2));
      // console.log('Item keys:', Object.keys(item || {}));
      // console.log('Item cashsalesid:', item?.cashsalesid);
      // console.log('Item cashsalesid type:', typeof item?.cashsalesid);
      // console.log('Item cashsalesid trimmed:', item?.cashsalesid?.trim());
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
          // console.log(`Found cashsalesid in field '${field}':`, cashsalesid);
          break;
        }
      }

      const isValid = cashsalesid !== null;

      // console.log('Is valid:', isValid);

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
      // Save activity for no valid records
      try {
        await saveAPIFetchActivity(
          'API Fetch Operation - No Valid Fecords Found After Filtering',
          0,
          true
        );
      } catch (activityError) {
        console.error(
          'Failed to save API fetch activity for no valid records:',
          activityError
        );
      }

      return NextResponse.json({
        success: true,
        message: 'No Valid Fecords To Save From External API',
        savedCount: 0,
        updatedCount: 0,
        data: []
      });
    }

    let savedCount = 0;
    let updatedCount = 0;
    const errors: string[] = [];
    const savedData: any[] = [];
    const collectedCodes: string[] = [];

    // Process each record
    for (const item of validRecords) {
      try {
        // Log the raw item for debugging
        // console.log('Processing item:', JSON.stringify(item, null, 2));

        // Log the raw item before transformation for debugging
        // console.log('=== DEBUGGING EMPTY FIELDS ===');
        // console.log('Raw API item:', JSON.stringify(item, null, 2));
        // console.log('Available fields in item:', Object.keys(item || {}));
        // console.log('cashsalescode field:', item?.cashsalescode);
        // console.log('customer field:', item?.customer);
        // console.log('stocklocation field:', item?.stocklocation);
        // console.log('status field:', item?.status);
        // console.log('=== END DEBUG ===');

        const transformedData = transformAPIToDB(item);
        // console.log(
        //   'Transformed data:',
        //   JSON.stringify(transformedData, null, 2)
        // );

        if (
          transformedData.cashsalescode &&
          transformedData.cashsalescode.trim() !== ''
        ) {
          collectedCodes.push(transformedData.cashsalescode.trim());
        }

        if (upsert) {
          // Check if record exists
          const existingRecord = await db
            .select()
            .from(cashsalesTable)
            .where(eq(cashsalesTable.cashsalesid, transformedData.cashsalesid))
            .limit(100);

          if (existingRecord.length > 0) {
            // Update existing record only if there are actual changes
            const current = existingRecord[0] as any;
            const currentDate = current?.cashsalesdate
              ? new Date(current.cashsalesdate).toLocaleDateString('en-CA', {
                  timeZone: 'Asia/Manila'
                })
              : '';
            const hasChanges =
              currentDate !== transformedData.cashsalesdate ||
              current?.cashsalescode !== transformedData.cashsalescode ||
              current?.customer !== transformedData.customer ||
              current?.stocklocation !== transformedData.stocklocation ||
              Boolean(current?.status) !== Boolean(transformedData.status);

            if (hasChanges) {
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
              // console.log(
              //   `No-op update skipped for cashsalesid=${transformedData.cashsalesid}`
              // );
            }
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

    // Save API fetch activity to database (avoid duplicate no-op logs per day)
    try {
      const baseDescription = `API Fetch Operation Successful - ${
        upsert ? 'Upsert' : 'Insert only'
      } Mode.`;

      // Include date range in description for manual fetches
      let activityDescription = customDescription
        ? `${customDescription} - ${baseDescription}`
        : baseDescription;

      // Add date range to description if it's a manual fetch with date range
      if (customDescription && dateFrom && dateTo) {
        const formatDateForDisplay = (dateStr: string) => {
          const date = new Date(dateStr);
          return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          });
        };
        const fromDisplay = formatDateForDisplay(dateFrom);
        const toDisplay = formatDateForDisplay(dateTo);
        activityDescription = `${baseDescription} - ${customDescription} (${fromDisplay} to ${toDisplay})`;
      }

      // Save success activity when there are DB changes.
      // If a custom description is provided (manual fetch), always log the activity
      // even when there are no DB changes, so manual runs are visible in history.
      const shouldSaveActivity = customDescription
        ? true
        : savedCount > 0 || updatedCount > 0;
      if (!shouldSaveActivity) {
        console.log('Skipping activity log (no DB changes in this run)');
      }

      if (shouldSaveActivity) {
        await saveAPIFetchActivity(
          activityDescription,
          validRecords.length,
          errors.length === 0
        );
      }

      console.log('API Fetch Activity Saved Successfully');
    } catch (activityError) {
      console.error('Failed to save API fetch activity:', activityError);
      // Don't fail the main operation if activity logging fails
    }

    // Detect and log skipped cashsalescode sequences
    try {
      // Group codes by their non-numeric prefix and analyze numeric suffix gaps
      type GroupInfo = {
        observedNumbers: Set<number>;
        minNumber: number;
        maxNumber: number;
        digitWidth: number;
      };

      const prefixToGroup: Record<string, GroupInfo> = {};

      for (const code of collectedCodes) {
        const match = code.match(/^(.*?)(\d+)\s*$/);
        if (!match) continue;
        const prefix = match[1];
        const numberPart = match[2];
        const numericValue = parseInt(numberPart, 10);
        if (Number.isNaN(numericValue)) continue;

        const existing = prefixToGroup[prefix];
        if (!existing) {
          prefixToGroup[prefix] = {
            observedNumbers: new Set([numericValue]),
            minNumber: numericValue,
            maxNumber: numericValue,
            digitWidth: numberPart.length
          };
        } else {
          existing.observedNumbers.add(numericValue);
          if (numericValue < existing.minNumber)
            existing.minNumber = numericValue;
          if (numericValue > existing.maxNumber)
            existing.maxNumber = numericValue;
          if (numberPart.length > existing.digitWidth)
            existing.digitWidth = numberPart.length;
        }
      }

      let totalMissing = 0;
      const missingcodes: string[] = [];

      for (const [prefix, group] of Object.entries(prefixToGroup)) {
        for (let n = group.minNumber; n <= group.maxNumber; n++) {
          if (!group.observedNumbers.has(n)) {
            totalMissing++;
            if (missingcodes.length < 5) {
              const padded = String(n).padStart(group.digitWidth, '0');
              missingcodes.push(`${prefix}${padded}`);
            }
          }
        }
      }

      if (totalMissing > 0) {
        const missingcashcodes = missingcodes.join(', ');
        const description = missingcashcodes
          ? `Skipped CashSalesCodes: ${missingcashcodes}`
          : `Skipped CashSalesCodes: ${totalMissing}.`;

        await saveAPIFetchActivity(description, totalMissing, true);
      }
    } catch (validationError) {
      console.error(
        'Failed to validate and log skipped cashsalescode:',
        validationError
      );
      // Do not interrupt the main flow
    }

    // Fetch and save cash sales details if requested
    let detailsResult = null;
    if (fetchDetails || autoFetchDetails) {
             try {
           console.log('Starting cash sales details fetch operation...');

           // Use date-based fetching for details, similar to how cash sales are fetched
           const fromDate = dateFrom || yesterday;
           const toDate = dateTo || today;

           // Log whether we're using manual dates or default dates
           if (dateFrom && dateTo) {
             console.log(`Using MANUAL date range for details: ${fromDate} to ${toDate}`);
           } else {
             console.log(`Using DEFAULT date range for details: ${fromDate} to ${toDate}`);
           }

                   detailsResult = await fetchAndSaveCashSalesDetails(
          fromDate,
          toDate,
          {
            upsert: upsert,
            batchSize: detailsBatchSize,
            limit: detailsLimit
          }
        );

           console.log('Cash sales details fetch operation completed:', detailsResult);

        // Save activity for details fetch
        if (detailsResult.success) {
          const detailsDescription = `Cash Sales Details Fetch (${fromDate} to ${toDate}) - ${detailsResult.savedCount} saved, ${detailsResult.updatedCount} updated`;
          await saveAPIFetchActivity(
            detailsDescription,
            (detailsResult.savedCount || 0) + (detailsResult.updatedCount || 0),
            true
          );
        } else {
          await saveAPIFetchActivity(
            'Cash Sales Details Fetch Failed',
            0,
            false
          );
        }

        console.log(
          'Cash sales details operation completed:',
          detailsResult.message
        );
      } catch (detailsError) {
        console.error('Error in cash sales details fetch:', detailsError);
        detailsResult = {
          success: false,
          message:
            detailsError instanceof Error
              ? detailsError.message
              : 'Unknown error occurred',
          savedCount: 0,
          updatedCount: 0
        };

        // Save activity for failed details fetch
        await saveAPIFetchActivity('Cash Sales Details Fetch Failed', 0, false);
      }
    }

    const responseData: FetchAndSaveResponse = {
      success: errors.length === 0,
      message: `Successfully Processed ${validRecords.length} Valid Records (${
        apiData.length - validRecords.length
      } Invalid Skipped). Saved: ${savedCount}, Updated: ${updatedCount}${
        errors.length > 0 ? `, Errors: ${errors.length}` : ''
      }${detailsResult ? ` | Details: ${detailsResult.message}` : ''}`,
      savedCount,
      updatedCount,
      data: savedData,
      detailsResult: detailsResult
    };

    if (errors.length > 0) {
      responseData.errors = errors;
    }

    console.log('Operation Completed:', responseData.message);

    return NextResponse.json(responseData, { status: 200 });
  } catch (error) {
    console.error('API Error:', error);

    // Save activity for failed operation
    try {
      const baseFailDesc = `API Fetch Operation Failed - ${
        error instanceof Error ? error.message : 'Unknown error'
      }`;

      // Include date range in description for manual fetches
      let failDescription = customDescription
        ? `${customDescription} - ${baseFailDesc}`
        : baseFailDesc;

      // Add date range to description if it's a manual fetch with date range
      if (customDescription && dateFrom && dateTo) {
        const formatDateForDisplay = (dateStr: string) => {
          const date = new Date(dateStr);
          return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          });
        };
        const fromDisplay = formatDateForDisplay(dateFrom);
        const toDisplay = formatDateForDisplay(dateTo);
        failDescription = `${customDescription} (${fromDisplay} to ${toDisplay}) - ${baseFailDesc}`;
      }

      await saveAPIFetchActivity(failDescription, 0, false);
    } catch (activityError) {
      console.error(
        'Failed To Save API Fetch Activity For Error:',
        activityError
      );
    }

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : 'An unknown error occurred',
        httpStatus: `<span class="text-[#ef4444]">500</span>`
      },
      { status: 500 }
    );
  }
}
