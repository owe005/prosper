<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
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

// Register the components with Chart.js
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

// Create a ref for the chart so we can update it later
const chartRef = ref<any>(null)

// Compute the chart data: sort transactions by date and compute a running balance
const chartData = computed(() => {
  const sortedTransactions = [...props.transactions].sort(
    (a, b) =>
      new Date(a.date).getTime() - new Date(b.date).getTime()
  )

  let balance = 0
  const data = sortedTransactions.map(tx => {
    balance += tx.amount
    return {
      x: new Date(tx.date).getTime(),
      y: balance
    }
  })

  return {
    datasets: [
      {
        label: 'Net Worth',
        data,
        // Set the line color; the gradient will be set on mounted
        borderColor: '#10B981',
        // Provide a placeholder fill that will be replaced with a gradient
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointRadius: 0,      // hide points for a cleaner look
        pointHoverRadius: 4
      }
    ]
  }
})

// Configure options for a minimal, clean look
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
    },
    tooltip: {
      mode: 'index' as const,
      intersect: false,
      callbacks: {
        label: (context: any) => {
          const amount = context.parsed.y.toLocaleString('nb-NO', {
            style: 'currency',
            currency: 'NOK',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
          })
          return amount
        }
      }
    }
  },
  scales: {
    x: {
      type: 'time' as const,
      display: true,
      grid: { display: false }, // remove grid lines on x-axis
      ticks: { color: '#9CA3AF' }
    },
    y: {
      display: true,
      grid: { display: false }, // remove grid lines on y-axis
      ticks: { 
        color: '#9CA3AF',
        callback: function(tickValue: number | string) {
          const value = Number(tickValue)
          return value.toLocaleString('nb-NO', {
            style: 'currency',
            currency: 'NOK',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
          })
        }
      }
    }
  }
}

// Once the component is mounted, create a vertical gradient fill
onMounted(() => {
  // Access the chart instance via the ref.
  // Note: How you access the internal Chart.js instance may differ based on your version.
  const chart = chartRef.value?.chartInstance || chartRef.value?.$data?._chart
  if (chart) {
    const ctx = chart.ctx
    const gradient = ctx.createLinearGradient(0, 0, 0, chart.height)
    // Define a gradient that starts more opaque at the top and fades to transparent
    gradient.addColorStop(0, 'rgba(16, 185, 129, 0.4)')
    gradient.addColorStop(1, 'rgba(16, 185, 129, 0)')
    chart.data.datasets[0].backgroundColor = gradient
    chart.update()
  }
})
</script>

<template>
  <div class="networth-chart">
    <h2>Net Worth Over Time</h2>
    <div class="chart-container">
      <!-- Bind the ref so we can access the chart instance -->
      <Line ref="chartRef" :data="chartData" :options="options" />
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
