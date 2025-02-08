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
      <div class="logo">
        <img src="../assets/prosper.png" alt="Prosper logo" class="logo-img">
        <span>prosper</span>
      </div>

      <nav class="main-nav">
        <button 
          class="nav-item"
          :class="{ active: activeSection === 'dashboard' }"
          @click="handleNavigation('dashboard')"
        >
          <span class="icon">
            <font-awesome-icon icon="chart-line" />
          </span>
          Dashboard
        </button>
        <button 
          class="nav-item"
          :class="{ active: activeSection === 'transactions' }"
          @click="handleNavigation('transactions')"
        >
          <span class="icon">
            <font-awesome-icon icon="receipt" />
          </span>
          Transactions
        </button>
        <button 
          class="nav-item"
          :class="{ active: activeSection === 'budgets' }"
          @click="handleNavigation('budgets')"
        >
          <span class="icon">
            <font-awesome-icon icon="wallet" />
          </span>
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

<style scoped>
.logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
}

.logo-img {
  width: 24px;
  height: 24px;
  object-fit: contain;
}

.icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.5em;
}
</style>