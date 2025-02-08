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
        <span class="user-email">{{ auth.user?.email }}</span>
      </div>
      <button class="sign-out-button" @click="emit('sign-out')">
        Sign Out
      </button>
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  width: 300px;
  height: 100vh;
  background: var(--bg-primary);
  border-right: 1px solid var(--border-color);
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  position: fixed;
  left: 0;
  top: 0;
}

.logo {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
  padding: 0.5rem;
}

.search-bar {
  padding: 0 0.5rem;
}

.search-input {
  width: 100%;
  padding: 0.5rem;
  border-radius: 6px;
  border: 1px solid var(--border-color);
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 0.9rem;
}

.search-input::placeholder {
  color: var(--text-secondary);
}

.main-nav {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0 0.5rem;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem;
  border-radius: 6px;
  background: transparent;
  border: none;
  color: var(--text-primary);
  cursor: pointer;
  font-size: 0.9rem;
  text-align: left;
  width: 100%;
}

.nav-item:hover {
  background: var(--bg-hover);
}

.nav-item.active {
  background: var(--bg-hover);
  font-weight: 500;
}

.accounts-section {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 0 0.5rem;
}

.account-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.account-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  border-radius: 6px;
  cursor: pointer;
}

.account-header:hover {
  background: var(--bg-hover);
}

.account-type {
  font-weight: 500;
  color: var(--text-primary);
}

.account-total {
  text-align: right;
}

.account-items {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding-left: 1rem;
}

.account-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  border-radius: 6px;
  cursor: pointer;
}

.account-item:hover {
  background: var(--bg-hover);
}

.item-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.item-name {
  font-size: 0.9rem;
  color: var(--text-primary);
}

.item-number {
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.item-balance {
  text-align: right;
}

.amount {
  font-size: 0.9rem;
  color: var(--text-primary);
  font-weight: 500;
}

.change {
  font-size: 0.8rem;
}

.change.positive {
  color: var(--success);
}

.change.negative {
  color: var(--danger);
}

.sidebar-bottom {
  flex: none;
  padding: 1rem 0.5rem;
  border-top: 1px solid var(--border-color);
  margin-top: auto;
}

.user-info {
  margin-bottom: 1rem;
  padding: 0 0.5rem;
}

.user-email {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.sign-out-button {
  width: 100%;
  padding: 0.75rem;
  background: transparent;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  color: var(--danger);
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.sign-out-button:hover {
  background: var(--bg-hover);
  border-color: var(--danger);
}
</style> 