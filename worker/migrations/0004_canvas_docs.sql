-- Per-canvas WYSIWYG document content (paired 1:1 with a scene/session).
-- Encrypted with the same per-session key used for scenes.
CREATE TABLE IF NOT EXISTS canvas_docs (
  session_id      TEXT PRIMARY KEY,
  encrypted_data  TEXT NOT NULL,
  size_bytes      INTEGER DEFAULT 0,
  created_at      TEXT DEFAULT (datetime('now')),
  updated_at      TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_canvas_docs_updated ON canvas_docs(updated_at);

-- Track the user's last-used layout per canvas so reload restores it.
ALTER TABLE scenes ADD COLUMN layout_mode TEXT DEFAULT 'canvas';
