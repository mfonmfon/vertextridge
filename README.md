# 🚀 TradZ - Production-Grade Broker Platform

A modern, full-stack cryptocurrency trading platform built with React, Node.js, Express, and Supabase.

## ✨ Features

### 🔐 Authentication & Security
- Email/Password authentication with Supabase Auth
- Google OAuth integration
- JWT-based session management
- Row Level Security (RLS) policies
- Rate limiting and DDoS protection
- Audit logging for all critical operations
- Password strength validation

### 💰 Financial Operations
- Secure deposits and withdrawals
- Peer-to-peer transfers
- Transaction history with pagination
- Atomic balance updates (prevents race conditions)
- Multi-method support (bank, card, crypto, wallet)

### 📈 Trading Engine
- Real-time cryptocurrency trading
- Buy/Sell operations with fee calculation
- Portfolio holdings management
- Trade history tracking
- Average cost calculation
- Insufficient balance/holdings validation

### 📊 Market Features
- Asset watchlist
- Real-time price tracking (via CoinGecko)
- Market data caching
- Portfolio performance metrics

### 👤 User Management
- KYC status tracking
- User profiles with customization
- Onboarding flow
- Investment preferences

## 🏗️ Architecture

### Backend Stack
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: Supabase Auth
- **Validation**: express-validator
- **Security**: Helmet, CORS, Rate Limiting
- **Logging**: Custom logger (production-ready)

### Frontend Stack
- **Framework**: React 19
- **Build Tool**: Vite
- **Styling**: Tailwind CSS 4
- **Routing**: React Router v7
- **State Management**: Context API
- **UI Components**: Framer Motion, Lucide Icons
- **Charts**: Recharts
- **Notifications**: React Hot Toast

### Database Schema
- **profiles**: User accounts and balances
- **transactions**: Financial transaction records
- **trades**: Trading history
- **holdings**: Current portfolio positions
- **watchlist**: Saved assets
- **audit_logs**: Security and compliance logging

## 📦 Installation

### Prerequisites
- Node.js 18 or higher
- npm or yarn
- Supabase account
- Google Cloud Console account (for OAuth)

### Quick Start

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd tradz
```

2. **Install dependencies**
```bash
# Frontend
npm install

# Backend
cd server
npm install
cd ..
```

3. **Set up Supabase**
- Create a new project at [supabase.com](https://supabase.com)
- Run the SQL schema from `server/config/database.sql` in the SQL Editor
- Copy your project credentials

4. **Configure environment variables**

Create `server/.env`:
```env
PORT=5000
NODE_ENV=development

SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

GOOGLE_CLIENT_ID=your-google-client-id

JWT_SECRET=your-secret-key
CORS_ORIGIN=http://localhost:5173
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
LOG_LEVEL=info
```

Create `.env`:
```env
VITE_GOOGLE_CLIENT_ID=your-google-client-id
VITE_API_URL=http://localhost:5000/api
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

5. **Start development servers**

Terminal 1 (Backend):
```bash
cd server
npm run dev
```

Terminal 2 (Frontend):
```bash
npm run dev
```

6. **Open your browser**
```
http://localhost:5173
```

## 🔧 Configuration

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create OAuth 2.0 credentials
3. Add authorized origins: `http://localhost:5173`
4. Copy Client ID to both `.env` files

### Supabase Setup

1. Run `server/config/database.sql` in Supabase SQL Editor
2. Verify all tables are created
3. Check RLS policies are enabled
4. Test database connection via `/api/health` endpoint

## 🧪 Testing

### Health Check
```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "status": "ok",
  "database": "connected",
  "timestamp": "2024-...",
  "uptime": 123.45,
  "environment": "development"
}
```

### API Endpoints

#### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/google` - Google OAuth login
- `POST /api/auth/logout` - Logout

#### Finance
- `POST /api/finance/deposit` - Deposit funds
- `POST /api/finance/withdraw` - Withdraw funds
- `POST /api/finance/transfer` - Transfer to another user
- `GET /api/finance/transactions` - Get transaction history

#### Trading
- `POST /api/trade/execute` - Execute buy/sell trade
- `GET /api/trade/history` - Get trade history
- `GET /api/trade/holdings` - Get current holdings

#### Market
- `POST /api/market/watchlist` - Toggle watchlist
- `GET /api/market/watchlist` - Get watchlist

#### User
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update profile

## 🚀 Production Deployment

See [PRODUCTION_SETUP.md](./PRODUCTION_SETUP.md) for detailed deployment instructions.

### Quick Deployment Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Use strong secrets and keys
- [ ] Enable HTTPS/SSL
- [ ] Configure production CORS origins
- [ ] Set up error monitoring (Sentry)
- [ ] Configure logging service
- [ ] Enable database backups
- [ ] Test all authentication flows
- [ ] Verify rate limiting
- [ ] Review RLS policies

## 📊 Database Schema

### Key Tables

**profiles**
- User account information
- Balance tracking
- KYC status
- Investment preferences

**transactions**
- Deposits, withdrawals, transfers
- Status tracking
- Method and metadata

**trades**
- Buy/sell operations
- Asset details
- Fees and totals

**holdings**
- Current portfolio positions
- Average buy price
- Quantity tracking

**audit_logs**
- Security event logging
- User action tracking
- IP and user agent capture

## 🔒 Security Features

- **Row Level Security (RLS)**: Database-level access control
- **JWT Authentication**: Secure token-based auth
- **Rate Limiting**: Prevent abuse and DDoS
- **Input Validation**: Server-side validation on all endpoints
- **Audit Logging**: Track all critical operations
- **CORS Protection**: Whitelist allowed origins
- **Helmet.js**: Security headers
- **Password Hashing**: Supabase Auth handles securely
- **SQL Injection Prevention**: Parameterized queries
- **XSS Protection**: Content Security Policy

## 🐛 Troubleshooting

### Common Issues

**Database connection failed**
- Verify Supabase credentials in `.env`
- Check if service role key is correct
- Ensure database schema is created

**Authentication not working**
- Clear browser localStorage
- Check JWT token format
- Verify CORS configuration

**Google OAuth fails**
- Verify Client ID matches
- Check authorized origins
- Test in incognito mode

## 📚 Documentation

- [Production Setup Guide](./PRODUCTION_SETUP.md)
- [Database Schema](./server/config/database.sql)
- [API Documentation](#api-endpoints)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

Proprietary - All rights reserved

## 🆘 Support

For issues or questions:
1. Check the troubleshooting section
2. Review server logs
3. Check Supabase dashboard
4. Verify environment variables

---

Built with ❤️ using React, Node.js, and Supabase
