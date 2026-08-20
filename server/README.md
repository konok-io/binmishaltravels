# Bin Mishal Travels - Backend API

Node.js/Express backend API with MongoDB for Bin Mishal Travels application.

## Features

- 🔐 JWT Authentication with role-based access control
- 🏢 Multi-branch support
- 📊 Complete CRUD operations for all entities
- 🔒 Security middleware (Helmet, Rate Limiting, CORS)
- 📝 Request logging with Morgan
- 🔄 MongoDB with Mongoose ODM

## Prerequisites

- Node.js 18+
- MongoDB 6+
- npm or yarn

## Quick Start

### 1. Install Dependencies

```bash
cd server
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your settings:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/binmishaltravels
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173
```

### 3. Seed Database

```bash
npm run seed
```

This creates:
- 3 Branches (Head Office, Jeddah, Dhaka)
- 3 Users (Admin, Manager, Staff)
- 8 Services (Air Ticket, Cargo, Visa, etc.)

### 4. Start Development Server

```bash
npm run dev
```

Server runs on `http://localhost:5000`

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | Register new user |
| POST | `/api/v1/auth/login` | Login user |
| GET | `/api/v1/auth/profile` | Get current user |
| POST | `/api/v1/auth/change-password` | Change password |

### Branches
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/branches` | List all branches |
| GET | `/api/v1/branches/:id` | Get branch by ID |
| POST | `/api/v1/branches` | Create branch |
| PUT | `/api/v1/branches/:id` | Update branch |
| DELETE | `/api/v1/branches/:id` | Delete branch |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/users` | List all users |
| GET | `/api/v1/users/:id` | Get user by ID |
| POST | `/api/v1/users` | Create user |
| PUT | `/api/v1/users/:id` | Update user |
| DELETE | `/api/v1/users/:id` | Delete user |
| PATCH | `/api/v1/users/:id/toggle-status` | Toggle user active status |

### Services
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/services` | List all services |
| GET | `/api/v1/services/category/:category` | Get by category |
| GET | `/api/v1/services/:id` | Get service by ID |
| POST | `/api/v1/services` | Create service |
| PUT | `/api/v1/services/:id` | Update service |
| DELETE | `/api/v1/services/:id` | Delete service |

### Customers
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/customers` | List all customers |
| GET | `/api/v1/customers/search?q=` | Search customers |
| GET | `/api/v1/customers/:id` | Get customer by ID |
| POST | `/api/v1/customers` | Create customer |
| PUT | `/api/v1/customers/:id` | Update customer |
| DELETE | `/api/v1/customers/:id` | Delete customer |

### Transactions
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/transactions` | List all transactions |
| GET | `/api/v1/transactions/stats` | Get transaction statistics |
| GET | `/api/v1/transactions/:id` | Get transaction by ID |
| POST | `/api/v1/transactions` | Create transaction |
| PUT | `/api/v1/transactions/:id` | Update transaction |
| DELETE | `/api/v1/transactions/:id` | Delete transaction |

### Health Check
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/health` | API health status |

## Authentication

All protected routes require JWT token in Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## User Roles

| Role | Permissions |
|------|-------------|
| `super_admin` | Full access to all resources |
| `branch_manager` | Manage branch staff, transactions |
| `branch_staff` | Create/view transactions, customers |

## Default Login Credentials

After running seed:

| Email | Password | Role |
|-------|----------|------|
| admin@binmishaltravels.com | admin123 | Super Admin |
| manager.riyadh@binmishaltravels.com | manager123 | Branch Manager |
| staff.riyadh@binmishaltravels.com | staff123 | Branch Staff |

## Scripts

```bash
npm run dev      # Start development server with hot reload
npm run build    # Build for production
npm run start    # Start production server
npm run seed     # Seed database with sample data
```

## Project Structure

```
server/
├── src/
│   ├── config/         # Configuration files
│   ├── controllers/    # Route controllers
│   ├── middleware/     # Express middleware
│   ├── models/         # Mongoose models
│   ├── routes/        # API routes
│   ├── index.ts       # Entry point
│   └── seed.ts        # Database seeder
├── .env.example       # Environment template
├── package.json
└── tsconfig.json
```

## License

MIT
