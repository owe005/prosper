<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { financeService } from '../services/financeService'
import { supabase } from '../lib/supabase'
import type { Budget, Transaction, Category } from '../types/database.types'
import Modal from './Modal.vue'

const props = defineProps<{
  isDashboard?: boolean
}>()

const budgets = ref<Budget[]>([])
const transactions = ref<Transaction[]>([])
const categories = ref<Category[]>([])
const isLoading = ref(true)
const error = ref('')

// Form state
const showModal = ref(false)
const newBudget = ref({
  category: '',
  amount: 0,
  period: 'monthly' as const
})

const showCategoryDropdown = ref(false)

const loadData = async () => {
  try {
    isLoading.value = true
    const [budgetsData, transactionsData, categoriesData] = await Promise.all([
      financeService.getBudgets(),
      financeService.getTransactions(),
      financeService.getCategories()
    ])
    budgets.value = budgetsData
    transactions.value = transactionsData
    categories.value = categoriesData
  } catch (e) {
    error.value = 'Failed to load budgets'
    console.error(e)
  } finally {
    isLoading.value = false
  }
}

const addBudget = async () => {
  try {
    const userId = (await supabase.auth.getUser()).data.user?.id as string
    
    // If category doesn't exist, add it first
    if (!categories.value.some(c => c.name.toLowerCase() === newBudget.value.category.toLowerCase())) {
      await financeService.addCategory({
        name: newBudget.value.category,
        user_id: userId
      })
    }
    
    await financeService.addBudget({
      ...newBudget.value,
      user_id: userId
    })
    
    // Reset form and reload data
    newBudget.value = {
      category: '',
      amount: 0,
      period: 'monthly'
    }
    showModal.value = false
    await loadData()
  } catch (e) {
    error.value = 'Failed to add budget'
    console.error(e)
  }
}

const resetForm = () => {
  newBudget.value = {
    category: '',
    amount: 0,
    period: 'monthly'
  }
  showModal.value = false
}

// Calculate spent amount for each budget category
const categorySpending = computed(() => {
  const spending: Record<string, number> = {}
  const now = new Date()
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  transactions.value.forEach(tx => {
    if (tx.amount < 0 && new Date(tx.date) >= firstDayOfMonth) {
      spending[tx.category] = (spending[tx.category] || 0) + Math.abs(tx.amount)
    }
  })
  return spending
})

const getPercentage = (spent: number, budget: number) => Math.min((spent / budget) * 100, 100)

// Filter categories based on input
const filteredCategories = computed(() => {
  const search = newBudget.value.category.toLowerCase().trim()
  const filtered = categories.value
    .filter(c => !search || c.name.toLowerCase().includes(search))
    .sort((a, b) => {
      if (!search) return a.name.localeCompare(b.name)
      const aName = a.name.toLowerCase()
      const bName = b.name.toLowerCase()
      if (aName === search) return -1
      if (bName === search) return 1
      if (aName.startsWith(search) && !bName.startsWith(search)) return -1
      if (bName.startsWith(search) && !aName.startsWith(search)) return 1
      return 0
    })
  return filtered
})

const selectCategory = (categoryName: string) => {
  newBudget.value.category = categoryName
  showCategoryDropdown.value = false
}

// Computed property for displayed budget
const displayedBudgets = computed(() => {
  return budgets.value
})

onMounted(loadData)
</script>

