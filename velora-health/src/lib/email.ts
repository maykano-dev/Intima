import { getAdminSupabase } from './supabase'

export async function sendEmail({ to, subject, html }: { to: string, subject: string, html: string }) {
  const supabase = getAdminSupabase()
  if (!supabase) return { error: 'Supabase admin client not configured' }

  try {
    const { data, error } = await supabase.functions.invoke('send-email', {
      body: { to, subject, html },
    })

    if (error) throw error
    return { data }
  } catch (error: any) {
    console.error('Edge Function Email Error:', error)
    return { error: error.message }
  }
}

export const emailTemplates = {
  confirmation: (name: string, url: string) => `
    <div style="background-color: #0A1410; color: #F2E8DF; font-family: sans-serif; padding: 40px; text-align: center; border-radius: 16px;">
      <h2 style="color: #BFA075; font-size: 24px; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 20px;">Welcome to Intima</h2>
      <p style="font-size: 16px; margin-bottom: 30px; color: #8A7F76;">Hello ${name}, follow the link below to confirm your account and start your wellness journey.</p>
      <a href="${url}" style="background-color: #BFA075; color: #0A1410; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Confirm Account</a>
      <p style="font-size: 12px; margin-top: 40px; color: #5A7263;">If you didn't create an account, you can safely ignore this email.</p>
    </div>
  `,
  notification: (name: string, email: string, subject: string, message: string) => `
    <div style="background-color: #0A1410; color: #F2E8DF; font-family: sans-serif; padding: 30px; border-radius: 16px; border: 1px solid #BFA075;">
      <h3 style="color: #BFA075; border-bottom: 1px solid #BFA075; padding-bottom: 10px;">New Contact Message</h3>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Subject:</strong> ${subject}</p>
      <p><strong>Message:</strong></p>
      <p style="background: rgba(242,232,223,0.05); padding: 15px; border-radius: 8px;">${message}</p>
    </div>
  `,
  welcome: (email: string) => `
    <div style="background-color: #0A1410; color: #F2E8DF; font-family: sans-serif; padding: 40px; text-align: center; border-radius: 16px;">
      <h2 style="color: #BFA075; font-size: 24px; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 20px;">The Inner Circle</h2>
      <p style="font-size: 16px; margin-bottom: 30px; color: #8A7F76;">Welcome to the Intima inner circle. You are now subscribed to receive our private wellness updates and collection drops.</p>
      <p style="font-size: 12px; margin-top: 40px; color: #5A7263;">You can unsubscribe at any time.</p>
    </div>
  `,
  recovery: (url: string) => `
    <div style="background-color: #0A1410; color: #F2E8DF; font-family: sans-serif; padding: 40px; text-align: center; border-radius: 16px;">
      <h2 style="color: #BFA075; font-size: 24px; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 20px;">Password Recovery</h2>
      <p style="font-size: 16px; margin-bottom: 30px; color: #8A7F76;">We received a request to reset your password. Click the button below to choose a new one.</p>
      <a href="${url}" style="background-color: #BFA075; color: #0A1410; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Reset Password</a>
      <p style="font-size: 12px; margin-top: 40px; color: #5A7263;">If you didn't request this, you can safely ignore this email.</p>
    </div>
  `
}

export async function sendContactNotification(name: string, email: string, subject: string, message: string) {
  return sendEmail({
    to: process.env.ADMIN_EMAIL || 'admin@intima.love',
    subject: `New Contact Form: ${subject}`,
    html: emailTemplates.notification(name, email, subject, message)
  })
}

export async function sendContactConfirmation(name: string, email: string) {
  return sendEmail({
    to: email,
    subject: 'We received your message - Intima Wellness',
    html: `
      <div style="background-color: #0A1410; color: #F2E8DF; font-family: sans-serif; padding: 40px; text-align: center; border-radius: 16px;">
        <h2 style="color: #BFA075; font-size: 20px;">Hello ${name},</h2>
        <p style="color: #8A7F76;">We've received your message and our team will get back to you shortly. Thank you for reaching out.</p>
      </div>
    `
  })
}

export async function sendSubscribeWelcome(email: string) {
  return sendEmail({
    to: email,
    subject: 'Welcome to the Intima Circle',
    html: emailTemplates.welcome(email)
  })
}
