'use client'

import { useState } from 'react'
import { ChevronDown, Plus, Edit } from 'lucide-react'
import { Menu } from '@chakra-ui/react'
import { useTranslations } from 'next-intl'
import BusinessFormModal from './BusinessFormModal'
import { useBusiness } from './BusinessProvider'

interface BusinessSelectorProps {
  currentBusinessId: string | null
  onBusinessChange: (businessId: string) => void
}

export default function BusinessSelector({ currentBusinessId, onBusinessChange }: BusinessSelectorProps) {
  const { businesses, loading, refreshBusinesses, currentBusiness: contextCurrentBusiness } = useBusiness()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingBusiness, setEditingBusiness] = useState<typeof contextCurrentBusiness>(null)
  const t = useTranslations('business')

  const currentBusiness = businesses.find(b => b.id === currentBusinessId) || contextCurrentBusiness

  const handleAddBusiness = () => {
    setEditingBusiness(null)
    setIsModalOpen(true)
  }

  const handleEditBusiness = (business: typeof contextCurrentBusiness) => {
    setEditingBusiness(business)
    setIsModalOpen(true)
  }

  const handleModalSuccess = async () => {
    await refreshBusinesses()
    setIsModalOpen(false)
    setEditingBusiness(null)
  }

  if (loading) {
    return (
      <div className="px-3 py-1.5 bg-white dark:bg-zinc-800 rounded-lg border border-gray-200 dark:border-zinc-700">
        <span className="text-sm text-gray-500">{t('loading')}</span>
      </div>
    )
  }

  return (
    <>
      <Menu.Root>
        <Menu.Trigger asChild>
          <button className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-zinc-800 rounded-lg border border-gray-200 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors">
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {currentBusiness ? currentBusiness.name : t('no_business_selected')}
            </span>
            <ChevronDown className="w-4 h-4 text-gray-500" />
          </button>
        </Menu.Trigger>
        <Menu.Positioner>
          <Menu.Content className="min-w-[200px]">
            {businesses.length > 0 && (
              <Menu.RadioItemGroup value={currentBusinessId || ''}>
                {businesses.map((business) => (
                  <Menu.RadioItem
                    key={business.id}
                    value={business.id}
                    onClick={() => onBusinessChange(business.id)}
                  >
                    <Menu.ItemIndicator />
                    <span>{business.name}</span>
                  </Menu.RadioItem>
                ))}
              </Menu.RadioItemGroup>
            )}
            {businesses.length > 0 && <Menu.Separator />}
            <Menu.ItemGroup>
              <Menu.Item
                value="add"
                onClick={handleAddBusiness}
                className="flex items-center gap-2 text-blue-600 dark:text-blue-400"
              >
                <Plus className="w-4 h-4" />
                <span>{t('add_business')}</span>
              </Menu.Item>
              {businesses.length > 0 && currentBusiness && (
                <Menu.Item
                  value="edit"
                  onClick={() => handleEditBusiness(currentBusiness)}
                  className="flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  <span>{t('edit_current')}</span>
                </Menu.Item>
              )}
            </Menu.ItemGroup>
          </Menu.Content>
        </Menu.Positioner>
      </Menu.Root>

      <BusinessFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingBusiness(null)
        }}
        onSuccess={handleModalSuccess}
        business={editingBusiness}
      />
    </>
  )
}

