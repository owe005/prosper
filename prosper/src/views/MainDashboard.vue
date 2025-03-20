<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { financeService } from '../services/financeService'
import type { Transaction } from '../types/database.types'
import { useAuthStore } from '@/stores/auth'
import BalanceCard from '../components/BalanceCard.vue'
import BudgetOverview from '../components/BudgetOverview.vue'
import TransactionList from '../components/TransactionList.vue'
import NetworthChart from '../components/NetworthChart.vue'

const auth = useAuthStore()
const transactions = ref<Transaction[]>([])
const isLoading = ref(true)

const getTimeBasedGreeting = () => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

const formattedDate = computed(() => {
  const date = new Date()
  return date
    .toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: undefined,
    })
    .replace(',', '')
})

const greeting = computed(() => {
  const firstName = auth.user?.user_metadata?.first_name || ''
  return `${getTimeBasedGreeting()}, ${firstName}`
})

const loadTransactions = async () => {
  try {
    transactions.value = await financeService.getTransactions()
  } catch (e) {
    console.error('Failed to load transactions:', e)
  } finally {
    isLoading.value = false
  }
}

onMounted(loadTransactions)
</script>

<template>
  <div class="dashboard">
    <header class="dashboard-header">
      <div class="greeting-container">
        <h1>{{ greeting }}</h1>
        <p class="date">{{ formattedDate }}</p>
      </div>
    </header>

    <div class="dashboard-grid">
      <BalanceCard :transactions="transactions" :is-loading="isLoading" />
      <BudgetOverview :is-dashboard="true" />
      <TransactionList :is-dashboard="true" />
    </div>
    <NetworthChart :transactions="transactions" :initial-balance="0" />
  </div>
</template>
