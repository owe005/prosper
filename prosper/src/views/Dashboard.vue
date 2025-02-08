<script setup lang="ts">
import BalanceCard from '@/components/BalanceCard.vue'
import TransactionList from '@/components/TransactionList.vue'
import BudgetOverview from '@/components/BudgetOverview.vue'
import ThemeToggle from '@/components/ThemeToggle.vue'
</script>

<template>
  <div class="dashboard">
    <ThemeToggle />
    <header class="dashboard-header">
      <h1>Welcome to Prosper</h1>
    </header>
    
    <div class="dashboard-grid">
      <BalanceCard class="grid-item" />
      <BudgetOverview class="grid-item" />
      <TransactionList class="grid-item transactions" />
    </div>
  </div>
</template>

<style scoped>
.dashboard {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.dashboard-header {
  margin-bottom: 2rem;
}

.dashboard-header h1 {
  color: var(--text-primary);
  font-size: 2rem;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.grid-item {
  background: var(--bg-primary);
  border-radius: 8px;
  box-shadow: var(--card-shadow);
  padding: 1.5rem;
}

.transactions {
  grid-column: 1 / -1;
}
</style> 