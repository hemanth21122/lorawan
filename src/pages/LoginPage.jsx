import React, { useState, useContext } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { AuthContext } from '../auth/AuthContext'

// Login page accepts username or email. If username 'saihemanth21' is provided
// it will map to the test email used in the backend (saihemanth2112@gmail.com)
export default function LoginPage({ backendUrl = 'http://localhost:3001' }) {
  const [username, setUsername] = useState('saihemanth21')
  const [password, setPassword] = useState('hemanth')
  const [error, setError] = useState(null)
  const { login } = useContext(AuthContext)
  const navigate = useNavigate()

  // ensure a selected backend is persisted so AuthContext/resolved backend use same URL
  React.useEffect(() => {
    try { localStorage.setItem('backendUrl', backendUrl) } catch (e) { /* ignore */ }
  }, [backendUrl])

  const submit = async (e) => {
    e.preventDefault()
    setError(null) // Clear any previous errors
    try {
      // map username to email if needed
      let email = username
      if (!username.includes('@')) {
        // Handle the special case first
        if (username === 'saihemanth21') {
          email = 'saihemanth2112@gmail.com'
        } else {
          // For other usernames, try to find their email in registration
          try {
            // First try the direct username@gmail.com mapping
            const checkRes = await axios.post(`${backendUrl}/api/auth/check-username`, { username })
            email = checkRes.data.email
          } catch (err) {
            // If username lookup fails, use username@gmail.com as fallback
            email = username + '@gmail.com'
          }
        }
      }
      
      console.log('Attempting login with:', { email, password: '***' })
      await login(email, password)
      navigate('/')
    } catch (err) {
      console.error('Login error:', err.response?.data || err.message)
      setError(
        err.response?.data?.error || 
        'Login failed. Please check your username/email and password.'
      )
    }
  }

  return (
    <div className="auth-page">
      <form className="auth-form" onSubmit={submit}>
        <h2>Login</h2>
        {error && <div className="error">{error}</div>}
        <label>Username or Email</label>
        <input value={username} onChange={e=>setUsername(e.target.value)} required />
        <label>Password</label>
        <input type="password" value={password} onChange={e=>setPassword(e.target.value)} required />
        <button type="submit" className="primary">Sign in</button>
        <div className="small">No account? <Link to="/register">Register</Link></div>
      </form>
    </div>
  )
}
