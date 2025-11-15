'use client'
import LoginForm from '@/components/auth/LoginForm'
import Logo from '@/components/ui/logo'
import React, { useState } from 'react'
import { useTranslations } from 'next-intl'

export default function LoginPage() {
  const t = useTranslations('login')
  const [step, setStep] = useState<'email' | 'code'>('email')
  return (
    <div className="flex flex-col gap-y-12">
      <div className="flex flex-col items-center gap-6 text-center">
        <div className='w-40'>
          <Logo />
        </div>
        <span className='text-3xl font-semibold text-gray-900 dark:text-white'>{t('title')}</span>
        <span className='text-sm text-gray-500 dark:text-gray-400'>
          {step == "email" ?
            t('description_email')
            : t('description_code')
          }
        </span>

      </div>
      <LoginForm step={step} setStep={() => setStep(step === 'email' ? 'code' : 'email')} />
    </div>
  )
}

