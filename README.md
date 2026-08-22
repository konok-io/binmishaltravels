# বিন মিশাল ট্রাভেলস ম্যানেজমেন্ট সিস্টেম

Bin Mishal Travels Management System - A comprehensive multi-branch travel management application.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![React](https://img.shields.io/badge/React-18.3-green)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)
![License](https://img.shields.io/badge/license-MIT-orange)

## 🌟 Features

### Multi-Branch Support
- **19 Branches** across Saudi Arabia and Bangladesh
  - Saudi Arabia: Mecca (2), Riyadh (3), Jeddah (2), Dammam, Khobar, Jubail, Madina (2), Qizan, Tabuk, Khamis Musait, Corporate Office
  - Bangladesh: Dhaka, Chittagong

### Services Offered
- ✈️ **Air Tickets** - Booking, cancellation, refunds
- 📦 **Cargo/Luggage** - 23KG luggage, air cargo
- 🪪 **Iqama Services** - Online, medical, insurance, exit check
- 📋 **Visa Services** - New visit visa, renewal
- 🛂 **Passport Services**
- 🏛️ **Jawazat Services**
- 🕋 **Umrah Services**

### Multi-Language Support
- 🇧🇩 বাংলা (Bengali)
- 🇸🇦 العربية (Arabic) - RTL Support
- 🇺🇸 English

### Role-Based Access
- **Super Admin**: Full access to all branches and reports
- **Branch Manager**: Manage their assigned branch
- **Branch Staff**: Service entry and customer management

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Development server
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

## 🔐 Default Credentials

| Role | Email | Password |
|------|-------|----------|
| Super Admin | admin@binmishal.com | admin123 |

## 🛠️ Tech Stack

- **Frontend**: React 18.3, TypeScript 5.6
- **Styling**: Tailwind CSS 3.4
- **State Management**: Zustand 5.0
- **Routing**: React Router 6.28
- **Build Tool**: Vite 5.4
- **PWA**: Vite PWA Plugin

## 📁 Project Structure

```
src/
├── components/
│   ├── common/          # Reusable components (Button, Card, Input)
│   └── layout/          # Layout components (Sidebar, Header)
├── pages/
│   ├── auth/            # Authentication pages
│   └── branch/         # Branch-specific pages
├── store/               # Zustand stores
│   ├── authStore.ts     # Authentication
│   ├── branchStore.ts   # Branch management
│   ├── customerStore.ts # Customer management
│   ├── transactionStore.ts # Transactions
│   └── serviceStore.ts  # Services
├── types/               # TypeScript interfaces
└── i18n/               # Translations (BN, AR, EN)
```

## 🌐 Deployment

### Option 1: Static Hosting (Frontend Only)

Deploy to any static hosting:
- **Vercel** (Recommended)
- **Netlify**
- **Cloudflare Pages**
- **GitHub Pages**

```bash
npm run build
# Deploy 'dist' folder
```

### Option 2: Full Stack (Frontend + Backend)

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete VPS deployment guide.

**Quick Deploy on Hostinger VPS:**
```bash
# SSH to your VPS
ssh root@your-vps-ip

# Download and run setup script
curl -fsSL https://raw.githubusercontent.com/konok-io/binmishaltravels/main/scripts/deploy.sh | bash
```

**Manual Setup:**
```bash
cd /var/www/binmishaltravels/server
npm run build
npm run seed  # Seed database with initial data
pm2 start dist/index.js --name "binmishal-api"
```

### Environment Variables

Create `.env` file in server directory:
```env
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb://localhost:27017/binmishaltravels
JWT_SECRET=your-super-secret-key
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://yourdomain.com
```

For frontend (`.env.production`):
```env
VITE_API_URL=https://yourdomain.com/api/v1
```

### Default Login Credentials

| Email | Password | Role |
|-------|----------|------|
| admin@binmishaltravels.com | admin123 | Super Admin |
| manager.riyadh@binmishaltravels.com | manager123 | Branch Manager |
| staff.riyadh@binmishaltravels.com | staff123 | Branch Staff |

## 🏗️ Architecture

```
┌─────────────────┐
│   Frontend      │
│   (React+PWA)  │
└────────┬────────┘
         │ HTTP/API
         ▼
┌─────────────────┐
│   Backend       │
│   (Express)     │
└────────┬────────┘
         │ Mongoose
         ▼
┌─────────────────┐
│   MongoDB       │
└─────────────────┘
```

### Frontend Stack
- React 18.3 + TypeScript
- Tailwind CSS 3.4
- Zustand (State Management)
- React Router 6.28
- Recharts (Data Visualization)
- IndexedDB (Offline Storage)

### Backend Stack
- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- PM2 (Process Manager)

## 📄 License

This project is private and proprietary to Bin Mishal Travels.

## 👨‍💼 Company Info

**Bin Mishal Travels**

- Corporate Office: Saffa Tower, 14th Floor, Azizia, Makkah
- Services: Air Tickets, Visa Processing, Iqama Services, Cargo, Umrah Packages

---

*Built with ❤️ for Bin Mishal Travels*
