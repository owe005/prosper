import { supabase } from "@lib/supabase"
import type { Transaction, Budget, Category } from '../types/database.types'


export const financeService = {
  // Transaction methods
  async getTransactions() {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false })
    
    if (error) throw error
    return data as Transaction[]
  },

  async addTransaction(transaction: Omit<Transaction, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('transactions')
      .insert(transaction)
      .select()
      .single()
    
    if (error) throw error
    return data as Transaction
  },

  // Budget methods
  async getBudgets() {
    const { data, error } = await supabase
      .from('budgets')
      .select('*')
    
    if (error) throw error
    return data as Budget[]
  },

  async addBudget(budget: Omit<Budget, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('budgets')
      .insert(budget)
      .select()
      .single()
    
    if (error) throw error
    return data as Budget
  },

  // Category methods
  async getCategories() {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
    
    if (error) throw error
    return data as Category[]
  },

  async addCategory(category: Omit<Category, 'id'>) {
    const { data, error } = await supabase
      .from('categories')
      .insert(category)
      .select()
      .single()
    
    if (error) throw error
    return data as Category
  }
} 