/**
 * @elixpo/lixsketch/react — React component bindings for the LixSketch
 * engine. Mountable in any React app (e.g. blogs.elixpo) without running a
 * second server.
 *
 * Usage:
 *   import { LixSketchCanvas } from '@elixpo/lixsketch/react';
 *   import '@elixpo/lixsketch/react/styles';
 *
 *   <LixSketchCanvas
 *     initialScene={scene}
 *     onSceneChange={(scene, metadata) => save(scene, metadata)}
 *     onUploadImage={async (dataUrl) => {
 *       const r = await fetch('/api/media/upload', { … });
 *       return { url: r.url, sizeBytes: r.sizeBytes };
 *     }}
 *     onExit={() => router.back()}
 *   />
 *
 * The component is offline-first: it does not touch any cloud sync, AI, or
 * auth code paths. The host owns persistence and image upload via the two
 * callbacks above.
 */

export { default as LixSketchCanvas } from './LixSketchCanvas.jsx';

// Re-exports from the engine that hosts may want for advanced cases.
export {
  TOOLS,
  saveScene,
  loadScene,
  compressImage,
  ALLOWED_IMAGE_MIME_TYPES,
  IMAGE_ACCEPT_ATTR,
  isAllowedImage,
  isAllowedImageDataUrl,
  installEngineShortcuts,
  SHORTCUT_MAP,
} from '../index.js';
