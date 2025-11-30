'use client'

import { useState } from 'react'
import { Dialog, Portal } from '@chakra-ui/react'
import { XIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { toaster } from '@/components/ui/toaster'

interface Business {
  id: string
  name: string
  ip: string | null
  address: string | null
  yandexMapLink: string | null
}

interface BusinessFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  business?: Business | null
  isRequired?: boolean 
}

export default function BusinessFormModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  business,
  isRequired = false 
}: BusinessFormModalProps) {
  const [name, setName] = useState(business?.name || '')
  const [ip, setIp] = useState(business?.ip || '')
  const [address, setAddress] = useState(business?.address || '')
  const [yandexMapLink, setYandexMapLink] = useState(business?.yandexMapLink || '')
  const [loading, setLoading] = useState(false)
  const t = useTranslations('business')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name.trim()) {
      toaster.create({ title: t('error'), description: t('name_required'), type: 'error' })
      return
    }

    setLoading(true)
    try {
      const url = business 
        ? `/api/businesses/${business.id}`
        : '/api/businesses'
      
      const method = business ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          ip: ip.trim() || null,
          address: address.trim() || null,
          yandexMapLink: yandexMapLink.trim() || null,
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || t('error_adding_business'))
      }

      toaster.create({ 
        title: t('success'), 
        description: business ? t('business_updated') : t('business_added'),
        type: 'success' 
      })
      
      setName('')
      setIp('')
      setAddress('')
      setYandexMapLink('')
      onSuccess()
      
      if (!isRequired) {
        onClose()
      }
    } catch (error: any) {
      toaster.create({ 
        title: t('error'), 
        description: error.message || t('error_adding_business'),
        type: 'error' 
      })
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!isRequired) {
      onClose()
    }
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={(e) => !e.open && !isRequired && handleClose()}>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content maxW="xl" className="rounded-3xl p-2">
            <Dialog.Header className="flex items-center justify-between mb-4 gap-2">
              <div className="flex-1 flex items-center">
                <Dialog.Title className="text-xl font-semibold">
                  {business ? t('edit_business') : t('add_business')}
                </Dialog.Title>
              </div>
              {!isRequired && (
                <div className='flex p-2 hover:bg-gray-200 dark:hover:bg-zinc-800 transition-all duration-200 rounded-md items-center justify-center cursor-pointer'>
                  <XIcon className="w-5 h-5" onClick={handleClose} />
                </div>
              )}
            </Dialog.Header>
            <Dialog.Body className="flex flex-col px-4 py-0">
              {isRequired && (
                <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    {t('business_required_message')}
                  </p>
                </div>
              )}
              <form onSubmit={handleSubmit} id="business-form">
                <div className="flex flex-col gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {t('name')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={t('name_placeholder')}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {t('ip')}
                    </label>
                    <input
                      type="text"
                      value={ip}
                      onChange={(e) => setIp(e.target.value)}
                      placeholder={t('ip_placeholder')}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {t('address')}
                    </label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder={t('address_placeholder')}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {t('yandex_map_link')}
                    </label>
                    <input
                      type="url"
                      value={yandexMapLink}
                      onChange={(e) => setYandexMapLink(e.target.value)}
                      placeholder={t('yandex_map_link_placeholder')}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800"
                    />
                  </div>
                </div>
              </form>
            </Dialog.Body>
            <Dialog.Footer className="flex gap-2 mt-4">
              {!isRequired && (
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                >
                  {t('cancel')}
                </button>
              )}
              <button
                type="submit"
                form="business-form"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? t('saving') : (business ? t('update') : t('add'))}
              </button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  )
}

