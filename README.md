# FinanceFlow — Full-Stack Expense & Finance Manager

A modern, production-ready, full-stack personal finance and expense management web application. Built with **React 18, Vite, Tailwind CSS, Recharts, Node.js, Express, PostgreSQL, and Prisma ORM**.

FinanceFlow empowers users to track periodic income and expenses, set category-wise monthly budgets with automated deduplicated overspending alerts, visualize financial trends through interactive charts, and automate recurring subscriptions using scheduled jobs.

---

## 🌟 Key Features

- **Authentication & User Management:**
  - Secure registration and login with email & password.
  - Salted password hashing with `bcryptjs` (cost factor 10).
  - JWT-based authentication supporting Bearer token headers and secure HttpOnly cookies.
  - Multi-tenant data isolation: every query is scoped to the authenticated user ID.
  - User profile customization and password update functionality.

- **Dashboard & Cashflow Analytics:**
  - Real-time KPI summary cards: Total Income, Total Expenses, Period Net Cashflow, Monthly Savings, Savings Rate, and Budget Utilization.
  - **Lifetime Net Worth vs. Period Cashflow:** Clearly separates accumulated account balances from current-period net cashflow.
  - Dynamic date filters: *This Month*, *Last Month*, *Last 3 Months*, *This Year*, and *Custom Date Range*.
  - Recent transactions ledger and live monthly budget warnings widget.

- **Transaction Management:**
  - Full CRUD operations for income and expenses.
  - High-precision monetary amounts using PostgreSQL `NUMERIC` / Prisma `Decimal(12, 2)` (zero floating-point drift).
  - Search by description or notes, filter by type and category, sort by date or amount, and server-side pagination.
  - Native **CSV export** for transaction reporting and spreadsheets.
  - Automatic recalculation of monthly category budgets and alert thresholds upon any create, update, or delete.

- **Category Management:**
  - 16 pre-seeded default categories (Food, Housing, Utilities, Transportation, Salary, Freelance, etc.) with custom color palettes.
  - Custom user-created categories.
  - **Data Integrity Protection:** Prevents deleting categories with dependent transactions, offering an atomic safe reassignment option to prevent breaking historical records.

- **Category-Wise Budgeting & Automated Alerts:**
  - Set monthly budget limits per expense category.
  - Live progress indicators with visual status tiers:
    - **Normal (< 75%):** Emerald Green
    - **Warning (75% - 89%):** Amber
    - **Critical (90% - 100%):** Orange
    - **Overspent (> 100%):** Rose Red
  - **Automated Overspending Alerts:** In-app notifications generated when category spending hits 75%, 90%, 100%, or >100%.
  - **Database-Backed Deduplication:** Prevents spamming duplicate alerts for the same user, month, category, and threshold crossing.

- **Financial Analytics using Recharts:**
  1. *Income vs. Expenses:* Grouped monthly bar chart comparing earnings and spending.
  2. *Expense Breakdown:* Donut chart showing category percentage distributions.
  3. *Monthly Spending Trend:* Smooth area chart illustrating expense velocity.
  4. *Category Comparison:* Horizontal bar chart comparing category volumes.
  5. *Budget vs. Actual:* Side-by-side grouped bar chart comparing planned limits vs actual spend.
  6. *Savings Trend:* Line chart tracking monthly net cash accumulation over time.

- **Automated Recurring Transactions:**
  - Setup recurring rules for subscriptions, salaries, rent, and utility bills.
  - Frequencies: *Daily*, *Weekly*, *Monthly*, *Yearly*.
  - Background scheduler running via `node-cron`.
  - **Idempotent Execution Ledger:** Generates an idempotency key (`${ruleId}_${date}`) stored in PostgreSQL to guarantee zero duplicate transactions even during restarts or retries.
  - Manual processing endpoint (`POST /api/recurring/process-due`) for serverless or sleeping instances.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, JavaScript, Tailwind CSS, Lucide React, Recharts, React Router DOM v6, Axios, React Hook Form |
| **Backend** | Node.js, Express.js, JWT (`jsonwebtoken`), `bcryptjs`, `node-cron`, `zod` validation, `helmet`, `cors`, `cookie-parser`, `express-rate-limit` |
| **Database** | PostgreSQL, Prisma ORM (Client & CLI), PostgreSQL Enums, Indexes, and Constraints |
| **Testing** | Jest, Supertest |
| **Deployment** | Frontend: Vercel (SPA rewrites) • Backend: Render • Database: Render PostgreSQL / Supabase / Neon |

---

## 🏗️ Architecture & Data Flow

