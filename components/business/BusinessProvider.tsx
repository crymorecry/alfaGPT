'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useAuth } from '@/components/auth/AuthProvider'
import BusinessFormModal from './BusinessFormModal'

interface Business {
  id: string
  name: string
  ip: string | null
  address: string | null
  yandexMapLink: string | null
}

interface BusinessContextType {
  currentBusiness: Business | null
  businesses: Business[]
  loading: boolean
  setCurrentBusiness: (businessId: string) => void
  refreshBusinesses: () => Promise<void>
}

const BusinessContext = createContext<BusinessContextType | undefined>(undefined)

export function BusinessProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth()
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [currentBusinessId, setCurrentBusinessId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [showRequiredModal, setShowRequiredModal] = useState(false)

  const fetchBusinesses = async () => {
    if (!user) {
      setLoading(false)
      return
    }
    try {
      const response = await fetch('/api/businesses')
      if (response.ok) {
        const data = await response.json()
        setBusinesses(data)
        
        if (data.length === 0) {
          setShowRequiredModal(true)
          setCurrentBusinessId(null)
        } else {
          setShowRequiredModal(false)
          if (!currentBusinessId) {
            setCurrentBusinessId(data[0].id)
          } else {
            const exists = data.find((b: Business) => b.id === currentBusinessId)
            if (!exists) {
              setCurrentBusinessId(data[0].id)
            }
          }
        }
      }
    } catch (error) {
      console.error('Error fetching businesses:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!authLoading && user) {
      fetchBusinesses()
    }
  }, [user, authLoading])

  const setCurrentBusiness = (businessId: string) => {
    setCurrentBusinessId(businessId)
    localStorage.setItem('currentBusinessId', businessId)
  }

  useEffect(() => {
    const savedBusinessId = localStorage.getItem('currentBusinessId')
    if (savedBusinessId && businesses.length > 0) {
      const exists = businesses.find(b => b.id === savedBusinessId)
      if (exists) {
        setCurrentBusinessId(savedBusinessId)
      }
    }
  }, [businesses])

  const currentBusiness = businesses.find(b => b.id === currentBusinessId) || null

  const handleModalSuccess = async () => {
    await fetchBusinesses()
  }

  return (
    <BusinessContext.Provider
      value={{
        currentBusiness,
        businesses,
        loading,
        setCurrentBusiness,
        refreshBusinesses: fetchBusinesses,
      }}
    >
      {children}
      <BusinessFormModal
        isOpen={showRequiredModal}
        onClose={() => {}}
        onSuccess={handleModalSuccess}
        isRequired={true}
      />
    </BusinessContext.Provider>
  )
}

export function useBusiness() {
  const context = useContext(BusinessContext)
  if (context === undefined) {
    throw new Error('useBusiness must be used within a BusinessProvider')
  }
  return context
}

