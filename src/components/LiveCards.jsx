import React from 'react'

export default function LiveCards({ latest }) {
  if (!latest) return <div className="cards">Loading live data...</div>

  return (
    <div className="data-grid">
      <div className="data-item">
        <div className="data-label">Temperature</div>
        <div className="data-value temperature-value">{latest.temperature} °C</div>
      </div>
      <div className="data-item">
        <div className="data-label">Soil Moisture</div>
        <div className="data-value moisture-value">{latest.soilMoisture} %</div>
      </div>
    </div>
  )
}