```mermaid
graph TD
    Client["React 18 + Vite (Client)\nTailwind CSS • Recharts • Axios"]
    ReverseProxy["Vercel SPA Routing\n(/index.html rewrite)"]
    ExpressAPI["Node.js + Express API (Server)\nHelmet • Rate Limiting • JWT Middleware • Zod"]
    CronJob["node-cron Scheduler\n(Automated Daily Trigger)"]
    PrismaORM["Prisma Client ORM\n(Schema & Decimal Validation)"]
    PostgresDB[(PostgreSQL Database\nUsers • Categories • Transactions\nBudgets • Notifications • Recurring)]

    Client -->|HTTPS REST API Requests| ExpressAPI
    Client --> ReverseProxy
    CronJob -->|Triggers processDue()| ExpressAPI
    ExpressAPI -->|Type-Safe Parameterized Queries| PrismaORM
    PrismaORM --> PostgresDB
```

---

## 📂 Project Structure

```
Expense_&_Finance_Manager/
├── client/                               # Frontend React + Vite application
│   ├── public/
│   │   └── favicon.svg                   # Brand SVG favicon
│   ├── src/
│   │   ├── charts/                       # Recharts visualization components
│   │   │   ├── BudgetVsActualBarChart.jsx
│   │   │   ├── CategoryComparisonBarChart.jsx
│   │   │   ├── ExpenseBreakdownPieChart.jsx
│   │   │   ├── IncomeExpenseBarChart.jsx
│   │   │   ├── MonthlySpendingTrendChart.jsx
│   │   │   └── SavingsTrendChart.jsx
│   │   ├── components/                   # Modular UI components
│   │   │   ├── budgets/                  # Budget cards and progress bars
│   │   │   ├── categories/               # Category modals & reassignment dialog
│   │   │   ├── common/                   # Spinners, badges, modals, empty states
│   │   │   ├── dashboard/                # Summary cards, date filters, recent txs
│   │   │   ├── layout/                   # Sidebar, Navbar, AppLayout, ProtectedRoute
│   │   │   ├── notifications/            # Notification dropdown preview
│   │   │   ├── recurring/                # Recurring rules table and modal
│   │   │   └── transactions/             # Transactions table, filters, details
│   │   ├── context/                      # AuthContext and NotificationContext
│   │   ├── hooks/                        # useAuth, useNotifications custom hooks
│   │   ├── pages/                        # View pages
│   │   │   ├── AnalyticsPage.jsx
│   │   │   ├── BudgetsPage.jsx
│   │   │   ├── CategoriesPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── LandingPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── NotificationsPage.jsx
│   │   │   ├── NotFoundPage.jsx
│   │   │   ├── ProfilePage.jsx
│   │   │   ├── RecurringPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   └── TransactionsPage.jsx
│   │   ├── services/                     # Centralized Axios API services
│   │   │   ├── analyticsService.js
│   │   │   ├── api.js
│   │   │   ├── authService.js
│   │   │   ├── budgetService.js
│   │   │   ├── categoryService.js
│   │   │   ├── notificationService.js
│   │   │   ├── recurringService.js
│   │   │   └── transactionService.js
│   │   ├── utils/                        # Currency, date, and CSV download helpers
│   │   │   ├── exportCsv.js
│   │   │   └── formatters.js
│   │   ├── App.jsx                       # Root router configuration
│   │   ├── index.css                     # Tailwind CSS directives & theme rules
│   │   └── main.jsx                      # DOM mount
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   ├── vercel.json                       # Vercel SPA rewrites
│   └── vite.config.js
├── server/                               # Backend Express & Prisma application
│   ├── prisma/
│   │   ├── migrations/                   # PostgreSQL DDL migrations
│   │   ├── schema.prisma                 # Database schema models & enums
│   │   └── seed.js                       # Seeder with default categories & demo user
│   ├── src/
│   │   ├── config/                       # DB client, env variables, constants
│   │   ├── controllers/                  # Express REST controllers
│   │   ├── jobs/                         # node-cron recurring job processor
│   │   ├── middleware/                   # JWT auth, Zod validation, error handler, rate limit
│   │   ├── routes/                       # Express router endpoints
│   │   ├── services/                     # Business logic and database operations
│   │   ├── utils/                        # Precise Decimal math, logger, date helpers
│   │   ├── validators/                   # Zod schemas for all endpoints
│   │   └── app.js                        # Express app setup and middleware chain
│   ├── tests/                            # Jest automated test suite
│   │   ├── analytics.test.js
│   │   ├── auth.test.js
│   │   ├── budget_and_alerts.test.js
│   │   ├── recurring_idempotency.test.js
│   │   ├── transactions.test.js
│   │   └── mocks/mockDb.js               # In-memory Prisma mock for testing
│   ├── .env.example
│   ├── package.json
│   └── server.js                         # Server listener and graceful shutdown
├── render.yaml                           # Render Infrastructure as Code blueprint
├── .gitignore
└── README.md
```

---

## ⚡ Quick Start & Local Setup

