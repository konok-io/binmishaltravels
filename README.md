# বিন মিশাল ট্রাভেলস ম্যানেজমেন্ট সিস্টেম

Bin Mishal Travels Management System - A comprehensive offline-first multi-branch travel management application.

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

### Offline-First PWA
- Works without internet connection
- Automatic sync when online
- Progressive Web App (installable on mobile)

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

## 🔐 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Super Admin | admin@binmishal.com | demo123 |
| Branch Manager | mecca1@binmishal.com | demo123 |
| Branch Staff | jeddah1@binmishal.com | demo123 |

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

The application can be deployed to any static hosting:

- **Vercel** (Recommended)
- **Netlify**
- **Cloudflare Pages**
- **GitHub Pages**

Simply run `npm run build` and deploy the `dist` folder.

## 📄 License

This project is private and proprietary to Bin Mishal Travels.

## 👨‍💼 Company Info

**Bin Mishal Travels**

- Corporate Office: Saffa Tower, 14th Floor, Azizia, Makkah
- Services: Air Tickets, Visa Processing, Iqama Services, Cargo, Umrah Packages

---

*Built with ❤️ for Bin Mishal Travels*
