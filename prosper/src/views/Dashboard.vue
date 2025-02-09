<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { financeService } from '../services/financeService'
import type { Transaction } from '../types/database.types'
import { useAuthStore } from '@/stores/auth'
import BalanceCard from '../components/BalanceCard.vue'
import BudgetOverview from '../components/BudgetOverview.vue'
import TransactionList from '../components/TransactionList.vue'
import NetworthChart from '../components/NetworthChart.vue'
import ThemeToggle from '@/components/ThemeToggle.vue'

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
  return date.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: undefined,
  }).replace(',', '')
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
    <ThemeToggle />
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
    <NetworthChart :transactions="transactions" />
  </div>
</template>

<style scoped>
.dashboard {
  padding: 2rem;
}

.dashboard-header {
  margin-bottom: 2rem;
}

.greeting-container {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

h1 {
  font-size: 2rem;
  font-weight: 600;
  color: var(--text-primary);
}

.date {
  font-size: 1.1rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}

.grid-item {
  background-color: var(--bg-primary);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: var(--card-shadow);
}

.transactions {
  grid-column: span 2;
}

@media (max-width: 768px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }

  .transactions {
    grid-column: span 1;
  }
}
</style>