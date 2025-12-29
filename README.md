# Pastebin Lite

Pastebin Lite is a simple Pastebin-like web application that allows users to create text pastes and share them using a unique URL.  
Each paste can optionally expire after a certain time (TTL) or after a limited number of views.

This project was built as part of a take-home assignment and is designed to work correctly in a serverless environment.

---

## Features

- Create text pastes
- Generate shareable URLs
- View pastes via API or browser
- Optional time-based expiry (TTL)
- Optional view-count limits
- Deterministic time support for automated testing
- Safe HTML rendering (no script execution)

---

## Tech Stack

- Node.js
- Express.js
- Vercel Serverless Functions
- Vercel KV (Redis) for persistence

---

## Running the Project Locally

### Prerequisites

- Node.js v18 or higher
- npm
- Vercel account (for KV credentials)

### Steps

1. Clone the repository:
   ```bash
   git clone <your-repository-url>
   cd pastebin-lite
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Pull environment variables from Vercel:
   ```bash
   vercel env pull .env
   ```

4. Start the server:
   ```bash
   npm start
   ```

5. Open the application in your browser:
   ```
   http://localhost:3000
   ```

---

## API Endpoints

- `GET /api/healthz`  
  Health check endpoint.

- `POST /api/pastes`  
  Create a new paste.

- `GET /api/pastes/:id`  
  Fetch a paste as JSON.

- `GET /p/:id`  
  View a paste as HTML.

---

## Persistence Layer

This application uses **Vercel KV (Redis)** as its persistence layer.

Vercel KV ensures that paste data:
- Persists across serverless function invocations
- Is not stored in in-memory variables
- Works reliably in a serverless deployment environment

---

## Notes

- Expired or view-limited pastes return HTTP 404
- TTL and view limits are enforced before serving content
- Deterministic testing is supported using the `TEST_MODE` environment variable and the `x-test-now-ms` request header
