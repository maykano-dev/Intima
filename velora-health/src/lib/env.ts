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
  moolreUser: getEnv('MOOLRE_USER'),
  moolrePubKey: getEnv('MOOLRE_PUB_KEY'),
  moolreAccountNumber: getEnv('MOOLRE_ACCOUNT_NUMBER'),
  moolreSecret: getEnv('MOOLRE_SECRET'),
}
