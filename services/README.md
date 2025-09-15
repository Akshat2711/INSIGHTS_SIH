# Aryabytes Admin API

A secure, rate-limited REST API backend built with Express and TypeScript for the Aryabytes. Includes enhanced logging, IP detection, and security best practices.

## Features

- Express.js with TypeScript
- Security headers via [helmet](https://www.npmjs.com/package/helmet)
- CORS enabled
- Rate limiting (100 requests per 15 minutes per IP)
- Enhanced request logging with IP detection
- Graceful shutdown handling
- Centralized error handling

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- npm

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env` file in the root directory. Example:

```
PORT=3000
NODE_ENV=development
```

### Development

Start the server with hot-reloading:

```bash
npm run dev
```

### Build

Compile TypeScript to JavaScript:

```bash
npm run build
```

### Production

Start the compiled server:

```bash
npm start
```

## API Endpoints

### `GET /`

Returns API status and metadata.

**Response:**

```json
{
  "message": "Welcome to Aryabytes API",
  "status": "success",
  "version": "1.0.0",
  "iss": "Aryabytes",
  "timestamp": "2025-07-03T17:51:00.000Z"
}
```

## Scripts

- `npm run dev` — Start development server with hot reload
- `npm run build` — Compile TypeScript
- `npm start` — Run production server
- `npm run lint` — Lint source files

## Security & Logging

- All requests are logged with method, URL, IP, and user agent.
- Rate limiting and security headers are enabled by default.

## License

See [LICENSE](LICENSE).
