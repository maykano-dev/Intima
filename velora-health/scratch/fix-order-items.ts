import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function fixSchema() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabase = createClient(url, key);

  console.log('Adding variant_image column to order_items...');
  
  // We use the SQL editor for this usually, but we can try to use RPC if available
  // Alternatively, we can just inform the user to run the SQL
  const { error } = await supabase.rpc('exec_sql', { 
    sql_query: 'ALTER TABLE order_items ADD COLUMN IF NOT EXISTS variant_image TEXT;' 
  });

  if (error) {
    console.error('Error adding column via RPC:', error.message);
    console.log('Please run this SQL in your Supabase Dashboard:');
    console.log('ALTER TABLE order_items ADD COLUMN IF NOT EXISTS variant_image TEXT;');
  } else {
    console.log('Column added successfully!');
  }
}

fixSchema();
