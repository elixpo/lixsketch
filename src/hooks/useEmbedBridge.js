"use client"

import { useEffect, useRef } from 'react'
import useUIStore from '@/store/useUIStore'

// PostMessage protocol used by /embed/canvas to talk to the host app
// (e.g. blogs.elixpo). The host owns persistence and auth; the iframe
// just renders the canvas and ships scene snapshots back.
//
// Parent → child:
//   { type: 'lixsketch:init', subpageId, content, metadata, theme }
//   { type: 'lixsketch:request-save' }
//
// Child → parent:
//   { type: 'lixsketch:ready' }
//   { type: 'lixsketch:save', content, metadata, sizeBytes }
//   { type: 'lixsketch:exit' }
//   { type: 'lixsketch:dirty' }
//
// Origin allowlist is configured via NEXT_PUBLIC_LIXSKETCH_EMBED_ORIGINS
// (comma-separated). Falls back to '*' in dev only.
const ALLOWED_ORIGINS = (process.env.NEXT_PUBLIC_LIXSKETCH_EMBED_ORIGINS || '')
  .split(',').map((s) => s.trim()).filter(Boolean)

function isAllowedOrigin(origin) {
  if (ALLOWED_ORIGINS.length === 0) return true // dev fallback
  return ALLOWED_ORIGINS.includes(origin)
}

const SAVE_DEBOUNCE_MS = 1500

export default function useEmbedBridge() {
  const initializedRef = useRef(false)
  const subpageIdRef = useRef(null)
  const parentOriginRef = useRef('*')
  const lastSavedJsonRef = useRef('')

  // Tell the parent we're alive; parent will reply with 'init' carrying the
  // scene content. Done after engine init completes (window.__sceneSerializer
  // is set by SketchEngine.init).
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.parent === window) return // not actually iframed

    let waitTimer = null
    function announceReady() {
      const serializer = window.__sceneSerializer
      if (!serializer) {
        waitTimer = setTimeout(announceReady, 200)
        return
      }
      window.parent.postMessage({ type: 'lixsketch:ready' }, parentOriginRef.current)
    }
    announceReady()
    return () => { if (waitTimer) clearTimeout(waitTimer) }
  }, [])

  // Listen for parent messages
  useEffect(() => {
    if (typeof window === 'undefined') return

    function handleMessage(e) {
      if (!isAllowedOrigin(e.origin)) return
      const msg = e.data
      if (!msg || typeof msg !== 'object') return

      if (msg.type === 'lixsketch:init') {
        parentOriginRef.current = e.origin
        subpageIdRef.current = msg.subpageId || null
        window.__embedSubpageId = subpageIdRef.current

        // Apply scene if the parent supplied one
        const serializer = window.__sceneSerializer
        if (serializer && msg.content) {
          try {
            const sceneData = typeof msg.content === 'string' ? JSON.parse(msg.content) : msg.content
            if (sceneData && sceneData.format === 'lixsketch') {
              serializer.load(sceneData)
              lastSavedJsonRef.current = JSON.stringify(sceneData)
            }
          } catch (err) {
            console.warn('[embedBridge] init load failed:', err)
          }
        }

        if (msg.theme === 'light' || msg.theme === 'dark') {
          // Hook up if/when sketch.elixpo gains a runtime theme switch.
        }

        initializedRef.current = true

        // Force select tool so user can interact with imported shapes
        if (window.__sketchEngine?.setActiveTool) {
          window.__sketchEngine.setActiveTool('select')
        }
      }

      if (msg.type === 'lixsketch:request-save') {
        flushSave({ silent: false })
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  // Watch for scene changes (MutationObserver on the SVG + mouseup), debounce
  // and post a save up. Mirrors useAutoSave's strategy.
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.parent === window) return

    let debounce = null
    let observer = null
    let svgRef = null

    function flush() {
      const serializer = window.__sceneSerializer
      if (!serializer || !initializedRef.current) return
      try {
        const workspaceName = useUIStore.getState().workspaceName || 'Untitled'
        const sceneData = serializer.save(workspaceName)
        const json = JSON.stringify(sceneData)
        if (json === lastSavedJsonRef.current) return
        lastSavedJsonRef.current = json

        const metadata = {
          shapeCount: Array.isArray(sceneData.shapes) ? sceneData.shapes.length : 0,
          viewport: sceneData.viewport || null,
          zoom: sceneData.zoom || 1,
          sizeBytes: json.length,
          savedAt: Date.now(),
        }

        window.parent.postMessage({
          type: 'lixsketch:save',
          subpageId: subpageIdRef.current,
          content: sceneData,
          metadata,
        }, parentOriginRef.current)
      } catch (err) {
        console.warn('[embedBridge] save failed:', err)
      }
    }

    // Expose for the request-save message handler above
    flushSave = flush

    function debounced() {
      window.parent.postMessage({ type: 'lixsketch:dirty' }, parentOriginRef.current)
      clearTimeout(debounce)
      debounce = setTimeout(flush, SAVE_DEBOUNCE_MS)
    }

    function attach() {
      const svg = window.svg
      if (!svg) {
        setTimeout(attach, 300)
        return
      }
      svgRef = svg
      observer = new MutationObserver(debounced)
      observer.observe(svg, { childList: true, subtree: true, attributes: true })
      svg.addEventListener('mouseup', debounced)
    }
    attach()

    function handleUnload() { flush() }
    window.addEventListener('beforeunload', handleUnload)

    return () => {
      clearTimeout(debounce)
      if (observer) observer.disconnect()
      if (svgRef) svgRef.removeEventListener('mouseup', debounced)
      window.removeEventListener('beforeunload', handleUnload)
    }
  }, [])
}

// Module-scoped pointer set inside the effect above so the message handler
// can trigger a flush without a re-subscribe.
let flushSave = () => {}

export function postExitToHost() {
  if (typeof window === 'undefined') return
  if (window.parent === window) return
  window.parent.postMessage({ type: 'lixsketch:exit' }, '*')
}
