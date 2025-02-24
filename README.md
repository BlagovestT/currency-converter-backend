# Currency Converter Backend

This is the backend for the **Currency Converter** application. It provides APIs for fetching currency data, converting amounts between currencies, and managing currency rates.

## Tech Stack

- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: MySQL
- **ORM**: Prisma
- **Caching**: In-memory caching (optional)
- **Validation**: Zod
- **Logging**: Winston

## Features

- Fetch a list of all currencies.
- Fetch the latest exchange rates for currencies.
- Convert amounts between currencies.
- Cache conversion results to improve performance.

## Running the Backend

### Prerequisites

1. **Node.js**: Ensure you have Node.js installed (v16 or higher).
2. **MySQL**: Ensure you have a MySQL server running.
3. **Environment Variables**: Create a `.env` file in the root directory with the following variables:
   ```env
   DATABASE_URL="mysql://USER:PASSWORD@HOST:PORT/DATABASE_NAME"
   CURRENCY_API_KEY="your_api_key_here"
   ```
4. **Clone the repository**:  
   git clone https://github.com/your-repo/currency-converter-backend.git
   cd currency-converter-backend
5. **Install Dependencies**: npm install
6. **Run Prisma Migration**: npx prisma migrate dev --name init
7. **Start the server**: node index.ts
