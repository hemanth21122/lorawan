import React, { useMemo } from 'react'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

export default function ChartsSection({ history = [], selectedNode = 'All Nodes' }) {
  const groupedByNode = useMemo(() => {
    // First, group data by node ID
    const nodeGroups = {}
    history.forEach(record => {
      if (!nodeGroups[record.node_id]) {
        nodeGroups[record.node_id] = []
      }
      nodeGroups[record.node_id].push(record)
    })
    return nodeGroups
  }, [history])

  const grouped = useMemo(() => {
    const map = {}
    const nodeIds = Object.keys(groupedByNode)
    
    // If a specific node is selected, only show that node's data
    const relevantNodes = selectedNode === 'All Nodes' ? nodeIds : [selectedNode.replace('Node ', '')]
    
    relevantNodes.forEach(nodeId => {
      groupedByNode[nodeId].forEach(record => {
        const t = new Date(record.timestamp)
        const label = t.toLocaleTimeString()
        if (!map[label]) {
          map[label] = {}
        }
        if (!map[label][nodeId]) {
          map[label][nodeId] = { temp: null, moist: null }
        }
        map[label][nodeId].temp = record.temperature
        map[label][nodeId].moist = record.soilMoisture
      })
    })

    const labels = Object.keys(map).sort()
    return { labels, map, relevantNodes }
  }, [groupedByNode, selectedNode])

  const tempData = {
    labels: grouped.labels,
    datasets: grouped.relevantNodes.map((nodeId, index) => ({
      label: `Node ${nodeId} Temperature (°C)`,
      data: grouped.labels.map(label => grouped.map[label][nodeId]?.temp ?? null),
      borderColor: index === 0 ? '#EF4444' : '#FF9800',
      backgroundColor: index === 0 ? 'rgba(239,68,68,0.1)' : 'rgba(255,152,0,0.1)',
      borderWidth: 2,
      tension: 0.4
    }))
  }

  const moistData = {
    labels: grouped.labels,
    datasets: grouped.relevantNodes.map((nodeId, index) => ({
      label: `Node ${nodeId} Soil Moisture (%)`,
      data: grouped.labels.map(label => grouped.map[label][nodeId]?.moist ?? null),
      borderColor: index === 0 ? '#3B82F6' : '#2563EB',
      backgroundColor: index === 0 ? 'rgba(59,130,246,0.1)' : 'rgba(37,99,235,0.1)',
      borderWidth: 2,
      tension: 0.4
    }))
  }

  const options = {
    responsive: true,
    scales: {
      x: {
        ticks: {
          maxRotation: 45,
          minRotation: 45
        }
      }
    },
    plugins: {
      legend: {
        position: 'top',
        align: 'start',
        labels: {
          boxWidth: 15,
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false
      }
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    }
  }

  return (
    <div className="chart-cards">
      <div className="chart-card">
        <h3>Temperature Over Time</h3>
        <Line data={tempData} options={options} />
      </div>
      <div className="chart-card">
        <h3>Soil Moisture Over Time</h3>
        <Line data={moistData} options={options} />
      </div>
    </div>
  )
}
