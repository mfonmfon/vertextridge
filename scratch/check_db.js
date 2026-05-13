const { createClient } = require('@supabase/supabase-client');
require('dotenv').config({ path: './server/.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTable() {
  console.log('Checking master_traders table...');
  const { data, error, count } = await supabase
    .from('master_traders')
    .select('*', { count: 'exact' });

  if (error) {
    console.error('Error fetching master_traders:', error);
    if (error.code === '42P01') {
      console.log('Table "master_traders" DOES NOT EXIST.');
    }
  } else {
    console.log('Success! Found', count, 'traders.');
    console.log('Columns:', Object.keys(data[0] || {}));
  }
}

checkTable();
