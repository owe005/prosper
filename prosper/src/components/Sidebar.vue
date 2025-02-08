<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'

const emit = defineEmits(['sign-out'])
const auth = useAuthStore()

// TODO: Move to store
const accounts = [
  {
    type: 'Cash',
    total: 48534,
    change: -3.11,
    items: [
      { name: 'Bank of America', balance: 32126.00, accountNumber: '3432', change: 1.3 },
      { name: 'Chase Savings', balance: 16408.00, accountNumber: '3432', change: -4.41 },
      { name: 'Cash in hand', balance: 4000.00, change: 0 }
    ]
  },
  {
    type: 'Investments',
    total: 1120448,
    change: 2.44,
    items: []
  },
  {
    type: 'Crypto',
    total: 190771,
    change: 3.18,
    items: []
  },
  {
    type: 'Real estate',
    total: 1320448,
    change: 1.3,
    items: []
  },
  {
    type: 'Credit Cards',
    total: 15991,
    change: -0.2,
    items: []
  }
]

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

const activeSection = ref('Dashboard')
</script>

<template>
  <aside class="sidebar">
    <div class="sidebar-top">
      <div class="logo">prosper</div>
      
      <div class="search-bar">
        <input 
          type="text" 
          placeholder="Search or jump to"
          class="search-input"
        >
      </div>

      <nav class="main-nav">
        <button 
          class="nav-item"
          :class="{ active: activeSection === 'Dashboard' }"
          @click="activeSection = 'Dashboard'"
        >
          <span class="icon">📊</span>
          Dashboard
        </button>
        <button 
          class="nav-item"
          :class="{ active: activeSection === 'Transactions' }"
          @click="activeSection = 'Transactions'"
        >
          <span class="icon">📝</span>
          Transactions
        </button>
      </nav>
    </div>

    <div class="accounts-section">
      <div v-for="account in accounts" :key="account.type" class="account-group">
        <div class="account-header">
          <div class="account-type">{{ account.type }}</div>
          <div class="account-total">
            <div class="amount">{{ formatCurrency(account.total) }}</div>
            <div 
              class="change"
              :class="{ 
                'positive': account.change > 0,
                'negative': account.change < 0 
              }"
            >
              {{ account.change > 0 ? '+' : '' }}{{ account.change }}%
            </div>
          </div>
        </div>
        
        <div v-if="account.items.length > 0" class="account-items">
          <div v-for="item in account.items" :key="item.name" class="account-item">
            <div class="item-info">
              <div class="item-name">{{ item.name }}</div>
              <div v-if="item.accountNumber" class="item-number">
                •••• {{ item.accountNumber }}
              </div>
            </div>
            <div class="item-balance">
              <div class="amount">{{ formatCurrency(item.balance) }}</div>
              <div 
                class="change"
                :class="{ 
                  'positive': item.change > 0,
                  'negative': item.change < 0 
                }"
              >
                {{ item.change > 0 ? '+' : '' }}{{ item.change }}%
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="sidebar-bottom">
      <div class="user-info">
        <div class="user-avatar">👤</div>
        <span class="user-email" :title="auth.user?.email">{{ auth.user?.email }}</span>
      </div>
      <button class="sign-out-button" @click="emit('sign-out')">
        <span>🚪</span>
        Sign Out
      </button>
    </div>
  </aside>
</template>