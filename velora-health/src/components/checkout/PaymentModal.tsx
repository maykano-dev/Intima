'use client'

import { useState, useEffect, useCallback } from 'react'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { formatPrice, isValidGhanaPhone, cn } from '@/lib/utils'

interface PaymentModalProps {
  open: boolean
  onClose: () => void
  total: number
  orderId: string
  initialPhone?: string
  onSuccess: () => void
}

type PaymentStep = 'phone_input' | 'otp_required' | 'processing' | 'success' | 'failed'

export default function PaymentModal({ open, onClose, total, orderId, initialPhone, onSuccess }: PaymentModalProps) {
  const [step, setStep] = useState<PaymentStep>('phone_input')
  const [phone, setPhone] = useState(initialPhone || '')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [moolreRef, setMoolreRef] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [resendTimer, setResendTimer] = useState(0)

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setStep('phone_input')
      setLoading(false)
      setMessage('')
      setOtp('')
      setError('')
      const savedPhone = localStorage.getItem('last_momo_phone')
      if (savedPhone) setPhone(savedPhone)
      else if (initialPhone) setPhone(initialPhone)
    }
  }, [open, initialPhone])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (resendTimer > 0) {
      interval = setInterval(() => setResendTimer(t => t - 1), 1000)
    }
    return () => clearInterval(interval)
  }, [resendTimer])

  const pollPaymentStatus = useCallback((ref: string) => {
    const startTime = Date.now()
    const timeout = 120000 // 2 minutes
    const parts = ref.split('-')
    const dbOrderId = parts.length >= 2 ? `${parts[0]}-${parts[1]}` : ref

    const interval = setInterval(async () => {
      try {
        const resStatus = await fetch(`/api/moolre-pay/status?order_id=${ref}`)
        if (resStatus.ok) {
          const statusData = await resStatus.json()
          
          if (statusData.status === 'paid') {
            clearInterval(interval)
            setStep('success')
            setTimeout(() => {
              onSuccess()
            }, 1500)
            return
          }

          if (statusData.status === 'failed') {
            clearInterval(interval)
            setStep('failed')
            setError(statusData.message || 'Payment failed.')
            setLoading(false)
            return
          }
          
          if (statusData.message) {
            setMessage(statusData.message)
          }
        }

        // Fallback DB check
        const res = await fetch(`/api/orders?id=${dbOrderId}`)
        if (res.ok) {
          const data = await res.json()
          const order = Array.isArray(data) ? data[0] : data
          if (order?.payment_status === 'paid' || order?.status === 'paid') {
            clearInterval(interval)
            setStep('success')
            setTimeout(() => {
              onSuccess()
            }, 1500)
            return
          }
        }

        if (Date.now() - startTime > timeout) {
          clearInterval(interval)
          setStep('failed')
          setError('Payment verification timed out. If you have paid, please check your dashboard.')
          setLoading(false)
        }
      } catch (err) {
        console.error('Polling error:', err)
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [onSuccess])

  async function handleInitiate() {
    if (!isValidGhanaPhone(phone)) {
      setError('Please enter a valid Ghana phone number.')
      return
    }

    setLoading(true)
    setError('')
    setMessage('Initiating payment...')
    localStorage.setItem('last_momo_phone', phone)

    const currentRef = `${orderId}-${Date.now()}`
    setMoolreRef(currentRef)

    try {
      const res = await fetch('/api/moolre-pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: currentRef,
          phone,
          amount: total,
        }),
      })

      const data = await res.json()

      if (data.status === 'otp_required') {
        setStep('otp_required')
        setMessage(data.message || 'OTP sent to your phone.')
      } else if (data.status === 'pending') {
        setStep('processing')
        setMessage(data.message || 'Check your phone for the payment prompt.')
        pollPaymentStatus(currentRef)
      } else if (data.status === 'success') {
        setStep('success')
        setTimeout(() => onSuccess(), 1500)
      } else {
        setError(data.message || 'Failed to initiate payment.')
      }
    } catch {
      setError('Connection error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleResendCode() {
    if (resendTimer > 0) return
    setResendTimer(30)
    await handleInitiate()
  }

  async function handleVerifyOtp() {
    if (!otp.trim() || !moolreRef) return

    setLoading(true)
    setError('')
    setMessage('Verifying code...')

    try {
      const res = await fetch('/api/moolre-pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: moolreRef,
          phone,
          amount: total,
          otpcode: otp.trim(),
          step: 'verify_otp',
        }),
      })

      const data = await res.json()

      if (data.status === 'pending') {
        setStep('processing')
        setMessage(data.message || 'Check your phone.')
        pollPaymentStatus(moolreRef)
      } else if (data.status === 'otp_required') {
        setError(data.message || 'Invalid code.')
      } else if (data.status === 'success') {
        setStep('success')
        setTimeout(() => onSuccess(), 1500)
      } else {
        setError(data.message || 'Verification failed.')
      }
    } catch {
      setError('Failed to process OTP.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal 
      open={open} 
      onClose={step === 'processing' || loading ? () => {} : onClose}
      closeOnOverlay={!(step === 'processing' || loading)}
      className={cn(
        "transition-all duration-300",
        "sm:max-w-md", // PC size
        "max-sm:fixed max-sm:inset-0 max-sm:max-w-none max-sm:rounded-none max-sm:h-screen" // Mobile size
      )}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm">
              I
            </div>
            <span className="font-bold tracking-tighter text-xl">INTIMA</span>
          </div>
          {!(step === 'processing' || loading) && (
            <button onClick={onClose} className="p-2 hover:bg-secondary rounded-full transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
          {step === 'phone_input' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-2">Mobile Money</h3>
                <p className="text-sm text-muted">Enter your MoMo number to pay {formatPrice(total)}</p>
              </div>

              <div className="space-y-4">
                <Input
                  label="MoMo Number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="024XXXXXXX"
                  autoFocus
                  error={error}
                />
                
                <Button 
                  variant="primary" 
                  size="lg" 
                  fullWidth 
                  onClick={handleInitiate}
                  loading={loading}
                >
                  Request Code
                </Button>
              </div>
            </div>
          )}

          {step === 'otp_required' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4 text-primary">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold mb-2">Enter Verification Code</h3>
                <p className="text-sm text-muted">A code has been sent to {phone}</p>
              </div>

              <div className="space-y-4">
                <Input
                  label="Verification Code"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="6-digit code"
                  autoFocus
                  error={error}
                  inputMode="numeric"
                />
                <Button 
                  variant="primary" 
                  size="lg" 
                  fullWidth 
                  onClick={handleVerifyOtp}
                  loading={loading}
                >
                  Verify & Pay
                </Button>

                <div className="flex flex-col items-center gap-4 pt-2">
                  <button 
                    onClick={handleResendCode}
                    disabled={resendTimer > 0 || loading}
                    className="text-sm font-bold text-primary hover:underline disabled:text-muted disabled:no-underline flex items-center gap-2"
                  >
                    {resendTimer > 0 ? (
                      `Resend code in ${resendTimer}s`
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Resend Code
                      </>
                    )}
                  </button>

                  <button 
                    onClick={() => setStep('phone_input')}
                    className="text-xs text-muted hover:text-foreground transition-colors"
                  >
                    Change Number
                  </button>
                </div>
              </div>
            </div>
          )}

          {step === 'processing' && (
            <div className="text-center space-y-6 py-8 animate-in fade-in zoom-in-95">
              <div className="relative w-24 h-24 mx-auto">
                <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
                <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg className="w-10 h-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold">Check your phone</h3>
                <p className="text-sm text-muted px-8 leading-relaxed">
                  {message || 'A payment prompt has been sent to your phone. Enter your PIN to authorize the transaction.'}
                </p>
              </div>
              <p className="text-xs text-muted italic">Polling for payment status...</p>
            </div>
          )}

          {step === 'success' && (
            <div className="text-center space-y-4 py-8 animate-in fade-in zoom-in-95">
              <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto text-success scale-110 shadow-lg">
                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="space-y-1">
                <h3 className="text-2xl font-bold">Payment Success</h3>
                <p className="text-sm text-muted">Your order has been confirmed.</p>
              </div>
            </div>
          )}

          {step === 'failed' && (
            <div className="text-center space-y-6 py-8 animate-in fade-in zoom-in-95">
              <div className="w-20 h-20 rounded-full bg-danger/10 flex items-center justify-center mx-auto text-danger shadow-lg">
                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold">Payment Failed</h3>
                <p className="text-sm text-danger px-8 leading-relaxed">{error}</p>
              </div>
              <Button variant="outline" onClick={() => setStep('phone_input')}>Try Again</Button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-border/50 text-center space-y-2">
          <p className="text-[10px] uppercase tracking-widest font-bold text-muted/60">Secure Payment Powered by Moolre</p>
          <div className="flex items-center justify-center gap-1 opacity-40 grayscale">
             <div className="h-3 w-8 bg-muted rounded" />
             <div className="h-3 w-8 bg-muted rounded" />
             <div className="h-3 w-8 bg-muted rounded" />
          </div>
        </div>
      </div>
    </Modal>
  )
}
