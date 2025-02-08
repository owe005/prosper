export interface Transaction {
  id: string
  user_id: string
  description: string
  amount: number
  category: string
  type: 'income' | 'expense'
  date: string
  created_at: string
  is_initial_balance?: boolean
}

export interface Budget {
  id: number
  user_id: string
  category: string
  amount: number
  period: 'monthly' | 'yearly'
  created_at: string
}

export interface Category {
  id: number
  name: string
  type: 'income' | 'expense'
  color: string
}

export interface User {
  id: string
  email: string
  created_at: string
  settings: {
    currency: string
    theme: 'light' | 'dark'
  }
} 