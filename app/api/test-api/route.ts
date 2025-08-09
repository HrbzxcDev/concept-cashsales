import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // External API configuration
    const API_BASE_URL =
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      'https://dev-api.qne.cloud/api/CashSales';
    const DB_CODE = process.env.NEXT_PUBLIC_DB_CODE || '';

    console.log('Testing API connection...');
    console.log('API URL:', API_BASE_URL);
    console.log('DB CODE:', DB_CODE);

    // Build query parameters for external API
    const queryParams = new URLSearchParams();
    queryParams.append('limit', '5'); // Just get 5 records for testing

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
      return NextResponse.json(
        {
          success: false,
          message: `HTTP error! status: ${response.status} - ${errorText}`,
          status: response.status
        },
        { status: 500 }
      );
    }

    const apiData = await response.json();
    console.log('Raw API response:', JSON.stringify(apiData, null, 2));

    return NextResponse.json({
      success: true,
      message: 'API test successful',
      data: apiData,
      dataType: typeof apiData,
      isArray: Array.isArray(apiData),
      length: Array.isArray(apiData) ? apiData.length : 'Not an array',
      sampleRecord:
        Array.isArray(apiData) && apiData.length > 0 ? apiData[0] : null,
      sampleKeys:
        Array.isArray(apiData) && apiData.length > 0
          ? Object.keys(apiData[0])
          : []
    });
  } catch (error) {
    console.error('API Test Error:', error);
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
