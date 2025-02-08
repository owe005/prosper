import { supabase } from '@/lib/supabase'

export interface Category {
  id: string
  name: string
  user_id: string
  created_at: string
}

export const categoryService = {
  async getCategories(): Promise<Category[]> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name')

    if (error) throw error
    return data || []
  },

  async addCategory(name: string, userId: string): Promise<Category> {
    const { data, error } = await supabase
      .from('categories')
      .insert([{ name, user_id: userId }])
      .select()
      .single()

    if (error) throw error
    return data
  },

  async findOrCreateCategory(name: string, userId: string): Promise<Category> {
    // First try to find existing category
    const { data: existing } = await supabase
      .from('categories')
      .select()
      .eq('name', name)
      .eq('user_id', userId)
      .single()

    if (existing) return existing

    // If not found, create new category
    return this.addCategory(name, userId)
  }
} 