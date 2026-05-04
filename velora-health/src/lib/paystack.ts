export function getPaystackPublicKey(): string {
  return process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || ''
}

export function getPaystackSecretKey(): string {
  return process.env.PAYSTACK_SECRET_KEY || ''
}

export function getPaystackCallbackUrl(): string {
  return process.env.NEXT_PUBLIC_PAYSTACK_CALLBACK_URL || 'http://localhost:3000/order-confirmation'
}

import crypto from 'crypto'

export function verifyPaystackWebhookSignature(
  body: string,
  signature: string,
  secret: string
): boolean {
  const hash = crypto
    .createHmac('sha512', secret)
    .update(body)
    .digest('hex')
  return hash === signature
}
