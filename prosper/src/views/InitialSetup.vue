<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { financeService } from '@/services/financeService'

const router = useRouter()
const auth = useAuthStore()
const initialBalance = ref(0)
const isLoading = ref(false)
const error = ref('')

async function handleSubmit() {
  if (initialBalance.value <= 0) {
    error.value = 'Please enter a valid starting balance'
    return
  }

  if (!auth.user?.id) {
    error.value = 'Please sign in to continue'
    return
  }

  try {
    isLoading.value = true
    await financeService.addTransaction({
      description: 'Initial Balance',
      amount: initialBalance.value,
      category: 'Initial Balance',
      type: 'income',
      date: new Date().toISOString().split('T')[0],
      user_id: auth.user.id
    })

    router.push({ name: 'dashboard' })
  } catch (e) {
    error.value = 'Failed to save initial balance'
    console.error(e)
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="login-card">
    <h1 class="title">Welcome to Prosper</h1>
    <p class="subtitle">Let's start by setting up your initial balance</p>
    
    <form @submit.prevent="handleSubmit" class="login-form">
      <div class="form-group">
        <label for="balance">What's your current net worth?</label>
        <div class="amount-input">
          <span class="currency">kr</span>
          <input 
            id="balance"
            v-model.number="initialBalance"
            type="number"
            required
            min="0"
            step="1"
            placeholder="0"
          >
        </div>
        <p class="help-text">
          This helps us track your financial progress over time.
          Include the total value of your:
        </p>
        <ul class="help-list">
          <li>Cash and bank accounts</li>
          <li>Investments</li>
          <li>Property and assets</li>
          <li>Minus any debts or loans</li>
        </ul>
      </div>

      <div v-if="error" class="error-message">
        {{ error }}
      </div>

      <button 
        type="submit" 
        class="submit-button"
        :disabled="isLoading"
      >
        Get Started
      </button>
    </form>
  </div>
</template> 