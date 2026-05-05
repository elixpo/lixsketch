'use client';

import { TOOLS } from '../index.js';

// Inline SVG icon library. Kept here so the package doesn't pull in a
// CSS-icon-font runtime dep (boxicons/ionicons) — those would conflict
// with hosts that ship their own icon system.
const I = {
  pan: <path d="M11 11V5a1 1 0 1 1 2 0v6m0 0V3a1 1 0 1 1 2 0v8m0 0V5a1 1 0 1 1 2 0v9m0 0v3a5 5 0 0 1-5 5h-2.5c-1.7 0-3.3-.9-4.2-2.3L4 16a1.5 1.5 0 1 1 2.5-1.7L8 17V8a1 1 0 1 1 2 0v6" />,
  select: <path d="M3 3l7 17 2-7 7-2z" />,
  rect: <rect x="4" y="5" width="16" height="14" rx="1" />,
  circle: <circle cx="12" cy="12" r="8" />,
  line: <line x1="5" y1="19" x2="19" y2="5" />,
  arrow: <g><line x1="4" y1="12" x2="18" y2="12" /><polyline points="13 7 18 12 13 17" /></g>,
  text: <g><polyline points="6 5 18 5" /><line x1="12" y1="5" x2="12" y2="19" /></g>,
  freehand: <path d="M5 18c2-1 4-7 7-7s4 5 7 4" />,
  image: <g><rect x="3" y="5" width="18" height="14" rx="2" /><circle cx="9" cy="11" r="1.5" /><polyline points="21 17 15 11 5 19" /></g>,
  icon: <g><circle cx="12" cy="12" r="9" /><circle cx="9" cy="10" r="0.5" fill="currentColor" /><circle cx="15" cy="10" r="0.5" fill="currentColor" /><path d="M9 15c1 1 5 1 6 0" /></g>,
  frame: <g><rect x="4" y="4" width="16" height="16" rx="1" /><line x1="4" y1="9" x2="20" y2="9" /></g>,
  laser: <g><line x1="3" y1="21" x2="9" y2="15" /><polyline points="14 4 20 4 20 10" /><polyline points="20 4 9 15" /></g>,
  eraser: <g><polyline points="20 20 11 20 4 13 13 4 22 13 13 22" /><line x1="9" y1="9" x2="16" y2="16" /></g>,
  exit: <g><polyline points="9 18 3 12 9 6" /><line x1="3" y1="12" x2="15" y2="12" /></g>,
};

const TOOL_ITEMS = [
  { tool: TOOLS.PAN, icon: 'pan', title: 'Pan (H)' },
  { tool: TOOLS.SELECT, icon: 'select', title: 'Select (V)' },
  'spacer',
  { tool: TOOLS.RECTANGLE, icon: 'rect', title: 'Rectangle (R)' },
  { tool: TOOLS.CIRCLE, icon: 'circle', title: 'Circle (O)' },
  { tool: TOOLS.LINE, icon: 'line', title: 'Line (L)' },
  { tool: TOOLS.ARROW, icon: 'arrow', title: 'Arrow (A)' },
  { tool: TOOLS.TEXT, icon: 'text', title: 'Text (T)' },
  { tool: TOOLS.FREEHAND, icon: 'freehand', title: 'Freehand (P)' },
  { tool: TOOLS.IMAGE, icon: 'image', title: 'Image (9)' },
  { tool: TOOLS.ICON, icon: 'icon', title: 'Icon (I)' },
  'spacer',
  { tool: TOOLS.FRAME, icon: 'frame', title: 'Frame (F)' },
  { tool: TOOLS.LASER, icon: 'laser', title: 'Laser (K)' },
  { tool: TOOLS.ERASER, icon: 'eraser', title: 'Eraser (E)' },
];

function ToolButton({ item, activeTool, onSelectTool }) {
  const isActive = activeTool === item.tool;
  return (
    <button
      type="button"
      className={`lixsketch-tool-btn${isActive ? ' is-active' : ''}`}
      title={item.title}
      onClick={() => onSelectTool(item.tool)}
      aria-pressed={isActive}
      aria-label={item.title}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        {I[item.icon]}
      </svg>
    </button>
  );
}

export default function Toolbar({ activeTool, onSelectTool, onExit }) {
  return (
    <div className="lixsketch-toolbar" role="toolbar" aria-label="Canvas tools">
      {TOOL_ITEMS.map((item, i) =>
        item === 'spacer'
          ? <span key={`s-${i}`} className="lixsketch-toolbar-spacer" aria-hidden />
          : <ToolButton key={item.tool} item={item} activeTool={activeTool} onSelectTool={onSelectTool} />
      )}
      {onExit && (
        <>
          <span className="lixsketch-toolbar-spacer" aria-hidden />
          <button
            type="button"
            className="lixsketch-tool-btn lixsketch-tool-btn--exit"
            title="Exit canvas"
            onClick={onExit}
            aria-label="Exit canvas"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              {I.exit}
            </svg>
            <span className="lixsketch-tool-btn-label">Exit</span>
          </button>
        </>
      )}
    </div>
  );
}
