import { NextResponse } from 'next/server'
import { initiateMoolrePayment, triggerMoolrePayment, isMoolreConfigured, normalizePhone, getChannelFromPhone } from '@/lib/moolre'

export async function POST(request: Request) {
  try {
    let body: Record<string, unknown>
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { error: 'Invalid or empty JSON body' },
        { status: 400 }
      )
    }

    const order_id = body.order_id as string | undefined
    const phone = body.phone as string | undefined
    const amount = body.amount as number | undefined
    const otpCode = body.otpcode as string | undefined
    const step = (body.step as string) || 'initiate'

    if (!order_id || !phone || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields: order_id, phone, amount' },
        { status: 400 }
      )
    }

    if (!isMoolreConfigured()) {
      return NextResponse.json(
        { error: 'Payment gateway not configured' },
        { status: 500 }
      )
    }

    console.log('Moolre request:', { step, amount, phone: normalizePhone(phone), channel: getChannelFromPhone(phone || ''), externalRef: order_id, hasOtp: !!otpCode })

    if (step === 'verify_otp' && otpCode) {
      const verifyResult = await initiateMoolrePayment({
        amount,
        phone,
        externalRef: order_id,
        otpCode,
      })

      console.log('Moolre OTP verify response:', JSON.stringify(verifyResult))

      // Check if it's an invalid code error (status 0 or specific message)
      const isInvalidOtp = 
        verifyResult.code === 'TP14' || 
        verifyResult.status === 0 || 
        (verifyResult.message && verifyResult.message.toLowerCase().includes('verification code'))

      if (isInvalidOtp && verifyResult.status !== 1) {
        let msg = verifyResult.message || 'Invalid code. Please try again.'
        if (msg.toLowerCase().includes('verification code')) {
          msg = 'Invalid code. Please double check the code sent to your phone and try again.'
        }

        return NextResponse.json({
          status: 'otp_required',
          message: msg,
        })
      }

      if (verifyResult.status === 1) {
        const triggerResult = await triggerMoolrePayment({
          amount,
          phone,
          externalRef: order_id,
        })

        console.log('Moolre trigger response:', JSON.stringify(triggerResult))

        if (triggerResult.code === 'TR099') {
          return NextResponse.json({
            status: 'pending',
            message: 'Payment prompt sent to your phone. Enter your PIN to complete.',
          })
        }

        if (triggerResult.status === 1) {
          return NextResponse.json({
            status: 'pending',
            message: 'Check your phone and enter your PIN to complete payment.',
          })
        }

        return NextResponse.json({
          status: 'failed',
          code: triggerResult.code,
          message: triggerResult.message || 'Failed to trigger payment prompt.',
        })
      }

      return NextResponse.json({
        status: 'failed',
        code: verifyResult.code,
        message: verifyResult.message || 'OTP verification failed.',
      })
    }

    const result = await initiateMoolrePayment({
      amount,
      phone,
      externalRef: order_id,
    })

    console.log('Moolre initiate response:', JSON.stringify(result))

    if (result.code === 'TP14') {
      return NextResponse.json({
        status: 'otp_required',
        message: result.message || 'OTP sent to your phone.',
      })
    }

    if (result.code === 'TR099') {
      return NextResponse.json({
        status: 'pending',
        message: 'Check your phone and enter your PIN to complete payment.',
      })
    }

    if (result.status === 1) {
      return NextResponse.json({
        status: 'success',
        message: 'Payment successful',
      })
    }

    return NextResponse.json({
      status: 'failed',
      code: result.code,
      message: result.message || 'Payment failed.',
    })
  } catch (error) {
    console.error('Moolre payment error:', error)
    return NextResponse.json(
      { error: 'Failed to process payment' },
      { status: 500 }
    )
  }
}
