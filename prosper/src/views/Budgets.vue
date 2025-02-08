<script setup lang="ts">
import BudgetOverview from '@/components/BudgetOverview.vue'
</script>

<template>
  <div class="budgets-view">
    <header class="view-header">
      <h1>Budgets</h1>
    </header>
    
    <BudgetOverview />
  </div>
</template>

<style scoped>
.budgets-view {
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