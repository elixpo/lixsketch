'use client'

import { useEffect } from 'react'
import Toolbar from '@/components/toolbar/Toolbar'
import Footer from '@/components/footer/Footer'
import RectangleSidebar from '@/components/sidebars/RectangleSidebar'
import CircleSidebar from '@/components/sidebars/CircleSidebar'
import LineSidebar from '@/components/sidebars/LineSidebar'
import ArrowSidebar from '@/components/sidebars/ArrowSidebar'
import PaintbrushSidebar from '@/components/sidebars/PaintbrushSidebar'
import TextSidebar from '@/components/sidebars/TextSidebar'
import FrameSidebar from '@/components/sidebars/FrameSidebar'
import IconSidebar from '@/components/sidebars/IconSidebar'
import ImageSidebar from '@/components/sidebars/ImageSidebar'
import SVGCanvas from '@/components/canvas/SVGCanvas'
import MultiSelectActions from '@/components/canvas/MultiSelectActions'
import ContextMenu from '@/components/canvas/ContextMenu'
import FindBar from '@/components/canvas/FindBar'
import CanvasLoadingOverlay from '@/components/canvas/CanvasLoadingOverlay'
import ShortcutsModal from '@/components/modals/ShortcutsModal'
import CommandPalette from '@/components/modals/CommandPalette'
import ExportImageModal from '@/components/modals/ExportImageModal'
import CanvasPropertiesModal from '@/components/modals/CanvasPropertiesModal'
import useKeyboardShortcuts from '@/hooks/useKeyboardShortcuts'
import useEmbedBridge, { postExitToHost } from '@/hooks/useEmbedBridge'

// Embedded canvas — strips out the app shell (Header, AppMenu, SaveModal,
// AIModal, HelpModal, ImageGenerateModal, DocsPanel, auth) and replaces
// the URL-based session manager + autosave with a postMessage bridge to
// the host application.
export default function EmbedCanvasPage() {
  useEffect(() => {
    document.body.classList.add('canvas-mode', 'embed-mode')
    return () => {
      document.body.classList.remove('canvas-mode', 'embed-mode')
    }
  }, [])

  useKeyboardShortcuts()
  useEmbedBridge()

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black">
      <SVGCanvas />
      <Toolbar />
      <RectangleSidebar />
      <CircleSidebar />
      <LineSidebar />
      <ArrowSidebar />
      <PaintbrushSidebar />
      <TextSidebar />
      <FrameSidebar />
      <IconSidebar />
      <ImageSidebar />
      <MultiSelectActions />
      <Footer />

      <ShortcutsModal />
      <CommandPalette />
      <ExportImageModal />
      <CanvasPropertiesModal />
      <ContextMenu />
      <FindBar />
      <CanvasLoadingOverlay />

      {/* Exit-to-host button (top-right). The host app routes back to the
          editor when it receives 'lixsketch:exit'. */}
      <button
        type="button"
        onClick={postExitToHost}
        className="fixed top-3 right-3 z-[10000] flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface/85 backdrop-blur-md border border-border-light text-text-secondary text-xs hover:text-text-primary hover:border-accent-blue/40 transition-colors"
        title="Exit to editor"
      >
        <i className="bx bx-x text-base" />
        Exit
      </button>

      <div
        id="save-toast"
        className="hidden fixed bottom-20 left-1/2 -translate-x-1/2 z-[9999] px-4 py-2 rounded-xl bg-surface/80 backdrop-blur-md border border-border-light text-text-secondary text-xs font-[lixFont] pointer-events-none animate-fade-in"
      >
        <i className="bx bx-check text-green-400 mr-1.5" />
        Saved
      </div>
    </div>
  )
}
