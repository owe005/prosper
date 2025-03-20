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
  <nav class="sidebar">
    <div class="logo">
      <img src="@/assets/logo.svg" alt="Prosper Logo" class="logo-img" />
      <span class="logo-text">Prosper</span>
    </div>
    <div class="nav-links">
      <router-link to="/" class="nav-link" active-class="active">
        <i class="fas fa-chart-line icon"></i>
        <span>Dashboard</span>
      </router-link>
      <router-link to="/transactions" class="nav-link" active-class="active">
        <i class="fas fa-exchange-alt icon"></i>
        <span>Transactions</span>
      </router-link>
      <router-link to="/categories" class="nav-link" active-class="active">
        <i class="fas fa-tags icon"></i>
        <span>Categories</span>
      </router-link>
      <router-link to="/settings" class="nav-link" active-class="active">
        <i class="fas fa-cog icon"></i>
        <span>Settings</span>
      </router-link>
    </div>
  </nav>
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