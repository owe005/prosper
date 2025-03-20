import { defineStore } from 'pinia'

export const useThemeStore = defineStore('theme', () => {
  // Always return true for isDark
  const isDark = true

  // Initialize theme on page load
  function initTheme() {
    document.documentElement.classList.add('dark')
  }

  return {
    isDark,
    initTheme
  }
}) 