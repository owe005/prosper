<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { financeService } from '../services/financeService'
import { supabase } from '../lib/supabase'
import type { Transaction } from '../types/database.types'
import Modal from './Modal.vue'

const transactions = ref<Transaction[]>([])
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

const loadTransactions = async () => {
  try {
    isLoading.value = true
    transactions.value = await financeService.getTransactions()
  } catch (e) {
    error.value = 'Failed to load transactions'
    console.error(e)
  } finally {
    isLoading.value = false
  }
}

const addTransaction = async () => {
  try {
    const amount = newTransaction.value.type === 'expense' 
      ? -Math.abs(newTransaction.value.amount) 
      : Math.abs(newTransaction.value.amount)
    
    await financeService.addTransaction({
      ...newTransaction.value,
      amount,
      user_id: (await supabase.auth.getUser()).data.user?.id as string
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
    await loadTransactions()
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

onMounted(loadTransactions)

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  })
}

const formatAmount = (amount: number) => {
  const formatted = Math.abs(amount).toFixed(2)
  return amount < 0 ? `-$${formatted}` : `+$${formatted}`
}
</script>

<template>
  <div class="transaction-list">
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
          <input v-model="newTransaction.category" required type="text">
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

    <div v-else class="transactions">
      <div v-for="tx in transactions" :key="tx.id" class="transaction">
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
</template>