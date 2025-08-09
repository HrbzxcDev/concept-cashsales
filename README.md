# Cash Sales API Server

A comprehensive Next.js server with API routes for fetching data from external APIs and managing cash sales data in a database.

## Features

- **API Data Fetching**: Fetch data from external APIs and save to database
- **Database Operations**: Full CRUD operations for cash sales data
- **Pagination & Filtering**: Advanced querying with date ranges and sorting
- **Statistics**: Get aggregated statistics and insights
- **Health Monitoring**: Server health check endpoint
- **Error Handling**: Comprehensive error handling and logging

## API Endpoints

### Health Check

```
GET /api/health
```

Check server and database connectivity.

**Response:**

```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "database": {
    "status": "connected",
    "responseTime": "15ms"
  },
  "environment": {
    "nodeEnv": "development",
    "databaseUrl": "configured",
    "apiBaseUrl": "configured"
  }
}
```

### Fetch Data from External API

```
POST /api/fetch-data
GET /api/fetch-data
```

**POST Body:**

```json
{
  "action": "fetchAndSave",
  "limit": 100,
  "offset": 0,
  "dateFrom": "2024-01-01",
  "dateTo": "2024-01-31",
  "upsert": false,
  "batchSize": 50
}
```

**GET Query Parameters:**

- `action`: `fetchAndSave` | `fetchById` | `syncAll`
- `limit`: Number of records to fetch
- `offset`: Number of records to skip
- `dateFrom`: Start date (YYYY-MM-DD)
- `dateTo`: End date (YYYY-MM-DD)
- `upsert`: Update existing records if true
- `batchSize`: Records per batch
- `id`: Required for `fetchById` action

### Fetch Data by Date

```
POST /api/fetch-data/by-date
GET /api/fetch-data/by-date
```

**POST Body:**

```json
{
  "date": "2024-01-15",
  "fromAPI": true,
  "fromDB": true,
  "upsert": false
}
```

**GET Query Parameters:**

- `date`: Date to fetch (YYYY-MM-DD)
- `fromAPI`: Fetch from external API
- `fromDB`: Fetch from database
- `upsert`: Update existing records

### Cash Sales Management

```
GET /api/cashsales
POST /api/cashsales
```

**GET Query Parameters:**

- `page`: Page number
- `limit`: Records per page
- `offset`: Records to skip
- `dateFrom`: Start date filter
- `dateTo`: End date filter
- `sortBy`: Field to sort by
- `sortOrder`: `asc` or `desc`
- `action=stats`: Get statistics

**Statistics Response:**

```json
{
  "success": true,
  "message": "Statistics retrieved successfully",
  "data": {
    "total": 1000,
    "active": 750,
    "inactive": 250,
    "uniqueCustomers": 150,
    "uniqueLocations": 25
  }
}
```

### Individual Cash Sale Operations

```
GET /api/cashsales/[id]
PUT /api/cashsales/[id]
DELETE /api/cashsales/[id]
```

## Environment Variables

Create a `.env.local` file with the following variables:

```env
# Database
DATABASE_URL=your_database_connection_string

# External API
NEXT_PUBLIC_API_BASE_URL=https://dev-api.qne.cloud/api/CashSales
NEXT_PUBLIC_DB_CODE=your_api_db_code
```

## Database Schema

The application uses a PostgreSQL database with the following schema:

```sql
CREATE TABLE tblcashsales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cashsalesid VARCHAR(150) NOT NULL,
  cashsalesdate DATE NOT NULL,
  cashsalescode VARCHAR(50) NOT NULL,
  customer VARCHAR(50) NOT NULL,
  stocklocation VARCHAR(50) NOT NULL,
  status BOOLEAN NOT NULL,
  createdAt TIMESTAMP NOT NULL DEFAULT NOW(),
  updatedAt TIMESTAMP NOT NULL DEFAULT NOW()
);
```

## Usage Examples

### Fetch and Save Data

```bash
# Fetch 100 records from API and save to database
curl -X POST http://localhost:3000/api/fetch-data \
  -H "Content-Type: application/json" \
  -d '{
    "action": "fetchAndSave",
    "limit": 100,
    "upsert": true
  }'

# Fetch data for a specific date range
curl -X GET "http://localhost:3000/api/fetch-data?action=fetchAndSave&dateFrom=2024-01-01&dateTo=2024-01-31&limit=50"
```

### Get Cash Sales Data

```bash
# Get paginated cash sales
curl "http://localhost:3000/api/cashsales?page=1&limit=20&sortBy=cashsalesdate&sortOrder=desc"

# Get statistics
curl "http://localhost:3000/api/cashsales?action=stats&dateFrom=2024-01-01&dateTo=2024-01-31"
```

### Manage Individual Records

```bash
# Get a specific cash sale
curl "http://localhost:3000/api/cashsales/123e4567-e89b-12d3-a456-426614174000"

# Update a cash sale
curl -X PUT http://localhost:3000/api/cashsales/123e4567-e89b-12d3-a456-426614174000 \
  -H "Content-Type: application/json" \
  -d '{
    "customer": "Updated Customer Name",
    "status": true
  }'

# Delete a cash sale
curl -X DELETE http://localhost:3000/api/cashsales/123e4567-e89b-12d3-a456-426614174000
```

## Error Handling

All API endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

## Development

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Environment variables configured

### Installation

```bash
npm install
```

### Database Setup

```bash
# Push schema to database
npm run db:push

# Generate migrations
npm run db:generate

# Run migrations
npm run db:migrate
```

### Development Server

```bash
npm run dev
```

The server will be available at `http://localhost:3000`

### Database Studio

```bash
npm run db:studio
```

Access Drizzle Studio at `http://localhost:4983`

## API Response Format

All successful API responses follow this format:

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    // Response data
  }
}
```

## Batch Processing

For large datasets, the API supports batch processing:

- **Batch Size**: Configurable batch size for processing records
- **Error Handling**: Individual record errors don't stop the entire process
- **Progress Tracking**: Logs progress for each batch
- **Upsert Support**: Update existing records or skip duplicates

## Security Considerations

- Environment variables for sensitive configuration
- Input validation and sanitization
- Error messages don't expose sensitive information
- Database connection pooling
- Rate limiting (can be added with middleware)

## Monitoring

- Health check endpoint for monitoring
- Comprehensive logging
- Error tracking
- Database connection monitoring
- Response time tracking
