<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Sidebar from '@/components/Sidebar.vue'
import { useThemeStore } from '@/stores/theme'
import { useAuthStore } from '@/stores/auth'

const themeStore = useThemeStore()
const auth = useAuthStore()
const router = useRouter()

onMounted(() => {
  themeStore.initTheme()
})

async function handleSignOut() {
  await auth.signOut()
  router.push('/login')
}
</script>

<template>
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