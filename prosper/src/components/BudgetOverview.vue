<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { financeService } from '../services/financeService'
import { supabase } from '../lib/supabase'
import type { Budget, Transaction } from '../types/database.types'
import Modal from './Modal.vue'

const budgets = ref<Budget[]>([])
const transactions = ref<Transaction[]>([])
const isLoading = ref(true)
const error = ref('')

// Form state
const showModal = ref(false)
const newBudget = ref({
  category: '',
  amount: 0,
  period: 'monthly' as const
})

const loadData = async () => {
  try {
    isLoading.value = true
    const [budgetsData, transactionsData] = await Promise.all([
      financeService.getBudgets(),
      financeService.getTransactions()
    ])
    budgets.value = budgetsData
    transactions.value = transactionsData
  } catch (e) {
    error.value = 'Failed to load budgets'
    console.error(e)
  } finally {
    isLoading.value = false
  }
}

const addBudget = async () => {
  try {
    await financeService.addBudget({
      ...newBudget.value,
      user_id: (await supabase.auth.getUser()).data.user?.id as string
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

onMounted(loadData)
</script>

<template>
  <div class="budget-overview">
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
          <input v-model="newBudget.category" required type="text">
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

    <div v-else class="categories">
      <div v-for="budget in budgets" :key="budget.id" class="category">
        <div class="category-header">
          <span class="name">{{ budget.category }}</span>
          <span class="amounts">
            ${{ categorySpending[budget.category]?.toFixed(2) || '0.00' }} / ${{ budget.amount }}
          </span>
        </div>
        <div class="progress-bar">
          <div 
            class="progress" 
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
</template>