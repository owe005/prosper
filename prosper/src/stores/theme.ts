import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useThemeStore = defineStore('theme', () => {
  const isDark = ref(localStorage.getItem('theme') === 'dark')

  // Initialize theme on page load
  function initTheme() {
    if (isDark.value) {
      document.documentElement.classList.add('dark')
    }
  }

  // Toggle theme
  function toggleTheme() {
    isDark.value = !isDark.value
    localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
    document.documentElement.classList.toggle('dark')
  }

  // Watch for system theme changes
  watch(isDark, () => {
    document.documentElement.classList.toggle('dark', isDark.value)
  })

  return {
    isDark,
    toggleTheme,
    initTheme
  }
}) 