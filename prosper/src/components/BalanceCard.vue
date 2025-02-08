<script setup lang="ts">
// TODO: Replace with actual data from store
const balance = 5000
const currency = '$'
</script>

<template>
  <div class="balance-card">
    <h2>Current Balance</h2>
    <div class="balance">
      <span class="currency">{{ currency }}</span>
      <span class="amount">{{ balance.toLocaleString() }}</span>
    </div>
  </div>
</template>
