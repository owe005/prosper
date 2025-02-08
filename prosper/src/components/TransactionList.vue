<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { financeService } from '../services/financeService'
import { supabase } from '../lib/supabase'
import type { Transaction, Category } from '../types/database.types'
import Modal from './Modal.vue'

const props = defineProps<{
  isDashboard?: boolean
}>()

const transactions = ref<Transaction[]>([])
const categories = ref<Category[]>([])
const isLoading = ref(true)
const error = ref('')

// Form state
const showModal = ref(false)
const newTransaction = ref({
  description: '',
  amount: 0,
  category: '',
  type: 'expense' as const,
  date: new Date().toISOString().split('T')[0]
})

// Add new ref for dropdown visibility
const showCategoryDropdown = ref(false)

const loadData = async () => {
  try {
    isLoading.value = true
    const [transactionsData, categoriesData] = await Promise.all([
      financeService.getTransactions(),
      financeService.getCategories()
    ])
    transactions.value = transactionsData
    categories.value = categoriesData
  } catch (e) {
    error.value = 'Failed to load transactions'
    console.error(e)
  } finally {
    isLoading.value = false
  }
}

const addTransaction = async () => {
  try {
    const userId = (await supabase.auth.getUser()).data.user?.id as string
    const amount = newTransaction.value.type === 'expense' 
      ? -Math.abs(newTransaction.value.amount) 
      : Math.abs(newTransaction.value.amount)
    
    // If category doesn't exist, add it first
    if (!categories.value.some(c => c.name.toLowerCase() === newTransaction.value.category.toLowerCase())) {
      await financeService.addCategory({
        name: newTransaction.value.category,
        user_id: userId
      })
    }
    
    await financeService.addTransaction({
      ...newTransaction.value,
      amount,
      user_id: userId
    })
    
    // Reset form and reload transactions
    newTransaction.value = {
      description: '',
      amount: 0,
      category: '',
      type: 'expense',
      date: new Date().toISOString().split('T')[0]
    }
    showModal.value = false
    await loadData()
  } catch (e) {
    error.value = 'Failed to add transaction'
    console.error(e)
  }
}

const resetForm = () => {
  newTransaction.value = {
    description: '',
    amount: 0,
    category: '',
    type: 'expense',
    date: new Date().toISOString().split('T')[0]
  }
  showModal.value = false
}

// Filter categories based on input and transaction type
const filteredCategories = computed(() => {
  const search = newTransaction.value.category.toLowerCase().trim()
  
  if (!search) return categories.value.sort((a, b) => a.name.localeCompare(b.name))
  
  return categories.value
    .filter(c => c.name.toLowerCase().includes(search))
    .sort((a, b) => {
      const aName = a.name.toLowerCase()
      const bName = b.name.toLowerCase()
      if (aName === search) return -1
      if (bName === search) return 1
      if (aName.startsWith(search) && !bName.startsWith(search)) return -1
      if (bName.startsWith(search) && !aName.startsWith(search)) return 1
      return 0
    })
})

const selectCategory = (categoryName: string) => {
  newTransaction.value.category = categoryName
  showCategoryDropdown.value = false
}

onMounted(loadData)

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  })
}

const formatAmount = (amount: number) => {
  const formatted = Math.abs(amount).toLocaleString('nb-NO', {
    style: 'currency',
    currency: 'NOK',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  })
  return amount < 0 ? `-${formatted}` : `+${formatted}`
}

// Sort transactions by created_at (newest first)
const displayedTransactions = computed(() => {
  return [...transactions.value].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )
})
</script>

