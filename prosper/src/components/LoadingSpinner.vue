<template>
  <div class="loading-container">
    <span class="loader"></span>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.loading-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(0, 0, 0, 0.5);
  z-index: 9999;
}

.loader {
  width: 8px;
  height: 8px;
  position: relative;
  border-radius: 50%;
  background: #10B981; /* Tailwind green-500 color */
  animation: wave 1s ease-in infinite;
}

@keyframes wave {
  0% {
    box-shadow:
      0 0 0 0px rgba(16, 185, 129, 1),
      0 0 0 20px rgba(16, 185, 129, 0.2),
      0 0 0 40px rgba(16, 185, 129, 0.6),
      0 0 0 60px rgba(16, 185, 129, 0.4),
      0 0 0 80px rgba(16, 185, 129, 0.2);
  }
  100% {
    box-shadow:
      0 0 0 80px rgba(16, 185, 129, 0),
      0 0 0 60px rgba(16, 185, 129, 0.2),
      0 0 0 40px rgba(16, 185, 129, 0.4),
      0 0 0 20px rgba(16, 185, 129, 0.6),
      0 0 0 0px rgba(16, 185, 129, 1);
  }
}
</style> 