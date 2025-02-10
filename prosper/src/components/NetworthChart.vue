<template>
  <div class="networth-chart">
    <div class="chart-header">
      <h2 class="chart-title">Net Worth Over Time</h2>
      <div class="chart-balance" v-if="processedData.length">
        {{ formatNOK(processedData[processedData.length - 1].balance) }}
      </div>
    </div>
    <div class="chart-container" ref="containerRef"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import * as d3 from 'd3'
import { useThemeStore } from '@/stores/theme'

interface Transaction {
  amount: number
  date: string
  type: 'income' | 'expense'
}

const props = defineProps<{
  transactions: Transaction[]
  initialBalance: number
}>()

const themeStore = useThemeStore()

// Currency formatter
const formatNOK = (value: number, _index?: number) => {
  return new Intl.NumberFormat('nb-NO', {
    style: 'currency',
    currency: 'NOK',
  }).format(value)
}

// Process transactions into cumulative net worth data
// We sort by date and add an initial point with the initial balance.
const processedData = computed(() => {
  if (!props.transactions?.length) return []
  const sortedTransactions = [...props.transactions].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  )
  let balance = props.initialBalance || 0
  const data: { date: Date; balance: number }[] = []
  // Start at the date of the first transaction
  data.push({ date: new Date(sortedTransactions[0].date), balance })
  sortedTransactions.forEach((transaction) => {
    const amount =
      transaction.type === 'expense' ? -Math.abs(transaction.amount) : Math.abs(transaction.amount)
    balance += amount
    data.push({ date: new Date(transaction.date), balance })
  })
  return data
})

// Reference to our chart container element
const containerRef = ref<HTMLDivElement | null>(null)

