import { createClient } from '@supabase/supabase-js';

async function checkColumns() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabase = createClient(url, key);

  const { data, error } = await supabase.rpc('get_table_columns', { table_name: 'orders' });
  if (error) {
    // If RPC doesn't exist, try a simple select * limit 1
    const { data: row, error: selectError } = await supabase.from('orders').select('*').limit(1);
    if (selectError) {
      console.error('Error selecting from orders:', selectError);
    } else {
      console.log('Columns in orders:', Object.keys(row[0] || {}));
    }
  } else {
    console.log('Columns in orders (via RPC):', data);
  }
}

checkColumns();
