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
  
  if (!search) return [...categories.value].sort((a, b) => a.name.localeCompare(b.name))
  
  return [...categories.value]
    .filter(c => c.name.toLowerCase().includes(search))
    .sort((a, b) => {
      const aName = a.name.toLowerCase()
      const bName = b.name.toLowerCase()
      if (aName === search) return -1
      if (bName === search) return 1
      if (aName.startsWith(search) && !bName.startsWith(search)) return -1
      if (bName.startsWith(search) && !aName.startsWith(search)) return 1
      return aName.localeCompare(bName)
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
        <div v-for="transaction in displayedTransactions" 
             :key="transaction.id" 
             class="transaction"
             :class="{ 'income': transaction.amount > 0, 'expense': transaction.amount < 0 }">
          <div class="transaction-info">
            <div class="transaction-main">
              <span class="description">{{ transaction.description }}</span>
              <span class="amount" :class="{ 'positive': transaction.amount > 0, 'negative': transaction.amount < 0 }">
                {{ formatAmount(transaction.amount) }}
              </span>
            </div>
            <div class="transaction-details">
              <span class="category">{{ transaction.category }}</span>
              <span class="date">{{ formatDate(transaction.date) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.transaction-list {
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

.transactions-container {
  flex: 1;
  overflow-y: auto;
  margin: -0.5rem;
  padding: 0.5rem;
}

.transactions-container.dashboard-height {
  max-height: 300px;
}

.transactions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.transaction {
  background: var(--bg-secondary);
  border-radius: 12px;
  padding: 1rem 1.25rem;
  transition: all 0.2s ease;
  border-left: 4px solid transparent;
}

.transaction.income {
  border-left-color: var(--success);
}

.transaction.expense {
  border-left-color: var(--danger);
}

.transaction:hover {
  transform: translateX(4px);
  box-shadow: var(--card-shadow);
}

.transaction-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.transaction-main {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.description {
  font-weight: 600;
  color: var(--text-primary);
  margin-right: 1.5rem;
  font-size: 1.1rem;
}

.amount {
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  font-size: 1.1rem;
  padding: 0.35rem 0.75rem;
  border-radius: 8px;
  background: var(--bg-primary);
}

.amount.positive {
  color: var(--success);
  background: rgba(var(--success-rgb), 0.1);
}

.amount.negative {
  color: var(--danger);
  background: rgba(var(--danger-rgb), 0.1);
}

.transaction-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.category {
  padding: 0.25rem 0.75rem;
  background: var(--bg-primary);
  border-radius: 1rem;
  font-weight: 500;
}

.date {
  font-weight: 500;
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
</style>