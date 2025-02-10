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
    <NetworthChart :transactions="transactions" :initial-balance="0" />
  </div>
</template>

<style scoped>
.dashboard {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.dashboard-header {
  margin-bottom: 3rem;
  position: relative;
}

.greeting-container {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  animation: slideIn 0.6s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

h1 {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.5px;
  margin: 0;
  line-height: 1.2;
  background: linear-gradient(to right, var(--text-primary), var(--text-secondary));
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.date {
  font-size: 1.1rem;
  color: var(--text-secondary);
  font-weight: 500;
  opacity: 0.9;
  margin: 0;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
  animation: fadeInUp 0.7s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.grid-item {
  background-color: var(--bg-primary);
  border-radius: 16px;
  padding: 1.75rem;
  box-shadow: var(--card-shadow);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.grid-item:hover {
  transform: translateY(-2px);
  box-shadow: var(--card-shadow-hover);
}

.transactions {
  grid-column: span 2;
}

@media (max-width: 1200px) {
  .dashboard {
    padding: 1.5rem;
  }

  .dashboard-grid {
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1.5rem;
  }
}

@media (max-width: 768px) {
  .dashboard {
    padding: 1rem;
  }

  h1 {
    font-size: 2rem;
  }

  .dashboard-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .transactions {
    grid-column: span 1;
  }
}
</style>
