import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { financeService } from '@/services/financeService'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'dashboard',
      component: () => import('@/views/Dashboard.vue'),
      meta: { requiresAuth: true, requiresEmailConfirmed: true }
    },
    {
      path: '/transactions',
      name: 'transactions',
      component: () => import('@/views/Transactions.vue'),
      meta: { requiresAuth: true, requiresEmailConfirmed: true }
    },
    {
      path: '/budgets',
      name: 'budgets',
      component: () => import('@/views/Budgets.vue'),
      meta: { requiresAuth: true, requiresEmailConfirmed: true }
    },
    {
      path: '/initial-setup',
      name: 'initial-setup',
      component: () => import('@/views/InitialSetup.vue'),
      meta: { requiresAuth: true, requiresEmailConfirmed: true }
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/Login.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/confirm-email',
      name: 'confirm-email',
      component: () => import('@/views/ConfirmEmail.vue'),
      meta: { requiresAuth: true, requiresEmailConfirmed: false }
    }
  ]
})

// Navigation guard
router.beforeEach(async (to) => {
  const auth = useAuthStore()
  
  // Initialize auth state if not already done
  if (!auth.user) {
    await auth.init()
  }

  if (to.meta.requiresAuth && !auth.user) {
    return { name: 'login' }
  }

  // Check if email confirmation is required
  if (to.meta.requiresEmailConfirmed && auth.user && !auth.user.email_confirmed_at) {
    return { name: 'confirm-email' }
  }

  if (to.name === 'login' && auth.user) {
    return { name: 'dashboard' }
  }

  // Check if user needs to complete initial setup
  if (auth.user && auth.user.email_confirmed_at && to.name !== 'initial-setup') {
    try {
      const transactions = await financeService.getTransactions()
      const hasInitialBalance = transactions.some(tx => tx.category === 'Initial Balance')
      if (!hasInitialBalance) {
        return { name: 'initial-setup' }
      }
    } catch (e) {
      console.error('Failed to check initial balance:', e)
    }
  }

  return true
})

export default router 