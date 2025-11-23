import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'

export default function RegisterPage({ backendUrl = 'http://localhost:3001' }) {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    try {
      // Call signup but do NOT auto-login. Add a small delay before redirecting.
      await axios.post(`${backendUrl}/api/auth/signup`, { fullName, email, password })
      
      // Add a success message
      setError(null)
      const successDiv = document.createElement('div')
      successDiv.className = 'success'
      successDiv.textContent = 'Registration successful! Redirecting to login...'
      e.target.insertBefore(successDiv, e.target.firstChild)
      
      // Wait for 1.5 seconds to ensure password is hashed
      await new Promise(resolve => setTimeout(resolve, 1500))
      navigate('/login')
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed')
    }
  }

  return (
    <div className="auth-page">
      <form className="auth-form" onSubmit={submit}>
        <h2>Register</h2>
        {error && <div className="error">{error}</div>}
        <label>Full name</label>
        <input value={fullName} onChange={e=>setFullName(e.target.value)} required />
        <label>Email</label>
        <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required />
        <label>Password</label>
        <input type="password" value={password} onChange={e=>setPassword(e.target.value)} required />
        <button type="submit" className="primary">Create account</button>
        <div className="small">Have an account? <Link to="/login">Sign in</Link></div>
      </form>
    </div>
  )
}