### Prerequisites
- **Node.js** v18+ (tested on Node v26)
- **npm** v9+
- A running **PostgreSQL** database (Local PostgreSQL, Docker, or free cloud provider like Supabase/Neon/Render)

### 1. Clone & Install Dependencies

#### PowerShell (Windows):
```powershell
# Navigate to the workspace directory
cd d:\Expense_&_Finance_Manager

# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ..\client
npm install
```

#### Bash (macOS/Linux):
```bash
cd Expense_&_Finance_Manager

# Install backend
cd server && npm install

# Install frontend
cd ../client && npm install
```

---

### 2. Configure Environment Variables

#### Backend (`server/.env`):
Create `server/.env` based on `server/.env.example`:
```env
PORT=5000
NODE_ENV=development
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/expense_db?schema=public"
JWT_SECRET="super_secret_jwt_key_make_sure_this_is_at_least_32_characters"
JWT_EXPIRES_IN="7d"
FRONTEND_URL="http://localhost:5173"
CRON_SCHEDULE="0 0 * * *"
```

#### Frontend (`client/.env`):
Create `client/.env` based on `client/.env.example`:
```env
# Optional in dev (Vite proxies /api to http://localhost:5000 automatically)
VITE_API_BASE_URL="http://localhost:5000/api"
```

---

### 3. Database Initialization & Seeding

Run the following commands in the `server` directory:

```bash
# 1. Generate Prisma Client
npm run prisma:generate

# 2. Apply database migrations to PostgreSQL
npm run prisma:deploy

# 3. Seed default categories and demo user
npm run prisma:seed
```

> **Demo User Credentials (Pre-seeded):**
> - **Email:** `demo@financeflow.com`
> - **Password:** `Password123!`
> *(You can also use the "⚡ Fill Demo Credentials" button on the login screen).*

---

### 4. Running Locally

#### Start the Backend API (Port 5000):
```bash
cd server
npm start
# Or with auto-reload:
npm run dev
```
*Health check:* http://localhost:5000/api/health

#### Start the Frontend Client (Port 5173):
```bash
cd client
npm run dev
```
*Open in browser:* http://localhost:5173

---

## 🧪 Running Automated Tests

A comprehensive automated test suite with 19 tests is included. It covers:
- Registration, login, bcrypt password hashing, and token verification.
- Route protection and multi-tenant user data isolation.
- Transaction Decimal arithmetic and CSV export formatting.
- Monthly budget spent calculations, remaining balances, and progress tiers.
- Overspending alert generation (75%, 90%, 100%, >100%) and database deduplication.
- Idempotent recurring transaction processing (zero duplicate transactions on replay).
- Cashflow calculations, savings rate analytics, and division-by-zero protection.

Run tests from the `server` directory:
```bash
cd server
npm test
```

---

## 📡 REST API Reference

All protected endpoints require an `Authorization: Bearer <token>` header or a valid `token` cookie.

### Authentication (`/api/auth`)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register new user account (rate-limited) |
| `POST` | `/api/auth/login` | Authenticate with email & password (rate-limited) |
| `POST` | `/api/auth/logout` | Clear session cookie |
| `GET` | `/api/auth/me` | Fetch authenticated user profile |
| `PATCH` | `/api/auth/profile` | Update user name or preferred currency |
| `PATCH` | `/api/auth/change-password` | Update account password |

### Transactions (`/api/transactions`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/transactions` | List transactions (supports pagination, search, category, type, date range, sort) |
| `POST` | `/api/transactions` | Create income or expense transaction |
| `GET` | `/api/transactions/export` | Export filtered transactions as CSV file |
| `GET` | `/api/transactions/:id` | Get single transaction details |
| `PATCH` | `/api/transactions/:id` | Update transaction |
| `DELETE` | `/api/transactions/:id` | Delete transaction |

### Categories (`/api/categories`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/categories` | Get all system default & user custom categories |
| `POST` | `/api/categories` | Create custom category |
| `PATCH` | `/api/categories/:id` | Update custom category |
| `DELETE` | `/api/categories/:id` | Delete custom category (with `?reassignToCategoryId=...` if records exist) |

### Budgets (`/api/budgets`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/budgets?month=10&year=2026` | Get monthly category budgets with actual spent, remaining, and status |
| `POST` | `/api/budgets` | Set or update monthly budget limit for a category |
| `PATCH` | `/api/budgets/:id` | Update budget amount |
| `DELETE` | `/api/budgets/:id` | Remove budget allocation |

