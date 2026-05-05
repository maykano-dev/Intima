import { Resend } from 'resend'

const resendApiKey = process.env.RESEND_API_KEY
const resend = resendApiKey ? new Resend(resendApiKey) : null
const fromEmail = 'Intima <notifications@intima.com>'
const adminEmail = 'support@intima.com'

export async function sendContactNotification(name: string, email: string, subject: string, message: string) {
  if (!resend) return
  try {
    await resend.emails.send({
      from: fromEmail,
      to: adminEmail,
      subject: `[Intima Contact] ${subject}`,
      text: `From: ${name} (${email})\n\nSubject: ${subject}\n\nMessage:\n${message}`,
    })
  } catch (error) {
    console.error('Failed to send contact email:', error)
  }
}

export async function sendContactConfirmation(name: string, email: string) {
  if (!resend) return
  try {
    await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: 'We received your message — Intima',
      text: `Hi ${name},\n\nThank you for reaching out to Intima. We've received your message and will get back to you within 24 hours.\n\nIf you need immediate assistance, please email us at support@intima.com.\n\nBest regards,\nThe Intima Team`,
    })
  } catch (error) {
    console.error('Failed to send contact confirmation:', error)
  }
}

export async function sendSubscribeWelcome(email: string) {
  if (!resend) return
  try {
    await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: 'Welcome to the Intima newsletter',
      text: `Hi there,\n\nThank you for subscribing to the Intima newsletter. You'll now receive exclusive offers, sexual health education, and new arrival updates.\n\nWe respect your privacy — we'll never share your email.\n\nBest regards,\nThe Intima Team`,
    })
  } catch (error) {
    console.error('Failed to send welcome email:', error)
  }
}

export async function sendOrderConfirmation(email: string, orderId: string) {
  if (!resend) return
  try {
    await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: `Order ${orderId} Confirmed — Intima`,
      text: `Thank you for your order!\n\nYour order ID is: ${orderId}\n\nYou can track your order at: https://intima.com/track\n\nWe'll send you updates as your order progresses.\n\nIf you have any questions, email us at support@intima.com.\n\nBest regards,\nThe Intima Team`,
    })
  } catch (error) {
    console.error('Failed to send order confirmation:', error)
  }
}
