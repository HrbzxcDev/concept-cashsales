import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/utils/db/drizzle';
import { cashsalesTable } from '@/utils/db/schema';

/**
 * Simple server-side GET function that saves sample data to database
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const count = parseInt(searchParams.get('count') || '1');

    console.log(`Creating ${count} sample cash sales records...`);

    const sampleData = [];
    const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

    // Generate sample data
    for (let i = 1; i <= count; i++) {
      sampleData.push({
        cashsalesid: `SAMPLE-${Date.now()}-${i}`,
        cashsalesdate: timestamp,
        cashsalescode: `CODE-${i.toString().padStart(3, '0')}`,
        customer: `Customer ${i}`,
        stocklocation: `Location ${i}`,
        status: i % 2 === 0, // Alternate between true and false
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    // Save to database
    const savedRecords = await db
      .insert(cashsalesTable)
      .values(sampleData)
      .returning();

    console.log(
      `Successfully saved ${savedRecords.length} records to database`
    );

    return NextResponse.json(
      {
        success: true,
        message: `Successfully created ${savedRecords.length} sample cash sales records`,
        data: savedRecords,
        count: savedRecords.length
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error creating sample data:', error);
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

/**
 * POST method for creating sample data with custom parameters
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { count = 1, customData } = body;

    console.log(`Creating ${count} custom cash sales records...`);

    let dataToSave;

    if (customData && Array.isArray(customData)) {
      // Use provided custom data
      dataToSave = customData.map((item: any, index: number) => ({
        cashsalesid: item.cashsalesid || `CUSTOM-${Date.now()}-${index + 1}`,
        cashsalesdate:
          item.cashsalesdate || new Date().toISOString().split('T')[0],
        cashsalescode:
          item.cashsalescode ||
          `CUSTOM-CODE-${(index + 1).toString().padStart(3, '0')}`,
        customer: item.customer || `Custom Customer ${index + 1}`,
        stocklocation: item.stocklocation || `Custom Location ${index + 1}`,
        status: item.status !== undefined ? item.status : true,
        createdAt: new Date(),
        updatedAt: new Date()
      }));
    } else {
      // Generate sample data
      const timestamp = new Date().toISOString().split('T')[0];
      dataToSave = [];

      for (let i = 1; i <= count; i++) {
        dataToSave.push({
          cashsalesid: `POST-SAMPLE-${Date.now()}-${i}`,
          cashsalesdate: timestamp,
          cashsalescode: `POST-CODE-${i.toString().padStart(3, '0')}`,
          customer: `POST Customer ${i}`,
          stocklocation: `POST Location ${i}`,
          status: i % 2 === 0,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
    }

    // Save to database
    const savedRecords = await db
      .insert(cashsalesTable)
      .values(dataToSave)
      .returning();

    console.log(
      `Successfully saved ${savedRecords.length} records to database via POST`
    );

    return NextResponse.json(
      {
        success: true,
        message: `Successfully created ${savedRecords.length} cash sales records via POST`,
        data: savedRecords,
        count: savedRecords.length
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error creating sample data via POST:', error);
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
