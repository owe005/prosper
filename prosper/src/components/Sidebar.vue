<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const emit = defineEmits(['sign-out'])
const auth = useAuthStore()
const router = useRouter()
const activeSection = ref('dashboard')

const handleNavigation = (section: string) => {
  activeSection.value = section
  router.push({ name: section })
}
</script>

<template>
  <aside class="sidebar">
    <div class="sidebar-top">
      <div class="logo">prosper</div>
      
      <div class="search-bar">
        <input 
          type="text" 
          placeholder="Search or jump to"
          class="search-input"
        >
      </div>

      <nav class="main-nav">
        <button 
          class="nav-item"
          :class="{ active: activeSection === 'dashboard' }"
          @click="handleNavigation('dashboard')"
        >
          <span class="icon">📊</span>
          Dashboard
        </button>
        <button 
          class="nav-item"
          :class="{ active: activeSection === 'transactions' }"
          @click="handleNavigation('transactions')"
        >
          <span class="icon">📝</span>
          Transactions
        </button>
        <button 
          class="nav-item"
          :class="{ active: activeSection === 'budgets' }"
          @click="handleNavigation('budgets')"
        >
          <span class="icon">💰</span>
          Budgets
        </button>
      </nav>
    </div>

    <div class="sidebar-bottom">
      <div class="user-info">
        <div class="user-avatar">👤</div>
        <span class="user-email" :title="auth.user?.email">{{ auth.user?.email }}</span>
      </div>
      <button class="sign-out-button" @click="emit('sign-out')">
        <span>🚪</span>
        Sign Out
      </button>
    </div>
  </aside>
</template>