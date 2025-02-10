<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const auth = useAuthStore()
const router = useRouter()

const isSignUp = ref(false)
const email = ref('')
const password = ref('')
const firstName = ref('')
const lastName = ref('')

async function handleSubmit() {
  if (!email.value || !password.value) return
  if (isSignUp.value && (!firstName.value || !lastName.value)) return

  if (isSignUp.value) {
    await auth.signUp(email.value, password.value, firstName.value, lastName.value)
  } else {
    await auth.signIn(email.value, password.value)
  }

  if (auth.user && !auth.error) {
    router.push('/')
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--bg-primary);
  padding: 20px;
}

.login-card {
  background-color: var(--bg-secondary);
  border-radius: 12px;
  padding: 2rem;
  width: 100%;
  max-width: 450px;
  box-shadow: var(--card-shadow);
  transform-origin: center;
  animation: cardAppear 0.6s ease-out;
}

.title {
  color: var(--text-primary);
  font-size: 2rem;
  margin-bottom: 2rem;
  text-align: center;
  font-weight: 600;
  animation: slideDown 0.5s ease-out;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

.form-group {
  animation: slideIn 0.5s ease-out;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--text-secondary);
  font-weight: 500;
  font-size: 0.95rem;
}

.form-group input {
  width: 100%;
  padding: 0.8rem 1rem;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background-color: var(--bg-primary);
  color: var(--text-primary);
}

.form-group input:focus {
  border-color: var(--accent-color);
  box-shadow: 0 0 0 3px var(--accent-color-transparent);
  outline: none;
}

.error-message {
  color: var(--error-color);
  font-size: 0.9rem;
  margin-top: 0.5rem;
  text-align: center;
  animation: shake 0.5s ease-in-out;
}

.submit-button {
  background: linear-gradient(to right, #059669, #10b981);
  color: white;
  padding: 1rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 1.5rem;
  width: 100%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.submit-button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  filter: brightness(110%);
}

.submit-button:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  filter: brightness(100%);
}

.submit-button:disabled {
  background: #94a3b8;
  cursor: not-allowed;
  box-shadow: none;
}

.toggle-button {
  background-color: var(--bg-primary);
  border: 2px solid #10b981;
  color: #10b981;
  font-size: 0.95rem;
  margin-top: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  padding: 0.8rem;
  width: 100%;
  border-radius: 8px;
  font-weight: 500;
}

.toggle-button:hover {
  background-color: rgba(16, 185, 129, 0.1);
  border-color: #059669;
  color: #059669;
}

/* Animations */
@keyframes cardAppear {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}
</style>

<template>
  <div class="login-container">
    <div class="login-card">
      <h1 class="title">{{ isSignUp ? 'Create Account' : 'Welcome Back' }}</h1>
      
      <form @submit.prevent="handleSubmit" class="login-form">
        <template v-if="isSignUp">
          <div class="form-group">
            <label for="firstName">First Name</label>
            <input 
              id="firstName"
              v-model="firstName"
              type="text"
              required
              placeholder="Enter your first name"
              autocomplete="given-name"
            >
          </div>

          <div class="form-group">
            <label for="lastName">Last Name</label>
            <input 
              id="lastName"
              v-model="lastName"
              type="text"
              required
              placeholder="Enter your last name"
              autocomplete="family-name"
            >
          </div>
        </template>

        <div class="form-group">
          <label for="email">Email</label>
          <input 
            id="email"
            v-model="email"
            type="email"
            required
            placeholder="Enter your email"
            autocomplete="email"
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
            autocomplete="current-password"
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
          {{ isSignUp ? 'Create Account' : 'Sign In' }}
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