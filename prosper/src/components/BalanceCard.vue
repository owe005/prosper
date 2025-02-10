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

<style scoped>
.balance-card {
  background: var(--bg-primary);
  border-radius: 16px;
  padding: 2rem;
  text-align: center;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
  overflow: hidden;
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

h2 {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 2rem 0;
  background: linear-gradient(to right, var(--text-primary), var(--text-secondary));
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  position: relative;
}

.balance-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  animation: slideUp 0.6s ease-out;
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.balance-wrapper {
  position: relative;
  padding: 1rem;
}

.balance {
  font-size: 3rem;
  font-weight: 700;
  color: var(--text-primary);
  transition: all 0.3s ease;
  font-variant-numeric: tabular-nums;
  position: relative;
  z-index: 1;
}

.balance-sparkle {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 120%;
  height: 120%;
  background: radial-gradient(
    circle at center,
    var(--primary) 0%,
    transparent 70%
  );
  opacity: 0.1;
  filter: blur(8px);
  animation: pulse 3s ease-in-out infinite;
}

@keyframes pulse {
  0% { transform: translate(-50%, -50%) scale(0.95); opacity: 0.1; }
  50% { transform: translate(-50%, -50%) scale(1.05); opacity: 0.15; }
  100% { transform: translate(-50%, -50%) scale(0.95); opacity: 0.1; }
}

.progress-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  background: var(--bg-secondary);
  border-radius: 12px;
  min-width: 160px;
  transition: all 0.3s ease;
}

.progress-info:hover {
  transform: translateY(-2px);
  box-shadow: var(--card-shadow);
}

.change-wrapper {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.change {
  font-weight: 600;
  font-size: 1.25rem;
  font-variant-numeric: tabular-nums;
}

.trend-arrow {
  font-size: 1.25rem;
  line-height: 1;
  transition: transform 0.3s ease;
}

.trend-arrow.up {
  color: var(--success);
  transform: translateY(-2px);
}

.trend-arrow.down {
  color: var(--danger);
  transform: translateY(2px);
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
  font-weight: 500;
}

.error {
  color: var(--danger);
  padding: 1rem;
  text-align: center;
  background: var(--bg-secondary);
  border-radius: 8px;
  margin: 1rem 0;
  font-weight: 500;
}

.loading {
  text-align: center;
  color: var(--text-secondary);
  padding: 2rem;
  font-style: italic;
  animation: pulse 2s ease-in-out infinite;
}

/* Responsive Styles */
@media (max-width: 768px) {
  .balance-card {
    padding: 1.5rem;
  }

  h2 {
    margin-bottom: 1.5rem;
  }

  .balance {
    font-size: 2.5rem;
  }

  .change {
    font-size: 1.125rem;
  }
}

/* Dark mode enhancements */
:root.dark .balance-sparkle {
  opacity: 0.15;
  filter: blur(12px);
}
</style>
