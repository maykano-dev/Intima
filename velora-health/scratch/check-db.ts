import { getAdminSupabase } from './src/lib/supabase';

async function checkProfiles() {
  const supabase = getAdminSupabase();
  if (!supabase) {
    console.error('Supabase admin not configured');
    process.exit(1);
  }

  const { data: profiles, error } = await supabase.from('profiles').select('*');
  if (error) {
    console.error('Error fetching profiles:', error);
  } else {
    console.log('Profiles found:', profiles?.length || 0);
    console.log(JSON.stringify(profiles, null, 2));
  }

  const { data: orders, error: ordersError } = await supabase.from('orders').select('customer_email, user_id');
  if (ordersError) {
    console.error('Error fetching orders:', ordersError);
  } else {
    console.log('Orders found:', orders?.length || 0);
  }
}

checkProfiles();
