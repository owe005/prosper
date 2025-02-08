<script setup lang="ts">
import { computed } from 'vue'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
} from 'chart.js'
import 'chartjs-adapter-date-fns'
import type { Transaction } from '../types/database.types'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
)

const props = defineProps<{
  transactions: Transaction[]
}>()

const chartData = computed(() => {
  // Sort transactions by date
  const sortedTransactions = [...props.transactions]
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())

  // Calculate running balance for each point
  let balance = 0
  const data = sortedTransactions.map(tx => {
    balance += tx.amount
    return {
      x: new Date(tx.created_at).getTime(),
      y: balance
    }
  })

  return {
    datasets: [
      {
        label: 'Net Worth',
        data,
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointRadius: 2,
        pointHoverRadius: 4
      }
    ]
  }
})

const options = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    intersect: false,
    mode: 'index' as const
  },
  plugins: {
    legend: {
      display: false
    }
  },
  scales: {
    x: {
      type: 'time' as const,
      display: true,
      title: {
        display: false
      }
    },
    y: {
      display: true,
      title: {
        display: false
      }
    }
  }
}
</script>

<template>
  <div class="networth-chart">
    <h2>Net Worth Over Time</h2>
    <div class="chart-container">
      <Line :data="chartData" :options="options" />
    </div>
  </div>
</template>

<style scoped>
.networth-chart {
  background: var(--background-elevated);
  border-radius: 8px;
  padding: 1.5rem;
  margin-top: 2rem;
}

h2 {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: var(--text-primary);
}

.chart-container {
  height: 300px;
  width: 100%;
}
</style> 