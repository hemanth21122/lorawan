import React, { useState, useMemo } from 'react'
import ChartsSection from '../components/ChartsSection'
import styles from '../styles/Analytics.module.css'
import NavBar from '../components/NavBar'

export default function AnalyticsPage({ history, connected = false, backendUrl = 'http://localhost:3001' }) {
  const [chartView, setChartView] = useState('all') // 'all', 'temperature', 'moisture'

  // Calculate analytics with trends
  const analytics = useMemo(() => {
    if (!history.length) return {
      total: 0,
      avgTemp: 0,
      avgMoist: 0,
      tempTrend: 0,
      moistTrend: 0
    }

    // Get recent data (last 24 hours)
    const now = new Date()
    const dayAgo = new Date(now - 24 * 60 * 60 * 1000)
    const recent = history.filter(h => new Date(h.timestamp) > dayAgo)
    const older = history.filter(h => new Date(h.timestamp) <= dayAgo && new Date(h.timestamp) > new Date(dayAgo - 24 * 60 * 60 * 1000))

    // Calculate averages
    const calcAvg = (data, field) => data.length ? 
      data.reduce((s,r) => s + Number(r[field] || 0), 0) / data.length : 0

    const recentTempAvg = calcAvg(recent, 'temperature')
    const olderTempAvg = calcAvg(older, 'temperature')
    const recentMoistAvg = calcAvg(recent, 'soilMoisture')
    const olderMoistAvg = calcAvg(older, 'soilMoisture')

    return {
      total: history.length,
      avgTemp: recentTempAvg.toFixed(2),
      avgMoist: recentMoistAvg.toFixed(2),
      tempTrend: ((recentTempAvg - olderTempAvg) / olderTempAvg * 100).toFixed(1),
      moistTrend: ((recentMoistAvg - olderMoistAvg) / olderMoistAvg * 100).toFixed(1)
    }
  }, [history])

  return (
    
    <div className={styles['analytics-page']}>
      <header className={styles.header}>
        <h2>Analytics Dashboard</h2>
      </header>
    
      <section className={styles['analytics-summary']}>
        <div className={styles['stat-card']}>
          <span className={styles['stat-label']}>Total Readings</span>
          <div className={styles['stat-value']}>{analytics.total}</div>
          <div className={styles['stat-trend']}>
            Last 24 hours
          </div>
        </div>

        <div className={styles['stat-card']}>
          <span className={styles['stat-label']}>Average Temperature</span>
          <div className={styles['stat-value']}>{analytics.avgTemp}°C</div>
          <div className={`${styles['stat-trend']} ${Number(analytics.tempTrend) < 0 ? styles['trend-down'] : ''}`}>
            {analytics.tempTrend}% from previous day
          </div>
        </div>

        <div className={styles['stat-card']}>
          <span className={styles['stat-label']}>Average Soil Moisture</span>
          <div className={styles['stat-value']}>{analytics.avgMoist}%</div>
          <div className={`${styles['stat-trend']} ${Number(analytics.moistTrend) < 0 ? styles['trend-down'] : ''}`}>
            {analytics.moistTrend}% from previous day
          </div>
        </div>
      </section>

      <section className={styles['analytics-charts']}>
        <div className={styles['charts-header']}>
          <h3 className={styles['charts-title']}>Sensor Data Analysis</h3>
          <div className={styles['charts-controls']}>
            <button 
              className={`${styles['chart-control-btn']} ${chartView === 'all' ? styles.active : ''}`}
              onClick={() => setChartView('all')}
            >
              All Data
            </button>
            <button 
              className={`${styles['chart-control-btn']} ${chartView === 'temperature' ? styles.active : ''}`}
              onClick={() => setChartView('temperature')}
            >
              Temperature
            </button>
            <button 
              className={`${styles['chart-control-btn']} ${chartView === 'moisture' ? styles.active : ''}`}
              onClick={() => setChartView('moisture')}
            >
              Moisture
            </button>
          </div>
        </div>
        <ChartsSection 
          history={history} 
          selectedNode={'All Nodes'} 
          view={chartView}
        />
      </section>

      <section className={styles['analytics-logs']}>
        <h3>Backend Status</h3>
        {connected ? (
          <div className={styles.console}>
            ✅ Connected to <strong>{backendUrl}</strong>
            <br/>
            System running normally
          </div>
        ) : (
          <pre className={styles.console}>
            ❌ Backend not connected
            
            Run your backend with:
            
            npm run dev
            
            Then set Backend URL in the Dashboard to connect.
          </pre>
        )}
      </section>
    </div>
    
  )
}
