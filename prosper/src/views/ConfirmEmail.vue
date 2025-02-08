<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
</script>

<template>
  <div class="login-container">
    <div class="login-card">
      <h1 class="title">Confirm Your Email</h1>
      <p class="subtitle">Please check your email to confirm your account</p>
      
      <div class="confirmation-content">
        <p>We've sent a confirmation link to:</p>
        <p class="email">{{ auth.user?.email }}</p>
        <p class="instructions">
          Click the link in the email to verify your account.
          After confirming, you can refresh this page.
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.subtitle {
  text-align: center;
  color: var(--text-secondary);
  margin-bottom: 2rem;
}

.confirmation-content {
  text-align: center;
  color: var(--text-primary);
}

.email {
  font-weight: 600;
  margin: 1rem 0;
  padding: 0.5rem;
  background-color: var(--bg-secondary);
  border-radius: 6px;
}

.instructions {
  color: var(--text-secondary);
  font-size: 0.875rem;
  line-height: 1.5;
  margin-top: 1rem;
}
</style> 