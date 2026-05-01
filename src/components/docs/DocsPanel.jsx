'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState, useRef } from 'react'
import useSketchStore from '@/store/useSketchStore'
import useDocAutoSave, { triggerDocSync } from '@/hooks/useDocAutoSave'

// BlockNote ships its base styles separately; the lixeditor stylesheet
// only contains overrides on top of these. All three are required.
import '@blocknote/core/fonts/inter.css'
import '@blocknote/mantine/style.css'
import '@elixpo/lixeditor/styles'

const LixEditor = dynamic(
  () => import('@elixpo/lixeditor').then((m) => m.LixEditor),
  { ssr: false, loading: () => <DocsLoading /> }
)
const LixThemeProvider = dynamic(
  () => import('@elixpo/lixeditor').then((m) => ({ default: m.LixThemeProvider })),
  { ssr: false }
)

function DocsLoading() {
  return (
    <div className="w-full h-full flex items-center justify-center text-text-dim text-xs font-[lixFont]">
      <i className="bx bx-loader-alt animate-spin mr-2" /> Loading editor…
    </div>
  )
}

export default function DocsPanel() {
  const layoutMode = useSketchStore((s) => s.layoutMode)
  const visible = layoutMode === 'split' || layoutMode === 'docs'

  const { initialContent, ready } = useDocAutoSave(visible)
  const editorRef = useRef(null)

  if (!visible) return null

  return (
    <div className="w-full h-full bg-surface-dark overflow-hidden flex flex-col">
      <div className="flex-1 min-h-0 overflow-y-auto lix-editor-host">
        {ready ? (
          <LixThemeProvider>
            <LixEditor
              initialContent={initialContent}
              onChange={(editor) => {
                try {
                  const blocks = editor.document
                  triggerDocSync(blocks)
                } catch {}
              }}
              features={{ equations: true, mermaid: true, code: true }}
            />
          </LixThemeProvider>
        ) : (
          <DocsLoading />
        )}
      </div>
    </div>
  )
}
