import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Initialize auth state
  async function init() {
    const { data: { session } } = await supabase.auth.getSession()
    user.value = session?.user ?? null

    // Listen for auth changes
    supabase.auth.onAuthStateChange((_event, session) => {
      user.value = session?.user ?? null
    })
  }

  // Sign in with email and password
  async function signIn(email: string, password: string) {
    try {
      loading.value = true
      error.value = null
      
      const { data, error: err } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (err) throw err
      user.value = data.user
      
    } catch (err) {
      error.value = (err as Error).message
    } finally {
      loading.value = false
    }
  }

  // Sign up with email and password
  async function signUp(email: string, password: string) {
    try {
      loading.value = true
      error.value = null
      
      const { data, error: err } = await supabase.auth.signUp({
        email,
        password,
      })

      if (err) throw err
      user.value = data.user
      
    } catch (err) {
      error.value = (err as Error).message
    } finally {
      loading.value = false
    }
  }

  // Sign out
  async function signOut() {
    try {
      loading.value = true
      error.value = null
      
      const { error: err } = await supabase.auth.signOut()
      if (err) throw err
      
      user.value = null
      
    } catch (err) {
      error.value = (err as Error).message
    } finally {
      loading.value = false
    }
  }

  return {
    user,
    loading,
    error,
    init,
    signIn,
    signUp,
    signOut,
  }
}) 