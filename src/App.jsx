import React, { useEffect, useState, useRef } from 'react'
import axios from 'axios'
import ForecastChart from './components/ForecastChart'
import NodeSelector from './components/NodeSelector'
import StatCard from './components/StatCard'
import ChartsSection from './components/ChartsSection'
import { Routes, Route, useNavigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import AnalyticsPageWrapper from './pages/AnalyticsPageWrapper'
import { useContext } from 'react'
import { AuthContext } from './auth/AuthContext'

const DEFAULT_BACKEND = 'http://localhost:3001'

export default function App() {
  const [backendUrl, setBackendUrl] = useState(DEFAULT_BACKEND)
  const [latest, setLatest] = useState(null)
  const [history, setHistory] = useState([])
  const [nodes, setNodes] = useState([])
  const [selectedNode, setSelectedNode] = useState('All Nodes')
  const [connected, setConnected] = useState(false)
  const tokenRef = useRef(null)

  useEffect(() => {
    async function initAuth() {
      try {
        const res = await axios.post(`${backendUrl}/api/auth/login`, {
          email: 'saihemanth2112@gmail.com',
          password: 'hemanth'
        })
        tokenRef.current = res.data.token
      } catch (e) {
        tokenRef.current = null
      }
    }
    initAuth()
  }, [backendUrl])

  useEffect(() => {
    let mounted = true

    const headers = () => tokenRef.current ? { Authorization: `Bearer ${tokenRef.current}` } : {}

    async function fetchCurrent() {
      try {
        const res = await axios.get(`${backendUrl}/api/sensors/current`, { headers: headers() })
        if (!mounted) return
        setLatest(res.data)
        setConnected(true)
      } catch (err) {
        setConnected(false)
        console.error('Fetch current error', err.message)
      }
    }

    async function fetchHistory() {
      try {
        const res = await axios.get(`${backendUrl}/api/sensors/history`, { headers: headers() })
        if (!mounted) return
        const data = res.data.data || []
        setHistory(data.reverse()) // oldest -> newest
        const nodeSet = new Set(data.map(d => d.node_id))
        setNodes(['All Nodes', ...Array.from(nodeSet).sort((a,b)=>a-b).map(n=>`Node ${n}`)])
      } catch (err) {
        console.error('Fetch history error', err.message)
      }
    }

    fetchCurrent()
    fetchHistory()

    const currentInterval = setInterval(fetchCurrent, 2000)
    const historyInterval = setInterval(fetchHistory, 5000)

    return () => { mounted = false; clearInterval(currentInterval); clearInterval(historyInterval) }
  }, [backendUrl])

  // derive per-node latest stats
  const nodeStats = React.useMemo(() => {
    const grouped = {}
    for (const r of history) {
      const key = r.node_id || 1
      grouped[key] = grouped[key] || []
      grouped[key].push(r)
    }
    const stats = Object.keys(grouped).map(k => {
      const arr = grouped[k]
      const last = arr[arr.length-1]
      return {
        node_id: Number(k),
        temperature: last ? last.temperature : 0,
        soilMoisture: last ? last.soilMoisture : 0,
        lastUpdate: last ? last.timestamp : null
      }
    })
    return stats.sort((a,b)=>a.node_id-b.node_id)
  }, [history])

  const filteredStats = selectedNode === 'All Nodes' ? nodeStats : nodeStats.filter(s => `Node ${s.node_id}` === selectedNode)

  const { token, logout } = useContext(AuthContext)
  const navigate = useNavigate()

  useEffect(() => {
    if (!token) navigate('/login')
  }, [token])

  return (
    <Routes>
      <Route path="/login" element={<LoginPage backendUrl={backendUrl} />} />
      <Route path="/register" element={<RegisterPage backendUrl={backendUrl} />} />
      <Route path="/analytics" element={<AnalyticsPageWrapper history={history} connected={connected} backendUrl={backendUrl} />} />
      <Route path="/" element={<DashboardPage
        backendUrl={backendUrl}
        setBackendUrl={setBackendUrl}
        connected={connected}
        nodeStats={filteredStats}
        nodes={nodes}
        selectedNode={selectedNode}
        setSelectedNode={setSelectedNode}
        history={history}
      />} />
    </Routes>
  )
}
