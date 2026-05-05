'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { SketchEngine } from '../SketchEngine.js';
import { saveScene, loadScene } from '../core/SceneSerializer.js';
import { installEngineShortcuts, TOOLS } from '../index.js';
import { compressImage } from '../utils/imageCompressor.js';
import Toolbar from './Toolbar.jsx';

const SAVE_DEBOUNCE_MS = 1500;

/**
 * Self-contained canvas component. Mounts the SketchEngine on an internal
 * <svg>, renders a top-bar toolbar, wires keyboard shortcuts, and surfaces
 * scene changes + image uploads to the host.
 *
 * Phase 1 ships the engine + tool-switching toolbar. Per-shape sidebars
 * (rectangle styling, brush settings, etc.) and chrome modals (command
 * palette, export, find bar) come in subsequent phases.
 */
export default function LixSketchCanvas({
  initialScene = null,
  onSceneChange = null,
  onUploadImage = null,
  onExit = null,
  className = '',
  style = null,
}) {
  const wrapperRef = useRef(null);
  const svgRef = useRef(null);
  const engineRef = useRef(null);
  const lastSceneJsonRef = useRef('');
  const debounceRef = useRef(null);

  const [activeTool, setActiveToolState] = useState(TOOLS.SELECT);
  const [ready, setReady] = useState(false);

  // ── Engine bootstrap ────────────────────────────────────────────────
  useEffect(() => {
    if (!svgRef.current) return;
    let cancelled = false;
    let uninstallShortcuts = null;

    (async () => {
      const svg = svgRef.current;
      svg.setAttribute('viewBox', `0 0 ${svg.clientWidth || window.innerWidth} ${svg.clientHeight || window.innerHeight}`);

      const engine = new SketchEngine(svg);
      await engine.init();
      if (cancelled) { engine.cleanup?.(); return; }

      engineRef.current = engine;
      window.__sketchEngine = engine;

      // Wire image uploads to the host BEFORE the user can drop anything in.
      installImageUploadBridge(onUploadImage);

      // Apply initial scene if given.
      if (initialScene) {
        try {
          const data = typeof initialScene === 'string' ? JSON.parse(initialScene) : initialScene;
          if (data && data.format === 'lixsketch') {
            loadScene(data);
            lastSceneJsonRef.current = JSON.stringify(data);
          }
        } catch (err) {
          console.warn('[LixSketchCanvas] initialScene load failed:', err);
        }
      }

      // Force select tool so the user can interact immediately.
      engine.setActiveTool(TOOLS.SELECT);
      setActiveToolState(TOOLS.SELECT);

      uninstallShortcuts = installEngineShortcuts(engine, {
        // Mirror tool switches into local state so the toolbar UI stays in sync.
        setActiveTool: (tool) => {
          engine.setActiveTool(tool);
          setActiveToolState(tool);
        },
        skipWhen: (e) => !!e.target?.closest?.('[data-shortcut-skip]'),
      });

      setReady(true);
    })().catch((err) => console.error('[LixSketchCanvas] init failed:', err));

    return () => {
      cancelled = true;
      if (uninstallShortcuts) uninstallShortcuts();
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (engineRef.current?.cleanup) engineRef.current.cleanup();
      engineRef.current = null;
      if (window.__sketchEngine) delete window.__sketchEngine;
    };
  // initialScene / onUploadImage intentionally not in deps — engine boots once.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep onUploadImage current without re-mounting the engine.
  const onUploadImageRef = useRef(onUploadImage);
  useEffect(() => { onUploadImageRef.current = onUploadImage; }, [onUploadImage]);

  // Re-install the upload bridge whenever onUploadImage identity changes.
  useEffect(() => {
    if (!ready) return;
    installImageUploadBridge((dataUrl) => onUploadImageRef.current?.(dataUrl));
  }, [ready]);

  // ── Scene-change autosave ───────────────────────────────────────────
  useEffect(() => {
    if (!ready || !onSceneChange) return;
    const svg = svgRef.current;
    if (!svg) return;

    const flush = () => {
      try {
        const scene = saveScene('Untitled');
        const json = JSON.stringify(scene);
        if (json === lastSceneJsonRef.current) return;
        lastSceneJsonRef.current = json;
        const metadata = {
          shapeCount: Array.isArray(scene.shapes) ? scene.shapes.length : 0,
          viewport: scene.viewport || null,
          zoom: scene.zoom || 1,
          sizeBytes: json.length,
          savedAt: Date.now(),
        };
        onSceneChange(scene, metadata);
      } catch (err) {
        console.warn('[LixSketchCanvas] save failed:', err);
      }
    };

    const debounced = () => {
      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(flush, SAVE_DEBOUNCE_MS);
    };

    const observer = new MutationObserver(debounced);
    observer.observe(svg, { childList: true, subtree: true, attributes: true });
    svg.addEventListener('mouseup', debounced);
    window.addEventListener('beforeunload', flush);

    return () => {
      observer.disconnect();
      svg.removeEventListener('mouseup', debounced);
      window.removeEventListener('beforeunload', flush);
      clearTimeout(debounceRef.current);
    };
  }, [ready, onSceneChange]);

  // ── Toolbar handlers ────────────────────────────────────────────────
  const handleSelectTool = useCallback((tool) => {
    const engine = engineRef.current;
    if (!engine) return;
    engine.setActiveTool(tool);
    setActiveToolState(tool);
  }, []);

  return (
    <div
      ref={wrapperRef}
      className={`lixsketch-canvas-root ${className}`}
      style={style}
    >
      <Toolbar
        activeTool={activeTool}
        onSelectTool={handleSelectTool}
        onExit={onExit || undefined}
      />
      <svg
        id="freehand-canvas"
        ref={svgRef}
        className="lixsketch-canvas-svg"
        xmlns="http://www.w3.org/2000/svg"
      />
      {!ready && (
        <div className="lixsketch-canvas-loading">
          <div className="lixsketch-canvas-spinner" />
        </div>
      )}
    </div>
  );
}

// ── Image upload bridge ───────────────────────────────────────────────
// The engine calls window.uploadImageToCloudinary when a user adds an image.
// Replace that with a callback-driven version that compresses client-side
// and hands the data URL to the host. Host does the network round-trip and
// returns the final URL, which we write back onto the SVG <image>.
function installImageUploadBridge(onUploadImage) {
  if (typeof window === 'undefined') return;
  if (!onUploadImage) {
    // Offline mode (e.g. VS Code, npm consumer with no upload pipeline):
    // leave the engine's compressed data-URL placement in place.
    window.uploadImageToCloudinary = async () => {};
    return;
  }

  window.uploadImageToCloudinary = async function bridgedUpload(imageShape) {
    const href = imageShape?.element?.getAttribute('href') || '';
    if (!href.startsWith('data:')) return;

    imageShape.uploadStatus = 'uploading';
    imageShape.uploadAbortController = new AbortController();
    const signal = imageShape.uploadAbortController.signal;
    imageShape.showUploadIndicator?.();

    try {
      let payloadDataUrl = href;
      try {
        const compressed = await compressImage(href);
        if (compressed?.dataUrl) payloadDataUrl = compressed.dataUrl;
      } catch (err) {
        console.warn('[LixSketchCanvas] compression failed, sending raw:', err);
      }
      if (signal.aborted) return;

      const result = await onUploadImage(payloadDataUrl);
      if (signal.aborted) return;
      if (!result?.url) throw new Error(result?.error || 'Upload failed');

      imageShape.element.setAttribute('href', result.url);
      imageShape.element.setAttribute('data-href', result.url);
      if (result.publicId) imageShape.element.setAttribute('data-cloudinary-id', result.publicId);
      if (typeof result.sizeBytes === 'number') {
        const oldSize = imageShape.element.__fileSize || 0;
        imageShape.element.__fileSize = result.sizeBytes;
        window.__roomImageBytesUsed = Math.max(
          0,
          (window.__roomImageBytesUsed || 0) - oldSize + result.sizeBytes
        );
      }
      imageShape.uploadStatus = 'done';
    } catch (err) {
      if (!signal.aborted) {
        console.warn('[LixSketchCanvas] upload failed:', err);
        imageShape.uploadStatus = 'failed';
      }
    } finally {
      imageShape.removeUploadIndicator?.();
      imageShape.uploadAbortController = null;
    }
  };
}
