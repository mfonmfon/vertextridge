# Wallet Address Generation Setup Guide

## Overview
This feature allows admins to generate cryptocurrency wallet addresses for users directly from the admin dashboard.

## Database Setup

### Step 1: Run the SQL Schema
Execute the following SQL file in your Supabase SQL Editor:
```
vertextridge/server/config/wallet_addresses_schema.sql
```

This will create:
- `wallet_addresses` table to store generated addresses
- Indexes for performance
- Row Level Security (RLS) policies
- Triggers for automatic timestamp updates

### Step 2: Verify Table Creation
Run this query to verify the table was created:
```sql
SELECT * FROM wallet_addresses LIMIT 1;
```

## Features

### Supported Cryptocurrencies
- **Bitcoin (BTC)** - Bitcoin network
- **Ethereum (ETH)** - Ethereum network
- **Tether (USDT)** - Ethereum (ERC20), BSC (BEP20), Tron (TRC20)
- **USD Coin (USDC)** - Ethereum (ERC20), BSC (BEP20), Solana
- **Binance Coin (BNB)** - BSC (BEP20)
- **Solana (SOL)** - Solana network

### Admin Capabilities
1. **Generate Wallet Addresses**: Create unique wallet addresses for any user
2. **View Existing Wallets**: See all wallets generated for a user
3. **Copy Addresses**: One-click copy to clipboard
4. **Multiple Networks**: Support for different blockchain networks per currency
5. **Custom Labels**: Add descriptive labels to wallets

## How to Use

### From Admin Dashboard

1. Navigate to **Admin Dashboard** → **User Management**
2. Find the user you want to generate a wallet for
3. Click the **Wallet icon** (💳) in the Actions column
4. In the modal:
   - View existing wallets (if any)
   - Select cryptocurrency (BTC, ETH, USDT, etc.)
   - Select network (automatically filtered based on currency)
   - Add optional label
   - Click **Generate Wallet**
5. The address will be generated and displayed
6. Click **Copy** to copy the address to clipboard

### API Endpoints

#### Generate Wallet Address
```
POST /api/admin/users/:userId/wallet
Body: {
  "currency": "BTC",
  "network": "Bitcoin",
  "label": "Main BTC Wallet"
}
```

#### Get User Wallets
```
GET /api/admin/users/:userId/wallets
```

## Important Notes

### Production Considerations

⚠️ **IMPORTANT**: The current implementation generates deterministic addresses for demonstration purposes. 

For production use, you should:

1. **Integrate with Real Blockchain Services**:
   - Bitcoin: Use libraries like `bitcoinjs-lib` or services like BlockCypher
   - Ethereum: Use `ethers.js` or `web3.js` with proper key management
   - Consider using HD wallets (BIP32/BIP44) for better security

2. **Secure Key Management**:
   - Store private keys in secure hardware (HSM) or key management services
   - Never store private keys in the database
   - Use encryption for sensitive data

3. **Wallet Generation Services**:
   - Consider using services like:
     - Fireblocks
     - BitGo
     - Coinbase Custody
     - AWS KMS for key management

4. **Address Validation**:
   - Implement proper address validation for each blockchain
   - Verify addresses before storing them

5. **Audit Trail**:
   - All wallet generation actions are logged
   - Track which admin generated which wallet

### Security Best Practices

1. **Access Control**: Only authorized admins can generate wallets
2. **Audit Logging**: All wallet generation is logged with admin ID
3. **Unique Constraints**: One wallet per user per currency per network
4. **RLS Policies**: Users can only view their own wallets

## Testing

### Test the Feature

1. Login as admin
2. Go to User Management
3. Click wallet icon for any user
4. Generate a test wallet
5. Verify the address is displayed
6. Copy the address and verify it's in clipboard

### Verify Database

```sql
-- Check generated wallets
SELECT 
  w.*,
  p.email,
  p.name
FROM wallet_addresses w
JOIN profiles p ON w.user_id = p.id
ORDER BY w.created_at DESC;
```

## Troubleshooting

### Table doesn't exist
- Run the SQL schema file in Supabase SQL Editor
- Check for any SQL errors in the Supabase logs

### Wallet generation fails
- Check browser console for errors
- Verify API endpoint is accessible
- Check server logs for backend errors

### Addresses not showing
- Verify RLS policies are set correctly
- Check if service role is being used in backend

## Future Enhancements

Potential improvements for production:
- Real blockchain integration
- QR code generation for addresses
- Address balance checking
- Transaction monitoring
- Multi-signature wallet support
- Webhook notifications for deposits
- Address rotation for privacy
- Integration with payment processors