// The drawChart function sets up the SVG, scales, gradient, axes, line, area fill, and tooltip.
const drawChart = () => {
  if (!containerRef.value) return

  // Clear any previous chart and tooltip
  d3.select(containerRef.value).select('svg').remove()
  d3.select(containerRef.value).select('.tooltip').remove()

  // Define margins and dimensions
  const margin = { top: 20, right: 30, bottom: 50, left: 80 }
  const containerWidth = containerRef.value.clientWidth
  const width = containerWidth - margin.left - margin.right
  const height = 400 - margin.top - margin.bottom

  // Create the main SVG element with responsive viewBox
  const svg = d3
    .select(containerRef.value)
    .append('svg')
    .attr('width', containerWidth)
    .attr('height', height + margin.top + margin.bottom)
    .attr('viewBox', `0 0 ${containerWidth} ${height + margin.top + margin.bottom}`)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`)

  // Get the processed data
  const data = processedData.value
  if (data.length === 0) return

  // Set up scales
  const xExtent = d3.extent(data.map((d) => new Date(d.date))) as [Date, Date]
  const xScale = d3.scaleTime().domain(xExtent).range([0, width])

  const yMin = d3.min(data, (d) => d.balance) || 0
  const yMax = d3.max(data, (d) => d.balance) || 0
  // Add a little padding
  const yPadding = (yMax - yMin) * 0.1
  const yScale = d3
    .scaleLinear()
    .domain([yMin - yPadding, yMax + yPadding])
    .range([height, 0])

  // Append a gradient definition for the area fill
  const gradientId = 'line-gradient'
  const defs = svg.append('defs')
  const gradient = defs
    .append('linearGradient')
    .attr('id', gradientId)
    .attr('x1', '0%')
    .attr('y1', '0%')
    .attr('x2', '0%')
    .attr('y2', '100%')
  if (themeStore.isDark) {
    gradient.append('stop').attr('offset', '0%').attr('stop-color', 'rgba(16, 185, 129, 0.4)')
    gradient.append('stop').attr('offset', '100%').attr('stop-color', 'rgba(16, 185, 129, 0.05)')
  } else {
    gradient.append('stop').attr('offset', '0%').attr('stop-color', 'rgba(16, 185, 129, 0.3)')
    gradient.append('stop').attr('offset', '100%').attr('stop-color', 'rgba(16, 185, 129, 0.05)')
  }

  // Create an area generator for the filled area under the line
  const area = d3
    .area<{ date: Date; balance: number }>()
    .x((d) => xScale(d.date))
    .y0(height)
    .y1((d) => yScale(d.balance))
    .curve(d3.curveMonotoneX)

  svg.append('path').datum(data).attr('fill', `url(#${gradientId})`).attr('d', area)

  // Create a line generator
  const line = d3
    .line<{ date: Date; balance: number }>()
    .x((d) => xScale(d.date))
    .y((d) => yScale(d.balance))
    .curve(d3.curveMonotoneX)

  svg
    .append('path')
    .datum(data)
    .attr('fill', 'none')
    .attr('stroke', 'rgb(16, 185, 129)')
    .attr('stroke-width', 3)
    .attr('d', line)

  // Create X and Y axes with styled ticks
  const xAxis = d3
    .axisBottom(xScale)
    .ticks(5)
    .tickFormat((domainValue: d3.NumberValue | Date) => {
      if (domainValue instanceof Date) {
        // Show day and month for more granular view
        return d3.timeFormat('%d %b')(domainValue)
      }
      return ''
    })

  // Add grid lines
  svg
    .append('g')
    .attr('class', 'grid')
    .attr('opacity', 0.1)
    .call(
      d3
        .axisLeft(yScale)
        .ticks(6)
        .tickSize(-width)
        .tickFormat(() => ''),
    )

  // Add some debugging to check the date range
  console.log('Date range:', {
    start: xExtent[0],
    end: xExtent[1],
    numberOfDataPoints: data.length
  })

  // Add x-axis with explicit styling
  const xAxisGroup = svg
    .append('g')
    .attr('class', 'x-axis')
    .attr('transform', `translate(0, ${height})`)
    .call(xAxis)

  // Style x-axis line and ticks
  xAxisGroup
    .select('.domain') // This is the axis line
    .attr('stroke', themeStore.isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)')
    .attr('stroke-width', 1)

  xAxisGroup
    .selectAll('.tick line') // These are the tick marks
    .attr('stroke', themeStore.isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)')
    .attr('stroke-width', 1)

  xAxisGroup
    .selectAll('text') // These are the tick labels
    .attr('fill', themeStore.isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)')
    .attr('font-size', '12px')
    .attr('dy', '1em') // Move text down
    .attr('transform', 'rotate(-45)') // Rotate text for better readability
    .style('text-anchor', 'end') // Align text end with tick

  const yAxis = d3
    .axisLeft(yScale)
    .ticks(6)
    .tickFormat((d) => formatNOK(Number(d)))

  svg
    .append('g')
    .attr('class', 'y-axis')
    .call(yAxis)
    .selectAll('text')
    .attr('fill', themeStore.isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)')
    .attr('font-size', '12px')
    .attr('x', -10)

  // Append an overlay rectangle to capture mouse events for the tooltip.
  svg
    .append('rect')
    .attr('width', width)
    .attr('height', height)
    .attr('fill', 'none')
    .attr('pointer-events', 'all')
    .on('mousemove', function (event: MouseEvent) {
      const [mouseX] = d3.pointer(event)
      // Invert the mouse x-coordinate to get the corresponding date
      const x0 = xScale.invert(mouseX)
      const bisectDate = d3.bisector((d: { date: Date }) => d.date).left
      const index = bisectDate(data, x0)
      const d0 = data[index - 1]
      const d1 = data[index]
      let dClosest = d0
      if (d1 && x0.getTime() - d0.date.getTime() > d1.date.getTime() - x0.getTime()) {
        dClosest = d1
      }
      // Position the tooltip relative to the container
      tooltip
        .style('opacity', 1)
        .html(
          `<strong>Net Worth:</strong> ${formatNOK(
            dClosest.balance,
          )}<br/><strong>Date:</strong> ${d3.timeFormat('%b %d, %Y')(dClosest.date)}`,
        )
        .style('left', `${d3.pointer(event, containerRef.value)[0] + 10}px`)
        .style('top', `${d3.pointer(event, containerRef.value)[1] - 28}px`)
    })
    .on('mouseout', function () {
      tooltip.style('opacity', 0)
    })

  // Create a tooltip element
  const tooltip = d3
    .select(containerRef.value)
    .append('div')
    .attr('class', 'tooltip')
    .style('position', 'absolute')
    .style('background', themeStore.isDark ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.8)')
    .style('color', themeStore.isDark ? '#fff' : '#000')
    .style('padding', '8px 12px')
    .style('border-radius', '8px')
    .style('pointer-events', 'none')
    .style('opacity', 0)
    .style('font-size', '12px')
}

onMounted(() => {
  drawChart()
})

// Redraw the chart when the data or theme changes.
watch([processedData, () => themeStore.isDark], () => {
  drawChart()
})
</script>

<style scoped>
.networth-chart {
  background: var(--bg-primary);
  border-radius: 16px;
  padding: 1.5rem;
  height: 100%;
  display: flex;
  flex-direction: column;
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.chart-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
  background: linear-gradient(to right, var(--text-primary), var(--text-secondary));
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.chart-balance {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--primary);
  padding: 0.5rem 1rem;
  background: var(--bg-secondary);
  border-radius: 8px;
  transition: all 0.2s ease;
}

.chart-balance:hover {
  transform: translateY(-2px);
  box-shadow: var(--card-shadow);
}

.chart-container {
  flex: 1;
  min-height: 400px;
  border-radius: 12px;
  background: var(--bg-secondary);
  padding: 1rem;
  position: relative;
  overflow: hidden;
}

/* D3 Chart Styles */
:deep(.grid line) {
  stroke: var(--border-color);
  stroke-opacity: 0.1;
  shape-rendering: crispEdges;
}

:deep(.grid path) {
  stroke-width: 0;
}

:deep(.domain) {
  stroke: var(--border-color);
  stroke-width: 1;
}

:deep(.tick line) {
  stroke: var(--border-color);
}

:deep(.tick text) {
  fill: var(--text-secondary);
  font-size: 12px;
}

/* Tooltip Styles */
:deep(.tooltip) {
  position: absolute;
  padding: 0.75rem 1rem;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  pointer-events: none;
  font-size: 0.875rem;
  color: var(--text-primary);
  box-shadow: var(--card-shadow);
  z-index: 10;
  transition: all 0.1s ease;
}

:deep(.tooltip-date) {
  font-weight: 500;
  margin-bottom: 0.25rem;
  color: var(--text-secondary);
}

:deep(.tooltip-value) {
  font-weight: 600;
  color: var(--primary);
}

/* Responsive Styles */
@media (max-width: 768px) {
  .networth-chart {
    padding: 1rem;
  }

  .chart-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .chart-title {
    font-size: 1.25rem;
  }

  .chart-balance {
    font-size: 1rem;
    align-self: flex-end;
  }

  .chart-container {
    min-height: 300px;
  }
}
</style>
