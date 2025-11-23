import React from 'react'
import NavBar from '../components/NavBar'
import AnalyticsPage from './AnalyticsPage'

export default function AnalyticsPageWrapper({ history, connected=false, backendUrl='http://localhost:3001' }) {
  return (
    <div>
      <NavBar />
      <div className="app">
        <AnalyticsPage history={history} connected={connected} backendUrl={backendUrl} />
      </div>
    </div>
  )
}
