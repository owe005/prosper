<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { financeService } from '@/services/financeService'
import type { Transaction } from '@/types/database.types'

const transactions = ref<Transaction[]>([])
const isLoading = ref(true)
const error = ref('')

const loadTransactions = async () => {
  try {
    isLoading.value = true
    transactions.value = await financeService.getTransactions()
  } catch (e) {
    error.value = 'Failed to load balance'
    console.error(e)
  } finally {
    isLoading.value = false
  }
}

onMounted(loadTransactions)

const currentBalance = computed(() => {
  return transactions.value.reduce((sum, tx) => sum + tx.amount, 0)
})

const initialBalance = computed(() => {
  const initialTx = transactions.value.find(tx => tx.category === 'Initial Balance')
  return initialTx?.amount || 0
})

const netWorthChange = computed(() => {
  if (!initialBalance.value) return 0
  return ((currentBalance.value - initialBalance.value) / initialBalance.value) * 100
})

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
}

const formatPercentage = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
    signDisplay: 'always'
  }).format(value / 100)
}
</script>

<template>
  <div class="balance-card">
    <h2>Current Net Worth</h2>
    
    <div v-if="error" class="error">{{ error }}</div>
    <div v-else-if="isLoading" class="loading">Loading balance...</div>
    <div v-else>
      <div class="balance">
        {{ formatCurrency(currentBalance) }}
      </div>
      
      <div v-if="initialBalance" class="progress-info">
        <div class="change" :class="{ positive: netWorthChange >= 0, negative: netWorthChange < 0 }">
          {{ formatPercentage(netWorthChange) }}
        </div>
        <div class="since">since start</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.balance-card {
  text-align: center;
}

h2 {
  font-size: 1.25rem;
  color: var(--text-secondary);
  margin-bottom: 1rem;
}

.balance {
  font-size: 2.5rem;
  font-weight: bold;
  color: var(--text-primary);
}

.progress-info {
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.change {
  font-weight: 600;
  font-size: 1.125rem;
}

.change.positive {
  color: var(--success);
}

.change.negative {
  color: var(--danger);
}

.since {
  font-size: 0.875rem;
  color: var(--text-secondary);
}
</style>
