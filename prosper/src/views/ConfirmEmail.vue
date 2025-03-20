<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
</script>

<template>
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
</template> 