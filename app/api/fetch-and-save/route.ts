import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/utils/db/drizzle';
import { cashsalesTable, apiactivityTable } from '@/utils/db/schema';
import { eq, and } from 'drizzle-orm';
import { fetchAndSaveCashSalesDetails } from '@/actions/fetchapi';
import { saveNotification } from '@/actions/notifications';

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
  alreadyCompleted?: boolean;
  detailsResult?: {
    success: boolean;
    message: string;
    savedCount?: number;
    updatedCount?: number;
    errors?: string[];
    alreadyCompleted?: boolean;
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

    return activityRecord[0];
  } catch (error) {
    // console.error('Error saving API fetch activity:', error);
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
  const limit = parseInt(searchParams.get('limit') || '500');
  const upsert = searchParams.get('upsert') === 'true';
  const dateFrom = searchParams.get('dateFrom');
  const dateTo = searchParams.get('dateTo');
  const fetchDetails = searchParams.get('fetchDetails') !== 'false'; // Default to true unless explicitly set to false
  const autoFetchDetails = searchParams.get('autoFetchDetails') !== 'false'; // Default to true unless explicitly set to false
  const detailsLimit = parseInt(searchParams.get('detailsLimit') || '500');
  const detailsBatchSize = parseInt(
    searchParams.get('detailsBatchSize') || '500'
  );
  const forceDetails = searchParams.get('forceDetails') === 'true'; // Force re-run details even if already completed

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
    queryParams.append('$top', limit > 0 ? limit.toString() : '500');
    // Use provided date range if available, otherwise default to [yesterday, today)
    const fromDate = dateFrom || yesterday;
    const toDate = dateTo || today;

    // console.log('Starting fetch and save operation...');
    // console.log('API URL:', API_BASE_URL);
    // console.log('DB CODE:', DB_CODE);
    // console.log('Limit:', limit);
    // console.log('Upsert:', upsert);
    // console.log('Date From:', fromDate);
    // console.log('Date To:', toDate);
    // console.log('Fetch Details:', fetchDetails);
    // console.log('Auto Fetch Details:', autoFetchDetails);
    queryParams.append(
      '$filter',
      `cashsalesdate ge ${fromDate} and cashsalesdate le ${toDate}`
    );

    // Construct the full URL
    const url = `${API_BASE_URL}?${queryParams.toString()}`;

    // console.log('Fetching data from:', url);

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
      // console.error('API Error Response:', errorText);
      throw new Error(
        `HTTP error! status: <span class="text-[#ef4444]">${response.status}</span> - ${errorText}`
      );
    }

    const apiData: ExternalAPICashSale[] = await response.json();
    // console.log(`Fetched ${apiData.length} Records From External API`);
    // console.log(
    //   'Raw API response sample:',
    //   JSON.stringify(apiData.slice(0, 2), null, 2)
    // );

    if (!Array.isArray(apiData) || apiData.length === 0) {
      // Save activity for empty response, but avoid duplicates for the same date
      // Only log for manual fetches or if no activity was logged today for automatic fetches
      try {
        const baseNoDataDesc =
          'API Fetch Operation - No Data Returned From External API';
        const existingNoData = await db
          .select({ id: apiactivityTable.id })
          .from(apiactivityTable)
          .where(
            and(
              eq(apiactivityTable.datefetched, today),
              eq(apiactivityTable.description, baseNoDataDesc)
            )
          )
          .limit(1);

        // Only log if it's a manual fetch or if no activity was logged today for automatic fetches
        const shouldLogNoData =
          customDescription || existingNoData.length === 0;

        if (shouldLogNoData) {
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
          // console.log(
          //   `Skipping duplicate no-data activity for ${today} (already logged for automatic fetch)`
          // );
        }
      } catch (activityError) {
        // console.error(
        //   'Failed to save API fetch activity for empty response:',
        //   activityError
        // );
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
          break;
        }
      }
      const isValid = cashsalesid !== null;

      if (!isValid) {
        // console.warn(
        //   'Skipping invalid record - no valid cashsalesid found:',
        //   JSON.stringify(item, null, 2)
        // );
      }
      return isValid;
    });

    // console.log(
    //   `Filtered to ${validRecords.length} valid records out of ${apiData.length} total`
    // );

    if (validRecords.length === 0) {
      // Save activity for no valid records, but only for manual fetches or if not already logged today
      try {
        const baseNoValidDesc =
          'API Fetch Operation - No Valid Records Found After Filtering';
        const existingNoValid = await db
          .select({ id: apiactivityTable.id })
          .from(apiactivityTable)
          .where(
            and(
              eq(apiactivityTable.datefetched, today),
              eq(apiactivityTable.description, baseNoValidDesc)
            )
          )
          .limit(1);

        // Only log if it's a manual fetch or if no activity was logged today for automatic fetches
        const shouldLogNoValid =
          customDescription || existingNoValid.length === 0;

        if (shouldLogNoValid) {
          let noValidDescription = customDescription
            ? `${customDescription} - ${baseNoValidDesc}`
            : baseNoValidDesc;

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
            noValidDescription = `${customDescription} (${fromDisplay} to ${toDisplay}) - ${baseNoValidDesc}`;
          }

          await saveAPIFetchActivity(noValidDescription, 0, true);
        } else {
          // console.log(
          //   `Skipping duplicate no-valid-records activity for ${today} (already logged for automatic fetch)`
          // );
        }
      } catch (activityError) {
        // console.error(
        //   'Failed to save API fetch activity for no valid records:',
        //   activityError
        // );
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
        const transformedData = transformAPIToDB(item);
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
        // console.error(errorMessage);
        // console.error('Raw item data:', JSON.stringify(item, null, 2));
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

      // Save success activity when there are NEW changes from the API.
      // For manual fetches (with customDescription), always log activity regardless of new records.
      // For automatic fetches, only log when there are new records saved or updated.
      // Additionally, for automatic fetches, we want to be more strict about what constitutes "new data"
      const hasChanges = savedCount > 0 || updatedCount > 0;
      let shouldSaveActivity = customDescription ? true : hasChanges;

      // For automatic fetches, be more strict - only log if there are actual meaningful changes
      if (!customDescription) {
        // If no records were saved or updated, definitely don't log
        if (!hasChanges) {
          shouldSaveActivity = false;
        }
        // If only "saved" records but no updates, and this is a repeated operation,
        // it might be duplicate data being inserted
        else if (savedCount > 0 && updatedCount === 0) {
          // Check if we've already logged a similar activity today
          try {
            const similarActivity = await db
              .select({ id: apiactivityTable.id })
              .from(apiactivityTable)
              .where(
                and(
                  eq(apiactivityTable.datefetched, today)
                  // Look for activities with similar saved counts
                  // This is a heuristic to detect duplicate operations
                )
              )
              .limit(5); // Check last 5 activities

            // If we have multiple activities today with similar patterns, be more cautious
            if (similarActivity.length >= 2) {
              // console.log(
              //   `Multiple similar activities detected today, skipping to prevent duplicate logs`
              // );
              shouldSaveActivity = false;
            }
          } catch (checkError) {
            // console.error('Error checking for similar activities:', checkError);
            // Continue with logging if we can't check
          }
        }
      }

      // For automatic fetches, check if we already logged a similar activity recently
      if (!customDescription && hasChanges) {
        try {
          const recentActivity = await db
            .select({ id: apiactivityTable.id })
            .from(apiactivityTable)
            .where(
              and(
                eq(apiactivityTable.description, activityDescription),
                eq(apiactivityTable.datefetched, today)
              )
            )
            .limit(1);

          if (recentActivity.length > 0) {
            shouldSaveActivity = false;
            // console.log(
            //   `Skipping duplicate main activity log for today (similar activity already logged)`
            // );
          }
        } catch (duplicateCheckError) {
          // console.error('Error checking for duplicate main activity:', duplicateCheckError);
          // Continue with logging if we can't check for duplicates
        }
      }

      if (!shouldSaveActivity) {
        // console.log(
        //   'Skipping activity log (no new records saved or updated, data already exists)'
        // );
      }

      if (shouldSaveActivity) {
        await saveAPIFetchActivity(
          activityDescription,
          validRecords.length,
          errors.length === 0
        );
      }

      // console.log('API Fetch Activity Saved Successfully');
    } catch (activityError) {
      // console.error('Failed to save API fetch activity:', activityError);
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

        // Create notification for skipped cash sales codes
        try {
          const notificationTitle = `⚠️ Skipped Cash Sales Codes Detected`;
          const notificationMessage = missingcashcodes
            ? `Found ${totalMissing} missing cash sales codes: ${missingcashcodes}${
                totalMissing > 5 ? '...' : ''
              }`
            : `Found ${totalMissing} missing cash sales codes in the sequence.`;

          await saveNotification({
            type: 'skipped_cashsalescode',
            title: notificationTitle,
            message: notificationMessage,
            data: {
              totalMissing,
              missingCodes: missingcodes,
              timestamp: new Date().toISOString()
            }
          });
        } catch (notificationError) {
          // Don't fail the main operation if notification creation fails
          console.error(
            'Failed to create notification for skipped codes:',
            notificationError
          );
        }
      }
    } catch (validationError) {
      // console.error(
      //   'Failed to validate and log skipped cashsalescode:',
      //   validationError
      // );
      // Do not interrupt the main flow
    }

    // Fetch and save cash sales details if requested
    let detailsResult = null;
    if (fetchDetails || autoFetchDetails) {
      try {
        // console.log('Starting cash sales details fetch operation...');

        // Use date-based fetching for details, similar to how cash sales are fetched
        const fromDate = dateFrom || yesterday;
        const toDate = dateTo || today;

        // Log whether we're using manual dates or default dates
        if (dateFrom && dateTo) {
          // console.log(
          //   `Using MANUAL date range for details: ${fromDate} to ${toDate}`
          // );
        } else {
          // console.log(
          //   `Using DEFAULT date range for details: ${fromDate} to ${toDate}`
          // );
        }

        // For automatic fetches, force re-run if new cash sales codes were saved
        // For manual fetches, allow force re-run
        const shouldForceDetails = customDescription ? forceDetails : (savedCount > 0);

        detailsResult = await fetchAndSaveCashSalesDetails(fromDate, toDate, {
          upsert: upsert,
          batchSize: detailsBatchSize,
          limit: detailsLimit,
          force: shouldForceDetails
        });

        // console.log(
        //   'Cash sales details fetch operation completed:',
        //   detailsResult
        // );

        // Save activity for details fetch only when there are NEW changes
        // For manual fetches (with customDescription), always log details activity regardless of new records.
        // For automatic fetches, only log when there are new records saved or updated.
        if (detailsResult.success) {
          const newRecords = detailsResult.savedCount || 0;
          const updatedRecords = detailsResult.updatedCount || 0;
          const hasDetailsChanges = newRecords > 0 || updatedRecords > 0;
          const wasAlreadyCompleted = detailsResult.alreadyCompleted || false;

          // For automatic fetches, be more strict about logging
          let shouldLogDetails = customDescription ? true : hasDetailsChanges;

          // Don't log if the operation was already completed (for automatic fetches)
          if (!customDescription && wasAlreadyCompleted) {
            shouldLogDetails = false;
            // console.log(
            //   'Skipping details fetch activity log (operation already completed previously)'
            // );
          }

          // For automatic fetches, add additional checks to prevent unnecessary logging
          if (!customDescription) {
            // If no changes, definitely don't log
            if (!hasDetailsChanges) {
              shouldLogDetails = false;
              // console.log(
              //   'Skipping details fetch activity log (no new records saved or updated, data already exists)'
              // );
            }
            // If there are changes, check for duplicates
            else {
              const formatDateForDisplay = (dateStr: string) => {
                const date = new Date(dateStr);
                return date.toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                });
              };
              const fromDisplay = formatDateForDisplay(fromDate);
              const toDisplay = formatDateForDisplay(toDate);
              const detailsDescriptionPattern = `CashSales Details - (${fromDisplay} to ${toDisplay}) - ${detailsResult.savedCount} saved, ${detailsResult.updatedCount} updated`;

              try {
                const recentActivity = await db
                  .select({ id: apiactivityTable.id })
                  .from(apiactivityTable)
                  .where(
                    and(
                      eq(
                        apiactivityTable.description,
                        detailsDescriptionPattern
                      ),
                      eq(apiactivityTable.datefetched, today)
                    )
                  )
                  .limit(1);

                if (recentActivity.length > 0) {
                  shouldLogDetails = false;
                  // console.log(
                  //   `Skipping duplicate details activity log for today (similar activity already logged)`
                  // );
                }
              } catch (duplicateCheckError) {
                // console.error('Error checking for duplicate details activity:', duplicateCheckError);
                // Continue with logging if we can't check for duplicates
              }
            }
          }

          if (shouldLogDetails) {
            const formatDateForDisplay = (dateStr: string) => {
              const date = new Date(dateStr);
              return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              });
            };
            const fromDisplay = formatDateForDisplay(fromDate);
            const toDisplay = formatDateForDisplay(toDate);
            const manualPrefix = customDescription ? 'Manual Fetch - ' : '';
            const detailsDescription = `CashSales Details - ${manualPrefix} (${fromDisplay} to ${toDisplay}) - ${detailsResult.savedCount} saved, ${detailsResult.updatedCount} updated`;
            await saveAPIFetchActivity(
              detailsDescription,
              newRecords + updatedRecords,
              true
            );
          }
        } else {
          await saveAPIFetchActivity(
            'Cash Sales Details Fetch Failed',
            0,
            false
          );
        }

        // console.log(
        //   'Cash sales details operation completed:',
        //   detailsResult.message
        // );
      } catch (detailsError) {
        // console.error('Error in cash sales details fetch:', detailsError);
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
      alreadyCompleted: detailsResult?.alreadyCompleted || false,
      detailsResult: detailsResult
    };

    if (errors.length > 0) {
      responseData.errors = errors;
    }

    // console.log('Operation Completed:', responseData.message);

    return NextResponse.json(responseData, { status: 200 });
  } catch (error) {
    // console.error('API Error:', error);

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
      // console.error(
      //   'Failed To Save API Fetch Activity For Error:',
      //   activityError
      // );
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
