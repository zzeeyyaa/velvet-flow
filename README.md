<p align="center">
  <img src="cupcake.svg" width="120" height="120" alt="VelvetFlow Logo" />
</p>

<h1 align="center">VelvetFlow</h1>

<p align="center">
  <b>A high-concurrency ticket flash-sale simulator.</b><br />
  Built with <b>Next.js 16</b>, <b>Hono (Bun/TypeScript)</b>, <b>Redis (SETNX)</b> distributed locking, PostgreSQL, and Docker to prevent race conditions under heavy load.
</p>

---

## 🎨 Visual Identity

The project is branded with a custom, retro **Vintage Strawberry Velvet Cupcake** icon, representing the smooth and delightful ("velvety") flow of transactions even under high stress. 

* **Maturity & Harmony:** The theme utilizes deep burgundy, dusty rose, and muted cream color schemes.
* **Retro Vibe:** Pixel-art design to bring a classic, nostalgic feel to modern system engineering.

---

## 🏗️ Architecture & Technology Stack

VelvetFlow is split into a clean client-server architecture:

```mermaid
graph TD
    A[Client App: Next.js 16] -->|Concurrent Flash-Sale Requests| B[API Gateway / Service: Hono on Bun]
    B -->|1. Try Lock: SETNX| C[(Redis Cache & Locking)]
    B -->|2. Persist Orders| D[(PostgreSQL Database)]
    E[Load Tester: k6] -->|Simulated Concurrent Traffic| B
```

### Backend (`/backend`)
* **Hono (Bun/TypeScript):** An ultra-fast, lightweight web framework designed for edge and high-concurrency runtimes, running on Bun for superior startup and execution speeds.
* **Redis Distributed Lock (SETNX):** Prevents double-booking or race conditions by creating atomic locks before processing ticket purchases.
* **PostgreSQL:** Serves as the persistent ledger for tickets, inventory, and completed checkout orders.

### Frontend (`/frontend`)
* **Next.js 16 (App Router):** Provides a modern, responsive, server-side rendered dashboard to monitor ticket inventory and simulate ticket booking.
* **Tailwind CSS v4:** Styles the application with custom vintage red-velvet themed designs.

### Testing & Infrastructure
* **Docker & Docker Compose:** Orchestrates PostgreSQL, Redis, Hono, and Next.js containers seamlessly.
* **k6 (by Grafana):** Simulates thousands of concurrent virtual users (VUs) to stress test the distributed locking system and capture performance metrics.

---

## 📂 Directory Structure

```text
velvet-flow/
├── backend/                  # Hono & Bun api service
│   ├── src/
│   │   ├── db/               # PostgreSQL client & migrations
│   │   ├── redis/            # Redis distributed locking wrappers
│   │   ├── routes/           # Flash-sale API endpoints
│   │   └── index.ts          # Main Hono entrypoint
│   ├── package.json
│   └── tsconfig.json
├── frontend/                 # Next.js client UI
│   ├── public/               # Static assets (contains cupcake.svg)
│   ├── src/
│   │   ├── app/              # Next.js pages & layouts
│   │   └── components/       # Reusable UI components
│   ├── package.json
│   └── tsconfig.json
├── cupcake.svg               # Root project icon (vintage pixel cupcake)
├── docker-compose.yml        # Multi-container local orchestration
└── README.md                 # Project main documentation
```

---

## 🚀 Getting Started

### Prerequisites
Make sure you have the following installed on your machine:
* [Bun](https://bun.sh/) (for backend execution)
* [Node.js & npm](https://nodejs.org/) (for frontend execution)
* [Docker & Docker Compose](https://www.docker.com/) (to run database and cache services)

---

### Step 1: Running the Infrastructure (Database & Cache)

To start PostgreSQL and Redis quickly, use Docker Compose:

```bash
docker compose up -d postgres redis
```

This boots:
* **PostgreSQL** on port `5432`
* **Redis** on port `6379`

---

### Step 2: Setup & Start the Backend

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install the Bun dependencies:
   ```bash
   bun install
   ```
3. Copy and set up the environment variables (create a `.env` file):
   ```env
   PORT=3000
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/velvet_flow
   REDIS_URL=redis://localhost:6379
   ```
4. Run the database migrations (if applicable) and start the development server:
   ```bash
   bun run dev
   ```
   The backend API will run on **`http://localhost:3000`**.

---

### Step 3: Setup & Start the Frontend

1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Start the Next.js development server:
   ```bash
   npm run dev
   ```
   The frontend application will run on **`http://localhost:3001`** (or `http://localhost:3000` depending on port availability).

---

## 🔒 How Distributed Locking Works

In a ticket flash-sale, multiple requests might try to claim the last available ticket at the exact same millisecond. To prevent overselling, VelvetFlow implements a **Redis-based Distributed Lock** using the `SETNX` (Set if Not Exists) command:

1. **Request Received:** Client requests to book ticket `TICKET_123` for user `USER_A`.
2. **Acquire Lock:** The backend tries to set a Redis key `lock:ticket:123` with a short TTL (Time to Live, e.g. 2000ms):
   ```redis
   SET lock:ticket:123 USER_A NX PX 2000
   ```
3. **Lock Result:**
   * **Success (`OK`):** The thread processes the transaction: checks inventory, creates a PostgreSQL order record, decreases the ticket count, and finally releases the lock.
   * **Failure (`NIL`):** Another thread already has the lock. The request is rejected or retried immediately with a `409 Conflict` (Sold Out / Busy).

---

## ⚡ Load Testing with k6

You can find stress testing scripts using **k6** inside the repository.

### Run k6 locally
1. Install [k6](https://k6.io/docs/getting-started/installation/).
2. Run the load test script:
   ```bash
   k6 run load-test.js
   ```

### Simulated Scenario
* **Target:** `POST /api/tickets/book`
* **VUs (Virtual Users):** 500 concurrent users hitting the booking endpoint simultaneously.
* **Duration:** 10s burst.
* **Expectation:** If 100 tickets are available, exactly 100 orders are registered in PostgreSQL. Redis prevents the other 400 requests from creating duplicate or phantom bookings.

---

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
