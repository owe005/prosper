<script setup lang="ts">
// TODO: Replace with actual data from store
const transactions = [
  { id: 1, description: 'Grocery Shopping', amount: -120.50, date: '2024-02-08', category: 'Food' },
  { id: 2, description: 'Salary Deposit', amount: 3000, date: '2024-02-07', category: 'Income' },
  { id: 3, description: 'Electric Bill', amount: -85.20, date: '2024-02-06', category: 'Utilities' },
  { id: 4, description: 'Coffee Shop', amount: -4.50, date: '2024-02-06', category: 'Food' }
]

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  })
}

const formatAmount = (amount: number) => {
  const formatted = Math.abs(amount).toFixed(2)
  return amount < 0 ? `-$${formatted}` : `+$${formatted}`
}
</script>

<template>
  <div class="transaction-list">
    <h2>Recent Transactions</h2>
    <div class="transactions">
      <div v-for="tx in transactions" :key="tx.id" class="transaction">
        <div class="tx-info">
          <div class="tx-description">{{ tx.description }}</div>
          <div class="tx-category">{{ tx.category }}</div>
        </div>
        <div class="tx-details">
          <span :class="['tx-amount', tx.amount < 0 ? 'negative' : 'positive']">
            {{ formatAmount(tx.amount) }}
          </span>
          <span class="tx-date">{{ formatDate(tx.date) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.transaction-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

h2 {
  color: var(--text-secondary);
  font-size: 1.1rem;
  font-weight: 500;
}

.transactions {
  display: flex;
  flex-direction: column;
}

.transaction {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  border-bottom: 1px solid var(--border-color);
}

.transaction:last-child {
  border-bottom: none;
}

.tx-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.tx-description {
  color: var(--text-primary);
  font-weight: 500;
}

.tx-category {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.tx-details {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.25rem;
}

.tx-amount {
  font-weight: 600;
}

.tx-amount.negative {
  color: var(--danger);
}

.tx-amount.positive {
  color: var(--success);
}

.tx-date {
  color: var(--text-secondary);
  font-size: 0.9rem;
}
</style> 