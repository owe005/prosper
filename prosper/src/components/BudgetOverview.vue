<script setup lang="ts">
// TODO: Replace with actual data from store
const categories = [
  { name: 'Housing', spent: 1200, budget: 1500 },
  { name: 'Food', spent: 400, budget: 500 },
  { name: 'Transportation', spent: 250, budget: 300 }
]

const getPercentage = (spent: number, budget: number) => (spent / budget) * 100
</script>

<template>
  <div class="budget-overview">
    <h2>Budget Overview</h2>
    <div class="categories">
      <div v-for="category in categories" :key="category.name" class="category">
        <div class="category-header">
          <span class="name">{{ category.name }}</span>
          <span class="amounts">
            ${{ category.spent }} / ${{ category.budget }}
          </span>
        </div>
        <div class="progress-bar">
          <div 
            class="progress" 
            :style="{ width: `${getPercentage(category.spent, category.budget)}%` }"
            :class="{ warning: category.spent > category.budget * 0.8 }"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.budget-overview {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

h2 {
  color: var(--text-secondary);
  font-size: 1.1rem;
  font-weight: 500;
}

.categories {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.category {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.category-header {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
}

.name {
  color: var(--text-primary);
  font-weight: 500;
}

.amounts {
  color: var(--text-secondary);
}

.progress-bar {
  height: 8px;
  background: var(--bg-hover);
  border-radius: 4px;
  overflow: hidden;
}

.progress {
  height: 100%;
  background: var(--success);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.progress.warning {
  background: var(--warning);
}
</style> 