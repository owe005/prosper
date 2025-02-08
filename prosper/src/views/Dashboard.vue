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