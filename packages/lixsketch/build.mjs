import { build } from 'esbuild';
import { copyFileSync, mkdirSync, readdirSync, statSync, existsSync, rmSync } from 'fs';
import { join, resolve } from 'path';

const root = resolve('.');
const src = resolve('src');
const dist = resolve('dist');

if (existsSync(dist)) rmSync(dist, { recursive: true, force: true });
mkdirSync(join(dist, 'react'), { recursive: true });

// roughjs / perfect-freehand are listed as runtime deps so consumers
// pull them via npm. react / react-dom are peer deps. We keep them
// external in the bundle so each consumer gets a single React copy.
const EXTERNAL = [
  'react',
  'react-dom',
  'react/jsx-runtime',
  'react/jsx-dev-runtime',
  'roughjs',
  'roughjs/bin/rough.js',
  'roughjs/bundled/rough.esm.js',
  'perfect-freehand',
];

// ── React subpath (ESM) ───────────────────────────────────────────────
await build({
  entryPoints: ['src/react/index.js'],
  bundle: true,
  format: 'esm',
  outfile: 'dist/react/index.js',
  jsx: 'automatic',
  loader: { '.js': 'jsx', '.jsx': 'jsx' },
  target: 'es2020',
  platform: 'browser',
  external: EXTERNAL,
  minify: false,
  sourcemap: true,
  treeShaking: true,
  banner: { js: '"use client";' },
});

// ── React subpath (CJS) ───────────────────────────────────────────────
await build({
  entryPoints: ['src/react/index.js'],
  bundle: true,
  format: 'cjs',
  outfile: 'dist/react/index.cjs',
  jsx: 'automatic',
  loader: { '.js': 'jsx', '.jsx': 'jsx' },
  target: 'es2020',
  platform: 'browser',
  external: EXTERNAL,
  minify: false,
  sourcemap: true,
  treeShaking: true,
});

// ── Bundle the React subpath's CSS into a single file ─────────────────
// Consumer does `import '@elixpo/lixsketch/react/styles'`.
await build({
  entryPoints: [join(src, 'react', 'styles.css')],
  bundle: true,
  outfile: join(dist, 'react', 'styles.css'),
  loader: {
    '.css': 'css',
    '.woff': 'file',
    '.woff2': 'file',
    '.ttf': 'file',
    '.svg': 'file',
    '.png': 'file',
  },
  minify: false,
});

console.log('✓ Built React subpath (ESM + CJS) and bundled CSS to dist/react/');
