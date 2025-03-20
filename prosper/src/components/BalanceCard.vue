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
  return new Intl.NumberFormat('nb-NO', {
    style: 'currency',
    currency: 'NOK',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
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
    <div v-else class="balance-content">
      <div class="balance-wrapper">
        <div class="balance">
          {{ formatCurrency(currentBalance) }}
        </div>
        <div class="balance-sparkle"></div>
      </div>
      
      <div v-if="initialBalance" class="progress-info">
        <div class="change-wrapper">
          <div class="change" :class="{ positive: netWorthChange >= 0, negative: netWorthChange < 0 }">
            {{ formatPercentage(netWorthChange) }}
          </div>
          <div class="trend-arrow" :class="{ up: netWorthChange >= 0, down: netWorthChange < 0 }">
            {{ netWorthChange >= 0 ? '↑' : '↓' }}
          </div>
        </div>
        <div class="since">since start</div>
      </div>
    </div>
  </div>
</template>
