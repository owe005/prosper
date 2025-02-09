<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import Sidebar from '@/components/Sidebar.vue'
import { useThemeStore } from '@/stores/theme'
import { useAuthStore } from '@/stores/auth'
import LoadingSpinner from './components/LoadingSpinner.vue'

const themeStore = useThemeStore()
const auth = useAuthStore()
const router = useRouter()

const isLoading = ref(false)

onMounted(() => {
  themeStore.initTheme()
})

async function handleSignOut() {
  await auth.signOut()
  router.push('/login')
}

// Add navigation guards for loading state
router.beforeEach(async (to, from, next) => {
  isLoading.value = true
  // Add artificial delay between 0.1 and 0.5 seconds
  await new Promise(resolve => setTimeout(resolve, Math.random() * 400 + 100))
  next()
})

router.afterEach(() => {
  isLoading.value = false
})
</script>

<template>
  <LoadingSpinner v-if="isLoading" />
  <div class="app-layout">
    <template v-if="auth.user">
      <Sidebar @sign-out="handleSignOut" />
      <main class="main-content">
        <RouterView />
      </main>
    </template>
    <template v-else>
      <RouterView />
    </template>
  </div>
</template>