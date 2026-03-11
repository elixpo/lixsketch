"use client"

import { create } from 'zustand'

const STORAGE_KEY = 'lixsketch-auth'
const COOKIE_NAME = 'lixsketch-session'
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 // 7 days in seconds
const WORKER_URL = process.env.NEXT_PUBLIC_WORKER_URL

// --- Persistence helpers (localStorage + cookie) ---

function loadAuth() {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  // Fallback: try cookie
  try {
    const match = document.cookie.match(new RegExp(`(?:^|; )${COOKIE_NAME}=([^;]*)`))
    if (match) return JSON.parse(decodeURIComponent(match[1]))
  } catch {}
  return null
}

function saveAuth(data) {
  if (typeof window === 'undefined') return
  try {
    if (data) {
      const json = JSON.stringify(data)
      localStorage.setItem(STORAGE_KEY, json)
      document.cookie = `${COOKIE_NAME}=${encodeURIComponent(json)}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`
    } else {
      localStorage.removeItem(STORAGE_KEY)
      document.cookie = `${COOKIE_NAME}=; path=/; max-age=0`
    }
  } catch {}
}

const useAuthStore = create((set, get) => ({
  user: null,           // { id, email, displayName, avatar, isAdmin }
  sessionToken: null,   // Session token
  isAuthenticated: false,
  activeRooms: 0,
  maxRooms: 10,
  loading: false,

  // Initialize from localStorage/cookie on mount
  init: () => {
    const saved = loadAuth()
    if (saved?.sessionToken && saved?.user) {
      set({
        user: saved.user,
        sessionToken: saved.sessionToken,
        isAuthenticated: true,
      })
    }
  },

  // Start OAuth flow — redirect to Elixpo Accounts
  login: () => {
    const clientId = process.env.NEXT_PUBLIC_ELIXPO_AUTH_CLIENT_ID
    const appOrigin = window.location.origin
    const redirectUri = `${appOrigin}/api/auth/callback`
    const state = crypto.randomUUID()

    sessionStorage.setItem('lixsketch-oauth-state', state)

    const authUrl = `https://accounts.elixpo.com/oauth/authorize` +
      `?response_type=code` +
      `&client_id=${encodeURIComponent(clientId)}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&state=${state}` +
      `&scope=openid profile email`

    window.location.href = authUrl
  },

  // Handle callback response (called after redirect back)
  handleCallback: async (sessionToken, user) => {
    saveAuth({ sessionToken, user })
    set({
      user,
      sessionToken,
      isAuthenticated: true,
    })
  },

  // Fetch current user from worker session (no-op for local dev without worker)
  fetchMe: async () => {
    const token = get().sessionToken
    if (!token || !WORKER_URL) return

    try {
      const res = await fetch(`${WORKER_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!res.ok) {
        get().logout()
        return
      }

      const data = await res.json()
      set({
        user: data.user,
        activeRooms: data.activeRooms || 0,
        maxRooms: data.maxRooms || 10,
        isAuthenticated: true,
      })
      saveAuth({ sessionToken: token, user: data.user })
    } catch {
      // Network error — keep existing state
    }
  },

  // Refresh the session token
  refresh: async () => {
    const token = get().sessionToken
    if (!token || !WORKER_URL) return false

    try {
      const res = await fetch(`${WORKER_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!res.ok) {
        get().logout()
        return false
      }
      return true
    } catch {
      return false
    }
  },

  // Clear auth state — falls back to guest profile automatically
  logout: () => {
    saveAuth(null)
    set({
      user: null,
      sessionToken: null,
      isAuthenticated: false,
      activeRooms: 0,
    })
  },
}))

export default useAuthStore
export { WORKER_URL }
