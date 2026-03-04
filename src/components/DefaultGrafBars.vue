<template>
  <apexchart
    :ref="chartRef"
    type="candlestick"
    height="1000"
    :options="options"
    :series="data"
  />
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
    data: {
        type: Array,
        required: true
    }
})

const chartRef = ref(null)
const zoomRange = ref(null)

const options = ref({
  chart: {
    type: 'candlestick',
    background: '#000000',     
    toolbar: { show: true },
    animations: {
      enabled: false 
    },
    zoom: { 
      enabled: true, 
      type: 'x',               
      autoScaleYaxis: true,
      zoomedArea: {
        fill: { color: '#90CAF9', opacity: 0.4 },
        stroke: { color: '#0D47A1', opacity: 0.4, width: 1 }
      }
    },
    events: {
      zoomed: (chartContext, { xaxis }) => {
        zoomRange.value = { min: xaxis.min, max: xaxis.max } 
      }
    }
  },
  title: {
    text: 'Simulação Trader',
    align: 'center',
    style: { color: '#FFFFFF' }  
  },
  xaxis: {
    type: 'datetime',
    labels: { style: { colors: '#FFFFFF' } } ,
    
  },
  yaxis: {
    position: 'right',
    tooltip: { enabled: true },
    labels: {
      style: { colors: '#FFFFFF' },
      formatter: val => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
    }
  },
  tooltip: {
    theme: 'dark',
    y: {
      formatter: val => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
    }
  },
  grid: {
    borderColor: '#444444',
  }
})
watch(
  () => props.data,
  async (newVal) => {
    if (chartRef.value) {
  
      await nextTick()
      chartRef.value.updateSeries([{ data: newVal }], false)
       if (zoomRange.value) {
        chartRef.value.zoomX(zoomRange.value.min, zoomRange.value.max)
      }
    }
  },
  { deep: true }
)
</script>