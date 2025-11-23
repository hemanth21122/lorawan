import React from 'react'

export default function StatCard({ stat }) {
  return (
    <div className="stat-card">
      <div className="card-header">
        <div className="node">📡 Node {stat.node_id}</div>
        <div className="time">{stat.lastUpdate ? new Date(stat.lastUpdate).toLocaleTimeString() : '—'}</div>
      </div>
      <div className="metrics">
        <div className="metric">
          <div className="label">Temperature</div>
          <div className="value">{stat.temperature}°C</div>
        </div>
        <div className="metric">
          <div className="label">Soil Moisture</div>
          <div className="value">{stat.soilMoisture}%</div>
        </div>
      </div>
    </div>
  )
}