<template>
  <div class="transaction-list" :class="{ 'is-dashboard': isDashboard }">
    <div class="header">
      <h2>Recent Transactions</h2>
      <button @click="showModal = true" class="add-button">Add Transaction</button>
    </div>

    <Modal 
      :show="showModal"
      title="Add Transaction"
      @close="resetForm"
    >
      <form @submit.prevent="addTransaction" class="form">
        <div class="form-group">
          <label>Description</label>
          <input v-model="newTransaction.description" required type="text">
        </div>
        <div class="form-group">
          <label>Amount</label>
          <input v-model.number="newTransaction.amount" required type="number" step="0.01">
        </div>
        <div class="form-group">
          <label>Category</label>
          <div class="category-input">
            <input 
              v-model="newTransaction.category" 
              required 
              type="text"
              autocomplete="off"
              placeholder="Select existing or type new category"
              @focus="showCategoryDropdown = true"
            >
            <div v-if="showCategoryDropdown && (filteredCategories.length > 0 || newTransaction.category)" 
                 class="category-dropdown">
              <div v-if="filteredCategories.length > 0" class="existing-categories">
                <div v-for="category in filteredCategories" 
                     :key="category.id"
                     class="category-option"
                     @mousedown.prevent="selectCategory(category.name)">
                  {{ category.name }}
                </div>
              </div>
              <div v-if="newTransaction.category && !filteredCategories.some(c => c.name.toLowerCase() === newTransaction.category.toLowerCase())"
                   class="new-category-option"
                   @mousedown.prevent="selectCategory(newTransaction.category)">
                Create "{{ newTransaction.category }}"
              </div>
            </div>
          </div>
        </div>
        <div class="form-group">
          <label>Type</label>
          <select v-model="newTransaction.type">
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
        </div>
        <div class="form-group">
          <label>Date</label>
          <input v-model="newTransaction.date" required type="date">
        </div>
        <div class="form-actions">
          <button type="button" @click="resetForm">Cancel</button>
          <button type="submit">Add Transaction</button>
        </div>
      </form>
    </Modal>

    <div v-if="error" class="error">{{ error }}</div>
    <div v-if="isLoading" class="loading">Loading transactions...</div>

    <div v-else class="transactions-container" :class="{ 'dashboard-height': isDashboard }">
      <div class="transactions">
        <div v-for="tx in displayedTransactions" :key="tx.id" class="transaction">
          <div class="tx-info">
            <div class="tx-description">{{ tx.description }}</div>
            <div class="tx-category">{{ tx.category }}</div>
          </div>
          <div class="tx-details">
            <span :class="['tx-amount', tx.amount < 0 ? 'negative' : 'positive']">
              {{ formatAmount(tx.amount) }}
            </span>
            <span class="tx-date">{{ formatDate(tx.date) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.category-input {
  position: relative;
  width: 100%;
}

.category-input input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 1rem;
}

.category-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  max-height: 200px;
  overflow-y: auto;
  background-color: rgb(32, 33, 36);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  margin-top: 4px;
  z-index: 1000;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2);
}

.category-option, .new-category-option {
  padding: 0.75rem 1rem;
  cursor: pointer;
  background-color: rgb(32, 33, 36);
  color: rgb(232, 234, 237);
  transition: background-color 0.2s ease;
}

.category-option:hover, .new-category-option:hover {
  background-color: rgb(41, 42, 45);
}

.new-category-option {
  border-top: 1px solid var(--border-color);
  color: rgb(154, 160, 166);
  font-style: italic;
  padding: 0.75rem 1rem;
  background-color: rgb(32, 33, 36);
}

.existing-categories {
  border-bottom: 1px solid var(--border-color);
}

/* Add a subtle scroll bar styling */
.category-dropdown::-webkit-scrollbar {
  width: 8px;
}

.category-dropdown::-webkit-scrollbar-track {
  background: rgb(32, 33, 36);
  border-radius: 4px;
}

.category-dropdown::-webkit-scrollbar-thumb {
  background: rgb(41, 42, 45);
  border-radius: 4px;
}

.category-dropdown::-webkit-scrollbar-thumb:hover {
  background: rgb(54, 55, 58);
}

.transactions-container {
  position: relative;
  width: 100%;
}

.transactions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.dashboard-height {
  max-height: 300px;
  overflow-y: auto;
  padding-right: 0.5rem;
}

.dashboard-height::-webkit-scrollbar {
  width: 6px;
}

.dashboard-height::-webkit-scrollbar-track {
  background: var(--bg-secondary);
  border-radius: 3px;
}

.dashboard-height::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 3px;
}

.dashboard-height::-webkit-scrollbar-thumb:hover {
  background: var(--text-secondary);
}

.tx-details {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.tx-amount {
  font-weight: 500;
}

.tx-amount.positive {
  color: var(--success);
}

.tx-amount.negative {
  color: var(--error);
}

.tx-date {
  color: var(--text-secondary);
}
</style>