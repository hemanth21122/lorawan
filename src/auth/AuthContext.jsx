import React, { createContext, useState, useEffect } from 'react'
import axios from 'axios'

export const AuthContext = createContext()

export function AuthProvider({ children, backend = null }) {
  // Determine backend URL preference order: explicit prop -> localStorage -> default
  const defaultBackend = 'http://localhost:3001'
  const resolvedBackend = backend || localStorage.getItem('backendUrl') || defaultBackend
  const [token, setToken] = useState(localStorage.getItem('token') || null)
  const [user, setUser] = useState(null)

  useEffect(() => {
    if (token) localStorage.setItem('token', token)
    else localStorage.removeItem('token')
  }, [token])

  useEffect(() => {
    async function fetchUser() {
      if (!token) return
      try {
        // set axios default header
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
        const res = await axios.get(`${resolvedBackend}/api/auth/verify`)
        setUser(res.data.user)
      } catch (e) {
        setUser(null)
      }
    }
    fetchUser()
  }, [token, resolvedBackend])

  const login = async (email, password) => {
    try {
      console.log('AuthContext: Attempting login to', resolvedBackend)
      const res = await axios.post(`${resolvedBackend}/api/auth/login`, { email, password })
      console.log('AuthContext: Login successful')
      setToken(res.data.token)
      axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`
      return res.data
    } catch (error) {
      console.error('AuthContext: Login failed:', error.response?.data || error.message)
      throw error
    }
  }

  const register = async (fullName, email, password) => {
    const res = await axios.post(`${resolvedBackend}/api/auth/signup`, { fullName, email, password })
    setToken(res.data.token)
    axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`
    return res.data
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    delete axios.defaults.headers.common['Authorization']
  }

  return (
    <AuthContext.Provider value={{ token, user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
