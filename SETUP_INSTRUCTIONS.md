# Setup Instructions

## Environment Variables Setup

### 1. Frontend (.env)
Copy the values from `.env.example` and fill in your credentials:

```bash
# Frontend Environment Variables
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
VITE_API_BASE_URL=http://localhost:3001/api
VITE_COINGECKO_API_KEY=your_coingecko_api_key_here  # Optional - for higher rate limits
VITE_ENVIRONMENT=development
```

### 2. Backend (server/.env)
Copy the values from `server/.env.example` and fill in your credentials:

```bash
# Server Environment Variables
PORT=3001
NODE_ENV=development

# Supabase Configuration
SUPABASE_URL=your_supabase_url_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# Database
DATABASE_URL=your_database_url_here

# JWT
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=7d

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# Email Service
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email_here
SMTP_PASS=your_email_password_here

# External APIs
COINGECKO_API_KEY=your_coingecko_api_key_here  # Optional - for higher rate limits
BINANCE_API_KEY=your_binance_api_key_here      # Optional - for trading features
BINANCE_SECRET_KEY=your_binance_secret_key_here

# Redis (for caching)
REDIS_URL=redis://localhost:6379

# Encryption
ENCRYPTION_KEY=your_32_character_encryption_key_here
```

## Running the Application

### 1. Start the Backend Server
```bash
cd vertextridge/server
npm install
npm run dev
```
The server will run on http://localhost:3001

### 2. Start the Frontend (in a new terminal)
```bash
cd vertextridge
npm install
npm run dev
```
The frontend will run on http://localhost:5173

## Features Implemented

### ✅ Copy Trading
- **Master Traders List**: Browse and filter professional traders
- **Trader Profiles**: Detailed performance metrics and statistics
- **Copy Management**: Start/stop copying with custom allocation
- **Performance Tracking**: Real-time P&L tracking for copied trades
- **Risk Assessment**: Risk scoring and categorization

### ✅ Market Data & Search
- **Real-time Prices**: Live cryptocurrency prices from CoinGecko
- **Asset Search**: Search for Bitcoin, Ethereum, and any crypto by name/symbol
- **Market Trends**: Trending cryptocurrencies with sparkline charts
- **Price Charts**: Historical price data and charts
- **Watchlist**: Save favorite cryptocurrencies

### ✅ Dashboard Enhancements
- **Asset Search Bar**: Quick search for any cryptocurrency
- **Market Movers**: Display trending assets with live prices
- **Portfolio Overview**: Real-time portfolio value and P&L
- **Copy Trading Stats**: Integration with copy trading performance

## API Endpoints

### Copy Trading
- `GET /api/copy-trading/masters` - Get master traders
- `GET /api/copy-trading/masters/:id` - Get trader details
- `POST /api/copy-trading/start` - Start copying a trader
- `POST /api/copy-trading/stop/:id` - Stop copying
- `GET /api/copy-trading/my-copies` - Get user's copy relationships

### Market Data
- `GET /api/market/trending` - Get trending cryptocurrencies
- `GET /api/market/prices?ids=bitcoin,ethereum` - Get specific coin prices
- `GET /api/market/search?q=bitcoin` - Search cryptocurrencies
- `GET /api/market/chart/:id?days=7` - Get price chart data
- `GET /api/market/coin/:id` - Get detailed coin information

## Next Steps

1. **Fill in Environment Variables**: Add your Supabase, CoinGecko, and other API credentials
2. **Database Setup**: Run the SQL schema files in `server/config/` to set up your database
3. **Test the Features**: 
   - Search for Bitcoin in the dashboard
   - Browse copy trading masters
   - Check market data in the Markets page
4. **Customize**: Modify the mock data in services to match your needs

## Notes

- The app includes fallback mock data for development when APIs are not configured
- CoinGecko API key is optional but recommended for higher rate limits
- Copy trading features require proper database setup with the provided schemas
- All market data is cached on the backend for better performance