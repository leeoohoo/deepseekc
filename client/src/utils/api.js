const API_BASE = '/api'

export async function sendVerificationCode(email, type) {
  const res = await fetch(`${API_BASE}/auth/send-code`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, type })
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Failed to send code')
  return data
}

export async function register(email, code, referralCode) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, code, referralCode: referralCode || undefined })
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Registration failed')
  return data
}

export async function login(email, code) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, code })
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Login failed')
  return data
}

export async function getCurrentUser(token) {
  const res = await fetch(`${API_BASE}/auth/me`, {
    headers: { 'Authorization': `Bearer ${token}` }
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Failed to get user')
  return data
}

export function getToken() {
  return localStorage.getItem('token')
}

export function setToken(token) {
  localStorage.setItem('token', token)
}

export function removeToken() {
  localStorage.removeItem('token')
}

export function isAuthenticated() {
  return !!getToken()
}