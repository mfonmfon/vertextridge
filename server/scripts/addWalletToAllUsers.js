/**
 * Script to add Bitcoin wallet to all existing users
 * Run this once to ensure all users have the fixed Bitcoin address
 */

const { supabaseAdmin } = require('../config/supabase');

const FIXED_BTC_ADDRESS = 'bc1q8mnrq2866x49ec6y0r22t2kfm9044svwzlmy0h';

async function addWalletToAllUsers() {
  console.log('🚀 Starting wallet migration...');
  
  try {
    // 1. Get all users
    const { data: users, error: usersError } = await supabaseAdmin
      .from('profiles')
      .select('id, email, name');
    
    if (usersError) {
      console.error('❌ Error fetching users:', usersError);
      return;
    }
    
    console.log(`📊 Found ${users.length} users`);
    
    // 2. Add wallet to each user
    let successCount = 0;
    let errorCount = 0;
    
    for (const user of users) {
      try {
        const { error: walletError } = await supabaseAdmin
          .from('wallet_addresses')
          .upsert({
            user_id: user.id,
            currency: 'BTC',
            network: 'Bitcoin',
            address: FIXED_BTC_ADDRESS,
            label: 'Bitcoin Wallet',
            is_active: true
          }, {
            onConflict: 'user_id,currency,network'
          });
        
        if (walletError) {
          console.error(`❌ Error for user ${user.email}:`, walletError.message);
          errorCount++;
        } else {
          console.log(`✅ Wallet added for ${user.email}`);
          successCount++;
        }
      } catch (err) {
        console.error(`❌ Exception for user ${user.email}:`, err.message);
        errorCount++;
      }
    }
    
    console.log('\n📈 Migration Summary:');
    console.log(`✅ Success: ${successCount}`);
    console.log(`❌ Errors: ${errorCount}`);
    console.log(`📊 Total: ${users.length}`);
    
    // 3. Verify
    const { data: wallets, error: verifyError } = await supabaseAdmin
      .from('wallet_addresses')
      .select('user_id, address')
      .eq('currency', 'BTC');
    
    if (!verifyError) {
      const uniqueAddresses = new Set(wallets.map(w => w.address));
      console.log(`\n🔍 Verification:`);
      console.log(`Total wallets: ${wallets.length}`);
      console.log(`Unique addresses: ${uniqueAddresses.size}`);
      console.log(`All using fixed address: ${uniqueAddresses.size === 1 && uniqueAddresses.has(FIXED_BTC_ADDRESS) ? '✅ YES' : '❌ NO'}`);
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  }
}

// Run the migration
addWalletToAllUsers()
  .then(() => {
    console.log('\n✅ Migration completed');
    process.exit(0);
  })
  .catch(err => {
    console.error('\n❌ Migration failed:', err);
    process.exit(1);
  });
