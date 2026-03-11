"use client"

import { useState, useEffect, useRef } from 'react'
import useUIStore from '@/store/useUIStore'
import useSketchStore from '@/store/useSketchStore'

const APP_COMMANDS = [
  { label: 'Library', icon: 'bx-library', shortcut: null },
  { label: 'Find on canvas', icon: 'bx-search', shortcut: 'Ctrl+F' },
  { label: 'Live collaboration', icon: 'bx-group', shortcut: null },
  { label: 'Share', icon: 'bx-share-alt', shortcut: null },
  { label: 'Toggle theme', icon: 'bx-palette', shortcut: null, action: 'toggleTheme' },
  { label: 'Toggle grid', icon: 'bx-grid-alt', shortcut: "Ctrl+'", action: 'toggleGrid' },
]

const EXPORT_COMMANDS = [
  { label: 'Export image', icon: 'bx-image', shortcut: null },
  { label: 'Save to disk', icon: 'bx-save', shortcut: 'Ctrl+S', action: 'save' },
  { label: 'Copy as PNG', icon: 'bx-copy', shortcut: null },
  { label: 'Copy as SVG', icon: 'bx-code-alt', shortcut: null },
]

export default function CommandPalette() {
  const open = useUIStore((s) => s.commandPaletteOpen)
  const toggleCommandPalette = useUIStore((s) => s.toggleCommandPalette)
  const [query, setQuery] = useState('')
  const inputRef = useRef(null)

  useEffect(() => {
    if (open) {
      setQuery('')
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  if (!open) return null

  const allCommands = [
    ...APP_COMMANDS.map((c) => ({ ...c, section: 'App' })),
    ...EXPORT_COMMANDS.map((c) => ({ ...c, section: 'Export' })),
  ]

  const filtered = query
    ? allCommands.filter((c) =>
        c.label.toLowerCase().includes(query.toLowerCase())
      )
    : allCommands

  const sections = {}
  filtered.forEach((c) => {
    if (!sections[c.section]) sections[c.section] = []
    sections[c.section].push(c)
  })

  const handleCommand = (cmd) => {
    toggleCommandPalette()
    if (cmd.action === 'toggleTheme') {
      const store = useUIStore.getState()
      store.setTheme(store.theme === 'dark' ? 'light' : 'dark')
    } else if (cmd.action === 'toggleGrid') {
      useSketchStore.getState().toggleGrid()
    } else if (cmd.action === 'save') {
      useUIStore.getState().toggleSaveModal()
    }
  }

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-start justify-center pt-[15vh] font-[lixFont]"
      onClick={toggleCommandPalette}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      <div
        className="relative bg-surface-card border border-border-light rounded-2xl w-full max-w-[540px] mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border-light">
          <i className="bx bx-search text-text-muted text-lg" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search commands..."
            className="flex-1 bg-transparent text-text-primary text-sm outline-none placeholder:text-text-dim font-[lixFont]"
            onKeyDown={(e) => {
              if (e.key === 'Escape') toggleCommandPalette()
            }}
          />
        </div>

        {/* Results */}
        <div className="max-h-[50vh] overflow-y-auto no-scrollbar py-2">
          {Object.keys(sections).length === 0 && (
            <div className="px-4 py-6 text-center text-text-dim text-xs">
              No commands found
            </div>
          )}

          {Object.entries(sections).map(([section, commands]) => (
            <div key={section}>
              <div className="px-4 pt-3 pb-1">
                <span className="text-text-dim text-xs uppercase tracking-wider">
                  {section}
                </span>
              </div>
              {commands.map((cmd) => (
                <button
                  key={cmd.label}
                  onClick={() => handleCommand(cmd)}
                  className="w-full flex items-center justify-between px-4 py-2.5 text-text-secondary text-xs hover:bg-surface-hover transition-all duration-150"
                >
                  <span className="flex items-center gap-3">
                    <i className={`bx ${cmd.icon} text-base text-text-muted`} />
                    {cmd.label}
                  </span>
                  {cmd.shortcut && (
                    <div className="flex items-center gap-0.5">
                      {cmd.shortcut.split('+').map((key, i) => (
                        <span key={i}>
                          {i > 0 && <span className="text-text-dim text-xs mx-0.5">+</span>}
                          <kbd className="px-1.5 py-0.5 bg-surface-dark rounded text-text-dim text-xs border border-border">
                            {key.trim()}
                          </kbd>
                        </span>
                      ))}
                    </div>
                  )}
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
