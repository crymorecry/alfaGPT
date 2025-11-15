export interface Transaction {
  id: string
  date: string
  category: string
  type: string
  amount: number
  description: string
}

export interface Payment {
  id: string
  date: string
  contractor: string
  description: string
  amount: number
  status: string
}

