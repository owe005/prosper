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

<style>
@import '@/assets/main.css';

#app {
  width: 100vw;
  height: 100vh;
  margin: 0;
  padding: 0;
  overflow-x: hidden;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.app-layout {
  display: flex;
  min-height: 100vh;
}

.main-content {
  flex: 1;
  margin-left: 300px;
  min-height: 100vh;
  background: var(--bg-secondary);
}
</style>
