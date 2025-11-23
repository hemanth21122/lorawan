import React, { useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthContext } from '../auth/AuthContext'

export default function NavBar() {
  const { user, logout } = useContext(AuthContext)
  const navigate = useNavigate()

  const doLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="navbar">
      <div className="nav-left">
        <Link to="/">Dashboard</Link>
        <Link to="/analytics">Analytics</Link>
      </div>
      <div className="nav-right">
        <span className="user">{user?.fullName || 'User'}</span>
        <button className="btn-ghost" onClick={doLogout}>Logout</button>
      </div>
    </nav>
  )
}
