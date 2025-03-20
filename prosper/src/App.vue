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
  await new Promise((resolve) => setTimeout(resolve, Math.random() * 400 + 100))
  next()
})

router.afterEach(() => {
  isLoading.value = false
})
</script>

<template>
  <div class="app-container">
    <div class="gradient-bg"></div>
    <LoadingSpinner v-if="isLoading" />
    <div class="app-layout" :class="{ 'auth-layout': !auth.user }">
      <Sidebar v-if="auth.user" @sign-out="handleSignOut" />
      <main :class="{ 'main-content': auth.user }">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<style>
.app-container {
  min-height: 100vh;
  position: relative;
  overflow: hidden;
}

.gradient-bg {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at 0% 0%, rgba(99, 102, 241, 0.08) 0%, transparent 50%),
    radial-gradient(circle at 100% 0%, rgba(79, 70, 229, 0.05) 0%, transparent 50%),
    radial-gradient(circle at 100% 100%, rgba(99, 102, 241, 0.08) 0%, transparent 50%),
    radial-gradient(circle at 0% 100%, rgba(79, 70, 229, 0.05) 0%, transparent 50%),
    linear-gradient(180deg, var(--bg-secondary) 0%, #18181b 100%);
  z-index: -1;
  animation: gradientShift 20s ease-in-out infinite alternate;
}

@keyframes gradientShift {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}

.app-layout {
  display: flex;
  min-height: 100vh;
  position: relative;
  backdrop-filter: blur(100px);
  -webkit-backdrop-filter: blur(100px);
}

.auth-layout {
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
}

.main-content {
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
  position: relative;
  z-index: 1;
}

/* Dark mode enhancements */
:root.dark .gradient-bg {
  background: radial-gradient(circle at 0% 0%, rgba(4, 44, 13, 0.219) 0%, transparent 50%),
    radial-gradient(circle at 100% 0%, rgba(0, 255, 170, 0.15) 0%, transparent 50%),
    radial-gradient(circle at 100% 100%, rgba(0, 255, 60, 0.2) 0%, transparent 50%),
    radial-gradient(circle at 0% 100%, rgb(0, 0, 0) 0%, transparent 50%),
    linear-gradient(180deg, #1a1a1a 0%, #0a0a0a 100%);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .main-content {
    padding: 1rem;
  }

  .gradient-bg {
    animation: none; /* Disable animation on mobile for better performance */
  }
}
</style>
