import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { to, subject, html } = await req.json()
    
    const apiKey = Deno.env.get('AHASEND_SECRET_KEY')
    const accountId = Deno.env.get('AHASEND_ACCOUNT_ID') || '55279744-a1b6-4920-91c5-8b2034111c59'
    const fromEmail = Deno.env.get('AHASEND_SMTP_FROM') || 'noreply@info.intima.love'

    if (!apiKey) {
      throw new Error('AHASEND_SECRET_KEY not set in Supabase Secrets')
    }

    const url = `https://api.ahasend.com/v2/accounts/${accountId}/messages`

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: {
          email: fromEmail,
          name: "Intima Wellness"
        },
        recipients: [
          {
            email: to
          }
        ],
        subject,
        html_content: html
      }),
    })

    const result = await response.json()

    if (!response.ok) {
      console.error('AhaSend API Error:', result)
      throw new Error(result.message || 'Failed to send email via AhaSend API')
    }

    return new Response(
      JSON.stringify({ message: 'Email sent successfully', data: result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    console.error('Edge Function Error:', error.message)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
