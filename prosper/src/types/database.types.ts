export interface Transaction {
  id: number
  user_id: string
  amount: number
  description: string
  category: string
  type: 'income' | 'expense'
  date: string
  created_at: string
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