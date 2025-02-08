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
      <h1>Welcome Back</h1>
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
}

.dashboard-header {
  margin-bottom: 2rem;
}

h1 {
  font-size: 2rem;
  font-weight: 600;
  color: var(--text-primary);
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
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