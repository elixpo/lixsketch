"use client"

import { useState, useEffect, useCallback, useRef } from 'react'
import useUIStore from '@/store/useUIStore'
import useSketchStore from '@/store/useSketchStore'

export default function ImageSourcePicker() {
  const [visible, setVisible] = useState(false)
  const [position, setPosition] = useState({ x: 100, y: 300 })
  const ref = useRef(null)
  const toggleImageGenerateModal = useUIStore((s) => s.toggleImageGenerateModal)
  const setActiveTool = useSketchStore((s) => s.setActiveTool)

  const close = useCallback(() => {
    setVisible(false)
  }, [])

  // Register the global bridge function
  useEffect(() => {
    window.__showImageSourcePicker = () => {
      // Position next to the toolbar (left side, centered vertically near the image tool button)
      const toolbarEl = document.querySelector('.fixed.left-2\\.5')
      if (toolbarEl) {
        const rect = toolbarEl.getBoundingClientRect()
        setPosition({ x: rect.right + 8, y: rect.top + rect.height / 2 - 50 })
      } else {
        setPosition({ x: 65, y: window.innerHeight / 2 - 50 })
      }
      setVisible(true)
    }

    return () => {
      delete window.__showImageSourcePicker
    }
  }, [])

  // Close on outside click
  useEffect(() => {
    if (!visible) return
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        close()
        // Switch back to select if user dismisses without choosing
        setActiveTool('select')
      }
    }
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        close()
        setActiveTool('select')
      }
    }
    // Delay to avoid catching the click that opened it
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClick)
      document.addEventListener('keydown', handleEsc)
    }, 50)
    return () => {
      clearTimeout(timer)
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleEsc)
    }
  }, [visible, close, setActiveTool])

  const handleGenerateAI = () => {
    close()
    setActiveTool('select')
    toggleImageGenerateModal()
  }

  const handleUpload = () => {
    close()
    if (window.openImageFilePicker) {
      window.openImageFilePicker()
    }
  }

  if (!visible) return null

  return (
    <div
      ref={ref}
      className="fixed z-[1100] font-[lixFont] animate-in fade-in slide-in-from-left-2 duration-150"
      style={{ left: position.x, top: position.y }}
    >
      <div className="bg-surface-card border border-border-light rounded-xl p-1.5 shadow-2xl shadow-black/40 flex flex-col gap-1 min-w-[180px]">
        <button
          onClick={handleGenerateAI}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-text-muted hover:text-accent-blue hover:bg-surface-hover transition-all group"
        >
          <div className="w-8 h-8 rounded-lg bg-accent-blue/10 flex items-center justify-center group-hover:bg-accent-blue/20 transition-all">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent-blue">
              <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" />
              <path d="M18 14l1 3 3 1-3 1-1 3-1-3-3-1 3-1 1-3z" />
            </svg>
          </div>
          <div className="text-left">
            <div className="text-sm font-medium">Generate with AI</div>
            <div className="text-[10px] text-text-dim">Create from a prompt</div>
          </div>
        </button>

        <div className="h-px bg-white/[0.06] mx-2" />

        <button
          onClick={handleUpload}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-hover transition-all group"
        >
          <div className="w-8 h-8 rounded-lg bg-surface-hover flex items-center justify-center group-hover:bg-surface-active transition-all">
            <i className="bx bx-upload text-lg" />
          </div>
          <div className="text-left">
            <div className="text-sm font-medium">Upload from device</div>
            <div className="text-[10px] text-text-dim">PNG, JPG, SVG, WebP</div>
          </div>
        </button>
      </div>
    </div>
  )
}
