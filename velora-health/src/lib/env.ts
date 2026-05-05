function getEnv(name: string): string {
  const val = process.env[name]
  if (!val || val.includes('placeholder') || val.startsWith('placeholder')) {
    return ''
  }
  return val
}

export const env = {
  supabaseUrl: getEnv('NEXT_PUBLIC_SUPABASE_URL'),
  supabaseAnonKey: getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
  supabaseServiceRoleKey: getEnv('SUPABASE_SERVICE_ROLE_KEY'),
  paystackPublicKey: getEnv('NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY'),
  paystackSecretKey: getEnv('PAYSTACK_SECRET_KEY'),
  paystackCallbackUrl: getEnv('NEXT_PUBLIC_PAYSTACK_CALLBACK_URL'),
}
