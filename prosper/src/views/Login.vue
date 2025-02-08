<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const auth = useAuthStore()
const router = useRouter()

const isSignUp = ref(false)
const email = ref('')
const password = ref('')

async function handleSubmit() {
  if (!email.value || !password.value) return

  if (isSignUp.value) {
    await auth.signUp(email.value, password.value)
  } else {
    await auth.signIn(email.value, password.value)
  }

  if (auth.user && !auth.error) {
    router.push('/')
  }
}
</script>

<template>
  <div class="login-container">
    <div class="login-card">
      <h1 class="title">{{ isSignUp ? 'Create Account' : 'Welcome Back' }}</h1>
      
      <form @submit.prevent="handleSubmit" class="login-form">
        <div class="form-group">
          <label for="email">Email</label>
          <input 
            id="email"
            v-model="email"
            type="email"
            required
            placeholder="Enter your email"
          >
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <input 
            id="password"
            v-model="password"
            type="password"
            required
            placeholder="Enter your password"
          >
        </div>

        <div v-if="auth.error" class="error-message">
          {{ auth.error }}
        </div>

        <button 
          type="submit" 
          class="submit-button"
          :disabled="auth.loading"
        >
          {{ isSignUp ? 'Sign Up' : 'Sign In' }}
        </button>

        <button 
          type="button"
          class="toggle-button"
          @click="isSignUp = !isSignUp"
        >
          {{ isSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up' }}
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: var(--bg-secondary);
}

.login-card {
  background: var(--bg-primary);
  padding: 2rem;
  border-radius: 8px;
  box-shadow: var(--card-shadow);
  width: 100%;
  max-width: 400px;
}

.title {
  color: var(--text-primary);
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 2rem;
  text-align: center;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

label {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

input {
  padding: 0.75rem;
  border-radius: 6px;
  border: 1px solid var(--border-color);
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 1rem;
}

input:focus {
  outline: none;
  border-color: var(--text-primary);
}

.error-message {
  color: var(--danger);
  font-size: 0.9rem;
  text-align: center;
}

.submit-button {
  padding: 0.75rem;
  background: var(--success);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.3s ease;
}

.submit-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.toggle-button {
  background: transparent;
  border: none;
  color: var(--text-secondary);
  font-size: 0.9rem;
  cursor: pointer;
  padding: 0.5rem;
}

.toggle-button:hover {
  color: var(--text-primary);
}
</style> 