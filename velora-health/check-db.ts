import { createClient } from '@supabase/supabase-js';

async function checkProfiles() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  
  console.log('Using URL:', url);
  
  const supabase = createClient(url, key);

  const { data: profiles, error } = await supabase.from('profiles').select('*');
  if (error) {
    console.error('Error fetching profiles:', error);
  } else {
    console.log('Profiles found:', profiles?.length || 0);
    if (profiles && profiles.length > 0) {
      console.log('First 3 profiles:', JSON.stringify(profiles.slice(0, 3), null, 2));
    }
  }

  const { data: orders, error: ordersError } = await supabase.from('orders').select('customer_email, user_id');
  if (ordersError) {
    console.error('Error fetching orders:', ordersError);
  } else {
    console.log('Orders found:', orders?.length || 0);
    const guestOrders = orders?.filter(o => !o.user_id) || [];
    console.log('Guest orders found:', guestOrders.length);
  }
}

checkProfiles();
