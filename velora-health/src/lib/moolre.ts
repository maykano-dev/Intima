export interface MoolreConfig {
  user: string
  pubKey: string
  accountNumber: string
  secret: string
}

export interface MoolreInitiateResponse {
  status: number
  code: string
  message: string | null
  data: string | Record<string, unknown> | null
  go: string | null
}

export function getMoolreConfig(): MoolreConfig {
  return {
    user: process.env.MOOLRE_USER || '',
    pubKey: process.env.MOOLRE_PUB_KEY || '',
    accountNumber: process.env.MOOLRE_ACCOUNT_NUMBER || '',
    secret: process.env.MOOLRE_SECRET || '',
  }
}

export function isMoolreConfigured(): boolean {
  const config = getMoolreConfig()
  return !!(config.user && config.pubKey && config.accountNumber && config.secret)
}

export function normalizePhone(phone: string): string {
  let cleaned = phone.replace(/[\s\-\(\)]/g, '')
  if (cleaned.startsWith('+233')) cleaned = '0' + cleaned.slice(4)
  else if (cleaned.startsWith('233')) cleaned = '0' + cleaned.slice(3)
  return cleaned
}

export function getChannelFromPhone(phone: string): string {
  const normalized = normalizePhone(phone)
  if (/^(024|025|053|054|055|059)/.test(normalized)) return '13'
  if (/^(020|050)/.test(normalized)) return '6'
  if (/^(026|027|057)/.test(normalized)) return '7'
  return '13'
}

async function moolreRequest(body: Record<string, unknown>, path: string = '/open/transact/payment'): Promise<MoolreInitiateResponse> {
  const config = getMoolreConfig()

  const res = await fetch(`https://api.moolre.com${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-USER': config.user,
      'X-API-PUBKEY': config.pubKey,
      'X-API-KEY': config.secret,
    },
    body: JSON.stringify(body),
  })

  const text = await res.text()
  try {
    return JSON.parse(text)
  } catch {
    console.error('Moolre non-JSON response:', text)
    throw new Error(`Moolre returned non-JSON (${res.status}): ${text.slice(0, 200)}`)
  }
}

export async function initiateMoolrePayment(params: {
  amount: number
  phone: string
  externalRef: string
  channel?: string
  otpCode?: string
  sessionId?: string
  otpcode?: string
  sessionid?: string
}): Promise<MoolreInitiateResponse> {
  const body: Record<string, unknown> = {
    type: 1,
    channel: params.channel || getChannelFromPhone(params.phone),
    currency: 'GHS',
    amount: params.amount,
    payer: normalizePhone(params.phone),
    externalref: params.externalRef,
    accountnumber: getMoolreConfig().accountNumber,
  }

  if (params.otpCode || params.otpcode) {
    body.otpcode = params.otpCode || params.otpcode
  }

  if (params.sessionId || params.sessionid) {
    body.sessionid = params.sessionId || params.sessionid
  }

  return moolreRequest(body)
}

export async function triggerMoolrePayment(params: {
  amount: number
  phone: string
  externalRef: string
  channel?: string
}): Promise<MoolreInitiateResponse> {
  return initiateMoolrePayment(params)
}

export async function checkMoolreStatus(externalRef: string): Promise<MoolreInitiateResponse> {
  return moolreRequest({
    type: 1, // Required by status endpoint
    idtype: 1, // 1 for externalref
    id: externalRef,
    accountnumber: getMoolreConfig().accountNumber
  }, '/open/transact/status')
}

export function verifyMoolreWebhook(body: Record<string, unknown>, secret: string): boolean {
  return body?.secret === secret
}
