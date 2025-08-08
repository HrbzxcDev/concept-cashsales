const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://dev-api.qne.cloud/api/CashSales";

// Define the type for cash sales data
export interface CashSale {
  id: string;
  amount: number;
  date: string;
  description?: string;
  // Add more fields as needed based on your API response
}

export interface FetchDataResponse {
  data: CashSale[];
  success: boolean;
  message?: string;
}

export interface FetchDataOptions {
  limit?: number;
  offset?: number;
  dateFrom?: string;
  dateTo?: string;
  // Add more query parameters as needed
}

/**
 * Fetches cash sales data from the API
 * @param options - Optional query parameters
 * @returns Promise with the fetched data
 */
export async function fetchCashSalesData(
  options: FetchDataOptions = {}
): Promise<FetchDataResponse> {
  try {
    // Build query parameters
    const queryParams = new URLSearchParams();

    if (options.limit) {
      queryParams.append("limit", options.limit.toString());
    }

    if (options.offset) {
      queryParams.append("offset", options.offset.toString());
    }

    if (options.dateFrom) {
      queryParams.append("dateFrom", options.dateFrom);
    }

    if (options.dateTo) {
      queryParams.append("dateTo", options.dateTo);
    }

    // Construct the full URL
    const url = queryParams.toString()
      ? `${API_BASE_URL}?${queryParams.toString()}`
      : API_BASE_URL;

    // Debug logging
    console.log("API URL:", url);
    console.log("DBCODE:", process.env.NEXT_PUBLIC_DB_CODE);
    console.log("Headers:", {
      "Content-Type": "application/json",
      dbcode: process.env.DBCODE || "",
    });

    // Make the API request
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        dbcode: process.env.NEXT_PUBLIC_DB_CODE || "",
        // Add any required authentication headers here
        // 'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Error Response:", errorText);
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    return {
      data: data,
      success: true,
    };
  } catch (error) {
    console.error("Error fetching cash sales data:", error);

    return {
      data: [],
      success: false,
      message:
        error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
}

/**
 * Fetches a single cash sale by ID
 * @param id - The ID of the cash sale to fetch
 * @returns Promise with the fetched cash sale data
 */
export async function fetchCashSaleById(
  id: string
): Promise<FetchDataResponse> {
  try {
    console.log("Fetching cash sale by ID:", id);
    console.log("DBCODE:", process.env.NEXT_PUBLIC_DB_CODE);

    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        dbcode: process.env.NEXT_PUBLIC_DB_CODE || "",
        // Add any required authentication headers here
        // 'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Error Response:", errorText);
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    return {
      data: [data],
      success: true,
    };
  } catch (error) {
    console.error(`Error fetching cash sale with ID ${id}:`, error);

    return {
      data: [],
      success: false,
      message:
        error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
}
