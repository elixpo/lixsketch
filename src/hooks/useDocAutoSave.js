'use client'

import { useEffect, useRef, useState } from 'react'
import useUIStore from '@/store/useUIStore'
import useSketchStore from '@/store/useSketchStore'
import { WORKER_URL } from '@/store/useAuthStore'
import { getSessionID } from '@/hooks/useSessionID'
import { encrypt, decrypt, generateKey } from '@/utils/encryption'

const LOCAL_KEY_PREFIX = 'lixsketch-doc-autosave'
const DEBOUNCE_MS = 800
const CLOUD_INTERVAL = 30_000 // 30s — docs typically save more often than scenes

const localKey = () => {
  const sid = typeof window !== 'undefined' ? window.__sessionID : null
  return sid ? `${LOCAL_KEY_PREFIX}-${sid}` : LOCAL_KEY_PREFIX
}

let pendingBlocks = null
let dirty = false

export function triggerDocSync(blocks) {
  pendingBlocks = blocks
  dirty = true
  try {
    localStorage.setItem(localKey(), JSON.stringify({ blocks, savedAt: Date.now() }))
  } catch {}
}

async function syncToCloud() {
  if (!WORKER_URL || !dirty || !pendingBlocks) return
  try {
    const sessionId = getSessionID()
    if (!sessionId) return

    let encKey = useUIStore.getState().loadEncryptionKeyForSession?.(sessionId)
    if (!encKey) {
      // Fall back to generating a fresh per-session key for the doc.
      encKey = await generateKey()
      useUIStore.getState().setSessionEncryptionKey?.(encKey, sessionId)
    }

    const encryptedData = await encrypt(JSON.stringify(pendingBlocks), encKey)
    const res = await fetch(`${WORKER_URL}/api/canvas-docs/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, encryptedData }),
    })
    if (res.ok) dirty = false
  } catch (err) {
    console.warn('[DocAutoSave] cloud sync failed:', err)
  }
}

/**
 * Hydrates the doc panel: tries cloud → localStorage → empty.
 * Sets up debounced saves to cloud + localStorage.
 *
 * Returns { initialContent, ready }. The editor is mounted only when ready.
 */
export default function useDocAutoSave(active) {
  const setLayoutMode = useSketchStore((s) => s.setLayoutMode)
  const [initialContent, setInitialContent] = useState(undefined)
  const [ready, setReady] = useState(false)
  const debounceTimer = useRef(null)
  const cloudTimer = useRef(null)

  // Hydrate on first activation.
  useEffect(() => {
    if (!active || ready) return
    let cancelled = false

    const hydrate = async () => {
      const sessionId = getSessionID()

      // Local first (instant).
      try {
        const raw = localStorage.getItem(localKey())
        if (raw) {
          const parsed = JSON.parse(raw)
          if (parsed?.blocks) {
            if (!cancelled) setInitialContent(parsed.blocks)
          }
        }
      } catch {}

      // Cloud (authoritative).
      if (WORKER_URL && sessionId) {
        try {
          const res = await fetch(`${WORKER_URL}/api/canvas-docs/load?sessionId=${sessionId}`)
          if (res.ok) {
            const data = await res.json()
            if (data.layoutMode) {
              // Restore the user's preferred layout (only on first hydration).
              const current = useSketchStore.getState().layoutMode
              if (current === 'canvas' && data.layoutMode !== 'canvas') {
                setLayoutMode(data.layoutMode)
              }
            }
            if (data.encryptedData) {
              const encKey = useUIStore.getState().loadEncryptionKeyForSession?.(sessionId)
              if (encKey) {
                try {
                  const decrypted = await decrypt(data.encryptedData, encKey)
                  const blocks = JSON.parse(decrypted)
                  if (!cancelled) setInitialContent(blocks)
                } catch (err) {
                  console.warn('[DocAutoSave] decrypt failed:', err)
                }
              }
            }
          }
        } catch (err) {
          console.warn('[DocAutoSave] cloud fetch failed:', err)
        }
      }

      if (!cancelled) setReady(true)
    }

    hydrate()
    return () => { cancelled = true }
  }, [active, ready, setLayoutMode])

  // Debounced cloud sync loop.
  useEffect(() => {
    if (!active) return
    cloudTimer.current = setInterval(syncToCloud, CLOUD_INTERVAL)
    const onUnload = () => syncToCloud()
    window.addEventListener('beforeunload', onUnload)
    return () => {
      clearInterval(cloudTimer.current)
      window.removeEventListener('beforeunload', onUnload)
      syncToCloud()
    }
  }, [active])

  // Schedule a debounced sync whenever the user types — `triggerDocSync` is
  // called from the editor's onChange; we just piggyback a debounce here.
  useEffect(() => {
    if (!active) return
    const i = setInterval(() => {
      if (dirty) {
        clearTimeout(debounceTimer.current)
        debounceTimer.current = setTimeout(syncToCloud, DEBOUNCE_MS)
      }
    }, 500)
    return () => clearInterval(i)
  }, [active])

  return { initialContent, ready }
}

export async function persistLayoutMode(layoutMode) {
  if (!WORKER_URL) return
  try {
    const sessionId = getSessionID()
    if (!sessionId) return
    await fetch(`${WORKER_URL}/api/canvas-docs/layout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, layoutMode }),
    })
  } catch {}
}
