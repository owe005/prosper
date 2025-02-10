<script setup lang="ts">
import TransactionList from '@/components/TransactionList.vue'
</script>

<template>
  <div class="transactions-view">
    <header class="view-header">
      <h1>Transactions</h1>
    </header>
    
    <TransactionList />
  </div>
</template>

<style scoped>
.transactions-view {
  padding: 2rem;
}

.view-header {
  margin-bottom: 2rem;
}

h1 {
  font-size: 2rem;
  font-weight: 600;
  color: var(--text-primary);
}
</style> 