<template>
  <div class="budget-overview" :class="{ 'is-dashboard': isDashboard }">
    <div class="header">
      <h2>Budget Overview</h2>
      <button @click="showModal = true" class="add-button">Add Budget</button>
    </div>

    <Modal 
      :show="showModal"
      title="Add Budget"
      @close="resetForm"
    >
      <form @submit.prevent="addBudget" class="form">
        <div class="form-group">
          <label>Category</label>
          <div class="category-input">
            <input 
              v-model="newBudget.category" 
              required 
              type="text"
              autocomplete="off"
              placeholder="Select existing or type new category"
              @focus="showCategoryDropdown = true"
            >
            <div v-if="showCategoryDropdown && (filteredCategories.length > 0 || newBudget.category)" 
                 class="category-dropdown">
              <div v-if="filteredCategories.length > 0" class="existing-categories">
                <div v-for="category in filteredCategories" 
                     :key="category.id"
                     class="category-option"
                     @mousedown.prevent="selectCategory(category.name)">
                  {{ category.name }}
                </div>
              </div>
              <div v-if="newBudget.category && !filteredCategories.some(c => c.name.toLowerCase() === newBudget.category.toLowerCase())"
                   class="new-category-option"
                   @mousedown.prevent="selectCategory(newBudget.category)">
                Create "{{ newBudget.category }}"
              </div>
            </div>
          </div>
        </div>
        <div class="form-group">
          <label>Amount</label>
          <input v-model.number="newBudget.amount" required type="number" step="0.01">
        </div>
        <div class="form-group">
          <label>Period</label>
          <select v-model="newBudget.period">
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>
        <div class="form-actions">
          <button type="button" @click="resetForm">Cancel</button>
          <button type="submit">Add Budget</button>
        </div>
      </form>
    </Modal>

    <div v-if="error" class="error">{{ error }}</div>
    <div v-if="isLoading" class="loading">Loading budgets...</div>

    <div v-else class="categories-container" :class="{ 'dashboard-height': isDashboard }">
      <div class="categories">
        <div v-for="budget in displayedBudgets" :key="budget.id" class="category">
          <div class="category-header">
            <span class="name">{{ budget.category }}</span>
            <span class="amounts">
              kr {{ categorySpending[budget.category]?.toLocaleString('nb-NO', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) || '0' }} / kr {{ budget.amount.toLocaleString('nb-NO', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) }}
            </span>
          </div>
          <div class="progress-container">
            <div 
              class="progress-bar" 
              :style="{ width: `${getPercentage(categorySpending[budget.category] || 0, budget.amount)}%` }"
              :class="{ 
                warning: (categorySpending[budget.category] || 0) > budget.amount * 0.8,
                danger: (categorySpending[budget.category] || 0) > budget.amount
              }"
            ></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.budget-overview {
  background: var(--bg-primary);
  border-radius: 16px;
  padding: 1.5rem;
  height: 100%;
  display: flex;
  flex-direction: column;
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.header h2 {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
  background: linear-gradient(to right, var(--text-primary), var(--text-secondary));
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.add-button {
  padding: 0.5rem 1rem;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.add-button:hover {
  background: var(--primary-hover);
  transform: translateY(-1px);
}

.categories-container {
  flex: 1;
  overflow-y: auto;
  margin: -0.5rem;
  padding: 0.5rem;
}

.categories-container.dashboard-height {
  max-height: 300px;
}

.categories {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.category {
  background: var(--bg-secondary);
  border-radius: 12px;
  padding: 1.25rem;
  transition: all 0.2s ease;
}

.category:hover {
  transform: translateX(4px);
  box-shadow: var(--card-shadow);
}

.category-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.name {
  font-weight: 600;
  color: var(--text-primary);
}

.amount {
  font-weight: 500;
  color: var(--text-secondary);
}

.progress-container {
  position: relative;
  height: 8px;
  background: var(--bg-primary);
  border-radius: 4px;
  overflow: hidden;
}

.progress-bar {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  background: var(--primary);
  border-radius: 4px;
  transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.progress-bar.warning {
  background: var(--warning);
}

.progress-bar.danger {
  background: var(--danger);
}

.progress-info {
  display: flex;
  justify-content: space-between;
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.error {
  color: var(--danger);
  padding: 1rem;
  text-align: center;
  background: var(--bg-secondary);
  border-radius: 8px;
  margin: 1rem 0;
}

.loading {
  text-align: center;
  color: var(--text-secondary);
  padding: 2rem;
  font-style: italic;
}

/* Form Styles */
.form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 500;
  color: var(--text-primary);
}

.form-group input,
.form-group select {
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 1rem;
  transition: all 0.2s ease;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 2px var(--primary-hover);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
}

.form-actions button {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.form-actions button[type="button"] {
  background: var(--bg-secondary);
  color: var(--text-secondary);
  border: 1px solid var(--border-color);
}

.form-actions button[type="submit"] {
  background: var(--primary);
  color: white;
  border: none;
}

.form-actions button:hover {
  transform: translateY(-1px);
}

.form-actions button[type="button"]:hover {
  background: var(--bg-hover);
}

.form-actions button[type="submit"]:hover {
  background: var(--primary-hover);
}

/* Category Dropdown Styles */
.category-input {
  position: relative;
}

.category-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  max-height: 200px;
  overflow-y: auto;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  margin-top: 4px;
  box-shadow: var(--card-shadow);
  z-index: 10;
}

.category-option,
.new-category-option {
  padding: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.category-option:hover,
.new-category-option:hover {
  background: var(--bg-hover);
}

.new-category-option {
  color: var(--primary);
  font-weight: 500;
  border-top: 1px solid var(--border-color);
}
</style>