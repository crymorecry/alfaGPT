'use client'

import { useState, useEffect, useRef } from 'react'
import { MailIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'

export default function LoginForm({ step, setStep }: { step: 'email' | 'code', setStep: (step: 'email' | 'code') => void }) {
  const t = useTranslations('login')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState<string[]>(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const hasVerifiedRef = useRef(false)

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    try {
      const response = await fetch('/api/auth/send-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || t('error_sending_code'))
        return
      }
      setMessage(t('code_sent'))
      setStep('code' as 'email' | 'code')
    } catch (err) {
      setError(t('error_sending_code'))
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyCode = async (e?: React.FormEvent) => {
    e?.preventDefault()

    if (loading || hasVerifiedRef.current) return

    const codeString = code.join('')
    if (codeString.length !== 6) return

    setLoading(true)
    setError(null)
    hasVerifiedRef.current = true

    try {
      const response = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, code: codeString }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || t('invalid_code'))
        hasVerifiedRef.current = false
        return
      }

      window.location.reload()
    } catch (err) {
      setError(t('error_verifying_code'))
      hasVerifiedRef.current = false
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const codeString = code.join('')
    if (codeString.length === 6 && step === 'code' && !loading && !hasVerifiedRef.current) {
      handleVerifyCode()
    }
  }, [code, step])

  return (

    <>
      {step === 'email' ? (
        <form onSubmit={handleSendCode} className="space-y-4">
          <div>
            <div className="relative">
              <MailIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-2 py-2 h-10 border-2 border-slate-300 dark:border-zinc-700 text-sm bg-white/90 dark:bg-transparent text-gray-900 dark:text-gray-200 outline-none transition-all duration-300 ease-in-out focus:border-[#1161EF] focus:ring-2 focus:ring-[#1161EF] focus:outline-none rounded-2xl"
                placeholder="your@email.com"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 rounded-lg text-red-700 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-[#1161EF] hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors"
          >
            {loading ? t('sending') : t('send_code')}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyCode} className="space-y-4">
          <div>
            <div className="flex gap-2 justify-center">
              {code.map((digit, index) => (
                <input
                  key={index}
                  type="text"
                  inputMode="numeric"
                  value={digit}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 1)
                    const newCode = [...code]
                    newCode[index] = value
                    setCode(newCode)
                    hasVerifiedRef.current = false

                    if (value && index < 5) {
                      const nextInput = document.getElementById(`code-${index + 1}`)
                      nextInput?.focus()
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Backspace' && !code[index] && index > 0) {
                      const prevInput = document.getElementById(`code-${index - 1}`)
                      prevInput?.focus()
                    }
                  }}
                  onPaste={(e) => {
                    e.preventDefault()
                    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
                    const newCode = [...code]
                    pastedData.split('').forEach((char, i) => {
                      if (index + i < 6) {
                        newCode[index + i] = char
                      }
                    })
                    setCode(newCode)
                    hasVerifiedRef.current = false
                    const lastIndex = Math.min(index + pastedData.length - 1, 5)
                    const lastInput = document.getElementById(`code-${lastIndex}`)
                    lastInput?.focus()
                  }}
                  id={`code-${index}`}
                  required
                  maxLength={1}
                  className="w-12 h-12 text-center text-xl font-semibold border border-gray-300 dark:border-zinc-700 bg-white dark:bg-transparent text-gray-900 dark:text-gray-200 outline-none transition-all duration-200 ease-in-out focus:border-[#1161EF] focus:ring-2 focus:ring-[#1161EF] focus:outline-none rounded-lg"
                />
              ))}
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 rounded-lg text-red-700 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          {message && (
            <div className="p-3 bg-green-100 dark:bg-green-900/30 border border-green-400 dark:border-green-700 rounded-lg text-green-700 dark:text-green-400 text-sm">
              {message}
            </div>
          )}

        </form>
      )}
    </>
  )
}

