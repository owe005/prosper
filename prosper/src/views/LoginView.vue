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

<template>
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
</template>