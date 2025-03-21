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