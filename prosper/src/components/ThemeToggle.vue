<script setup lang="ts">
import { useThemeStore } from '@/stores/theme'

const themeStore = useThemeStore()
</script>

<template>
  <button 
    @click="themeStore.toggleTheme"
    class="theme-toggle"
    :title="themeStore.isDark ? 'Switch to light mode' : 'Switch to dark mode'"
  >
    <svg v-if="themeStore.isDark" xmlns="http://www.w3.org/2000/svg" class="icon" viewBox="0 0 24 24">
      <path d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1 -8.313 -12.454z" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
    </svg>
    <svg v-else xmlns="http://www.w3.org/2000/svg" class="icon" viewBox="0 0 24 24">
      <path d="M12 12m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
      <path d="M3 12h1m8 -9v1m8 8h1m-9 8v1m-6.4 -15.4l.7 .7m12.1 -.7l-.7 .7m0 11.4l.7 .7m-12.1 -.7l-.7 .7" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
    </svg>
  </button>
</template>

<style scoped>
.theme-toggle {
  position: fixed;
  top: 1rem;
  right: 1rem;
  padding: 0.5rem;
  border-radius: 50%;
  background: transparent;
  border: none;
  cursor: pointer;
  color: var(--text-primary);
  transition: all 0.3s ease;
}

.theme-toggle:hover {
  background: var(--bg-hover);
}

.icon {
  width: 24px;
  height: 24px;
}
</style> 