<script setup lang="ts">
// TODO: Replace with actual data from store
const balance = 5000
const currency = '$'
</script>

<template>
  <div class="balance-card">
    <h2>Current Balance</h2>
    <div class="balance">
      <span class="currency">{{ currency }}</span>
      <span class="amount">{{ balance.toLocaleString() }}</span>
    </div>
  </div>
</template>

<style scoped>
.balance-card {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

h2 {
  color: var(--text-secondary);
  font-size: 1.1rem;
  font-weight: 500;
}

.balance {
  font-size: 2.5rem;
  font-weight: 600;
  color: var(--text-primary);
}

.currency {
  font-size: 1.8rem;
  margin-right: 0.25rem;
}
</style> 