import { createClient } from '@supabase/supabase-js';

async function listTables() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabase = createClient(url, key);

  const { data, error } = await supabase.rpc('get_tables_in_public');
  if (error) {
    // Try querying information_schema
    const { data: info, error: infoError } = await supabase.from('information_schema.tables').select('table_name').eq('table_schema', 'public');
    if (infoError) {
      console.error('Error fetching tables:', infoError);
    } else {
      console.log('Tables in public schema:', info.map(t => t.table_name));
    }
  } else {
    console.log('Tables:', data);
  }
}

listTables();