### Financial Analytics (`/api/analytics`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/analytics/summary` | Period totals, lifetime net worth, cashflow, savings rate, budget warnings |
| `GET` | `/api/analytics/income-expenses` | Monthly grouped income vs expense dataset for Recharts |
| `GET` | `/api/analytics/expense-breakdown` | Category expense breakdown dataset for donut chart |
| `GET` | `/api/analytics/monthly-trend` | Monthly spending velocity trend dataset |
| `GET` | `/api/analytics/category-comparison`| Cross-category spending comparison dataset |
| `GET` | `/api/analytics/budget-comparison` | Category budget limit vs actual spending dataset |
| `GET` | `/api/analytics/savings-trend` | Monthly net savings trend dataset |

### Recurring Transactions (`/api/recurring`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/recurring` | List all recurring transaction rules & execution history |
| `POST` | `/api/recurring` | Create recurring transaction rule |
| `PATCH` | `/api/recurring/:id` | Update recurring rule |
| `DELETE` | `/api/recurring/:id` | Delete recurring rule |
| `POST` | `/api/recurring/:id/pause` | Pause recurring rule |
| `POST` | `/api/recurring/:id/resume` | Resume recurring rule |
| `POST` | `/api/recurring/process-due` | Idempotent trigger to process due recurring rules immediately |

### Notifications & Alerts (`/api/notifications`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/notifications` | Get in-app alerts and unread count |
| `PATCH` | `/api/notifications/:id/read` | Mark single alert as read |
| `PATCH` | `/api/notifications/read-all` | Mark all alerts as read |

---

## 🚀 Production Deployment Guide

### 1. Database Setup (Render / Supabase / Neon)
1. Provision a PostgreSQL instance on [Render](https://render.com/) or another managed PostgreSQL provider.
2. Note the internal or external database connection string:
   `postgresql://postgres:<password>@<host>:5432/<database>?sslmode=require`

### 2. Backend Deployment on Render
1. Create a new **Web Service** on Render and connect your repository.
2. Configuration:
   - **Root Directory:** `server`
   - **Environment:** `Node`
   - **Build Command:** `npm install && npm run prisma:generate && npm run prisma:deploy`
   - **Start Command:** `npm start`
   - **Health Check Path:** `/api/health`
3. Environment Variables:
   - `NODE_ENV`: `production`
   - `PORT`: `10000`
   - `DATABASE_URL`: *Your managed PostgreSQL connection string*
   - `JWT_SECRET`: *A secure random 64-character string*
   - `JWT_EXPIRES_IN`: `7d`
   - `FRONTEND_URL`: `https://your-financeflow-app.vercel.app`
   - `CRON_SCHEDULE`: `0 0 * * *`
4. Deploy the service. Once running, trigger seed if needed:
   `node prisma/seed.js` in Render Shell.

> **Background Processing on Render:**
> Render's free tier spins down idle instances after 15 minutes of inactivity. When the server goes to sleep, an in-memory `node-cron` schedule will pause until the server wakes up. Because our `processDueRecurringTransactions()` processor is **strictly idempotent and checks `nextExecutionDate <= now`**, whenever the server wakes up or a request is received, all accumulated due transactions are safely processed without any duplicates or omissions. You can also configure a free Render Cron Job or external uptime monitor (e.g., UptimeRobot) to ping `GET /api/health` or `POST /api/recurring/process-due`.

### 3. Frontend Deployment on Vercel
1. Import your repository into [Vercel](https://vercel.com/).
2. Configuration:
   - **Framework Preset:** `Vite`
   - **Root Directory:** `client`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
3. Environment Variables:
   - `VITE_API_BASE_URL`: `https://your-render-backend-url.onrender.com/api`
4. Vercel automatically respects `client/vercel.json` for SPA rewrites so direct navigation and refreshes on `/transactions`, `/budgets`, etc. work flawlessly.

---

## 🛡️ Security Implementation

- **Bcrypt Hashing:** Passwords are never stored in plain text and are salted with 10 rounds of bcrypt.
- **Strict Data Isolation:** Every query enforces user ownership (`userId: req.user.id`). Users can never view, mutate, or export another user's financial records.
- **Decimal Precision:** Financial math avoids IEEE 754 floating-point errors by leveraging Prisma Decimal and PostgreSQL NUMERIC(12, 2).
- **Zod Input Validation:** All query parameters, bodies, and IDs are strictly validated before hitting services.
- **Rate Limiting:** Protects `/api/auth/login` and `/api/auth/register` against brute-force attacks.
- **Security Headers:** Express app includes `helmet` to mitigate clickjacking, MIME sniffing, and cross-site scripting.
- **Sensitive Data Redaction:** Passwords, JWT secrets, and auth tokens are stripped from server logs.

---

## 🔮 Future Improvements

- Multi-currency conversion via real-time exchange rate APIs.
- Receipt attachment uploads with OCR receipt scanning.
- Export to PDF and Excel (.xlsx) reports.
- Bank statement CSV importer with automatic category mapping.
- Optional email notifications for budget threshold crossings via SendGrid/Resend.

---

## 📄 License

MIT License. Free to use, adapt, and build upon.
