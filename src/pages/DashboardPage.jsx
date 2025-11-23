import React, { useEffect, useMemo, useState } from 'react'
import NodeSelector from '../components/NodeSelector'
import StatCard from '../components/StatCard'
import ChartsSection from '../components/ChartsSection'
import ForecastChart from '../components/ForecastChart'
import NavBar from '../components/NavBar'
import '../styles/dashboard.css'


// small ET estimator function (same logic as ForecastChart uses)
function estimateET(temperature, moisture) {
  // placeholder simple physics-like estimator
  return Number((0.08 * Number(temperature || 20) + 0.03 * Number(moisture || 50)).toFixed(3))
}

export default function DashboardPage({ backendUrl, setBackendUrl, connected, nodeStats, nodes, selectedNode, setSelectedNode, history }) {
  // compute average soil moisture across nodes
  const avgMoisture = useMemo(() => {
    if (!nodeStats || nodeStats.length === 0) return 0
    const sum = nodeStats.reduce((s,n)=>s + Number(n.soilMoisture || 0), 0)
    return (sum / nodeStats.length).toFixed(2)
  }, [nodeStats])

  // estimate ET for today using latest averages
  const latestAvgTemp = useMemo(() => {
    if (!nodeStats || nodeStats.length === 0) return 20
    const sum = nodeStats.reduce((s,n)=>s + Number(n.temperature || 0), 0)
    return (sum / nodeStats.length)
  }, [nodeStats])

  const etToday = estimateET(latestAvgTemp, avgMoisture)

  const [forecastTick, setForecastTick] = useState(0)

  useEffect(() => {
    // re-run model every hour (client-side) to update ET predictions
    const id = setInterval(() => {
      setForecastTick(t => t + 1)
      console.log('Hourly forecast refresh')
    }, 1000 * 60 * 60)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="app"  style={{ width: "100vw", maxWidth: "95vw", overflowX: "hidden" }}>
      <NavBar />
      <header className="header">
        <div>
          <h1>🌱 Soil Monitoring Dashboard</h1>
          <div className="subtitle">Real-time soil temperature & moisture</div>
        </div>

        <div className="controls">
          <div className={`connection ${connected? 'connected': connected===false? 'disconnected':'connecting'}`}>
            {connected? 'Connected' : 'Disconnected'}
          </div>
          <div className="server-input">
            <input aria-label="backend-url" value={backendUrl} onChange={e => {
              const v = e.target.value
              setBackendUrl(v)
              try { localStorage.setItem('backendUrl', v) } catch (err) { /* ignore */ }
            }} />
          </div>
        </div>
      </header>

      <main>
        <section className="toolbar">
          <NodeSelector nodes={nodes} selected={selectedNode} onChange={setSelectedNode} />
        </section>

        <section className="stats-grid">
          {nodeStats.length === 0 ? <div className="empty">No node data</div> : nodeStats.map(s => (
            <StatCard key={s.node_id} stat={s} />
          ))}
          <div className="stat-card">
            <div className="card-header"><div>Average Soil Moisture</div></div>
            <div style={{fontSize: '24px', fontWeight:700}}>{avgMoisture} %</div>
          </div>
          <div className="stat-card">
            <div className="card-header"><div>Estimated ET (Today)</div></div>
            <div style={{fontSize: '20px', fontWeight:700}}>{etToday} mm/day</div>
          </div>
          <div className="stat-card">
            <div className="card-header"><div>Estimated ET (10 days)</div></div>
            <div style={{paddingTop:8}}>
              {/* small inline forecast sparkline from ForecastChart could be embedded; reuse component area */}
              <ForecastChart history={history.filter(h => selectedNode==='All Nodes' || `Node ${h.node_id}`===selectedNode)} forecastTick={forecastTick} />
            </div>
          </div>
        </section>

        <section className="charts">
          <ChartsSection history={history} selectedNode={selectedNode} />
        </section>

        <section className="forecast-section">
          <h2>10-day Evapotranspiration Forecast</h2>
          <ForecastChart history={history.filter(h => selectedNode==='All Nodes' || `Node ${h.node_id}`===selectedNode)} forecastTick={forecastTick} />
        </section>
      </main>

      <footer className="footer">Connected to {backendUrl}</footer>
    </div>
  )
}
