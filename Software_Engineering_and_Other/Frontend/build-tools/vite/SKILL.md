---
name: vite
description: Configure and optimize Vite — dev server, plugins, build output,
  code splitting, and environment variables. Use when setting up a new Vite
  project, migrating from webpack/CRA to Vite, configuring a Vite plugin,
  debugging slow dev server or build performance, or tuning production
  bundle output.
tags:
  - frontend
  - build
  - vite
depends_on:
  - frontend-bundler-tools
---

# Vite

Vite serves source files over native ES modules during development (no bundling step, near-instant
server start and HMR) and switches to a Rollup-based bundle for production. Most configuration
work is either plugin selection or tuning what ends up in the production bundle.

## When to Use This Skill

- Setting up a new Vite project or migrating from webpack/Create React App
- Configuring or writing a Vite plugin
- Debugging a slow dev server, slow HMR, or slow production build
- Tuning code splitting, chunk size, or asset handling for production
- Configuring environment variables, proxying, or multi-page builds

## Core Configuration

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': { target: 'http://localhost:8080', changeOrigin: true },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    target: 'es2020',
  },
  resolve: {
    alias: { '@': '/src' },
  },
})
```

## Dev Server vs. Production Build

| | Dev server | Production build |
|---|---|---|
| Mechanism | Native ESM, no bundling — browser requests modules directly | Rollup bundles, tree-shakes, and minifies |
| Startup | Near-instant regardless of app size | Full build required, scales with app size |
| HMR | Per-module, sub-100ms typically | N/A |
| Output | Nothing written to disk | Static files in `build.outDir` |

Because dev and prod use different pipelines, a bug that only appears in the production build
(e.g., a dependency that isn't ESM-clean) won't show up in dev — always test the production build
(`vite build && vite preview`) before shipping, not just the dev server.

## Common Plugins

| Plugin | Purpose |
|---|---|
| `@vitejs/plugin-react` | React Fast Refresh via Babel or SWC |
| `@vitejs/plugin-vue` | Vue 3 SFC compilation |
| `vite-plugin-svgr` | Import SVGs as React components |
| `vite-tsconfig-paths` | Resolve `tsconfig.json` path aliases without duplicating them in `resolve.alias` |
| `vite-plugin-pwa` | Service worker + manifest generation for PWA (see `pwa` skill) |
| `rollup-plugin-visualizer` | Bundle size treemap for the production build |

## Environment Variables

```
# .env.local (gitignored — machine-specific overrides)
VITE_API_URL=http://localhost:8080

# .env.production
VITE_API_URL=https://api.example.com
```

Only variables prefixed `VITE_` are exposed to client code via `import.meta.env` — this is a
deliberate security boundary preventing server-only secrets from accidentally leaking into the
client bundle. Never prefix a secret with `VITE_`.

```ts
const apiUrl = import.meta.env.VITE_API_URL
const isDev = import.meta.env.DEV // boolean, set automatically
```

## Code Splitting

Vite code-splits automatically at dynamic `import()` boundaries — no configuration needed for the
common case:

```ts
// Route-level splitting (React Router, TanStack Router, etc.)
const Settings = lazy(() => import('./pages/Settings'))
```

For manual control over vendor chunk grouping (large apps with many third-party deps):

```ts
// vite.config.ts
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        vendor: ['react', 'react-dom'],
        charts: ['recharts', 'd3'],
      },
    },
  },
},
```

Don't manually chunk unless a real problem exists (a single oversized chunk, or vendor code
re-downloading on every deploy because it's bundled with app code) — Vite's automatic splitting is
correct for most apps.

## Performance Tuning

- **Slow cold start on a large app**: check `optimizeDeps.include`/`exclude` — Vite pre-bundles
  CommonJS/UMD dependencies with esbuild on first run; a dependency Vite fails to detect
  automatically can cause a full-page reload on first import.
- **Slow HMR**: usually caused by a barrel file (`index.ts` re-exporting dozens of modules) —
  editing any file behind the barrel invalidates the whole barrel's dependents. Prefer direct
  imports for frequently-edited modules.
- **Large production bundle**: run `vite build` with `rollup-plugin-visualizer` to see what's
  actually shipped before guessing. Check for duplicate versions of a dependency (`npm ls <pkg>`)
  pulled in by different transitive dependencies.
- **Slow production build time**: enable `build.minify: 'esbuild'` (default, fast) over `'terser'`
  (smaller output, much slower) unless the last few percent of bundle size matters more than build
  time.

## Migrating from Webpack / Create React App

1. Replace `webpack.config.js` with `vite.config.ts`; most loaders have a direct Vite/Rollup plugin equivalent.
2. Replace `process.env.REACT_APP_*` with `import.meta.env.VITE_*` (rename the env var prefix too).
3. Replace `public/index.html` placeholders (`%PUBLIC_URL%`) — Vite serves `index.html` as the entry point directly, with `<script type="module" src="/src/main.tsx">`.
4. CommonJS-only dependencies without an ESM build may need `optimizeDeps.include` or a CJS interop plugin.
5. Verify dynamic `require()` calls — Vite's dev server expects ESM; CJS `require()` at runtime (not build time) won't resolve the same way.

## Common Pitfalls

1. **Prefixing a secret with `VITE_`**: any `VITE_`-prefixed variable ships in the client bundle, readable by anyone — never put API secrets, only public config, behind that prefix.
2. **Barrel files killing HMR**: a large `index.ts` re-export file causes every change behind it to invalidate broadly.
3. **Assuming dev-server behavior matches production**: always verify with `vite build && vite preview` before shipping.
4. **Manual chunking without measuring first**: guessing at `manualChunks` config without a bundle visualizer often makes bundle size worse, not better.
5. **CommonJS dependency not in `optimizeDeps.include`**: causes a visible full-page reload the first time that module is imported in dev.

## Rules

1. Verify production behavior with `vite build && vite preview`, not the dev server alone, before shipping.
2. Never prefix a secret with `VITE_` — only `VITE_`-prefixed variables are safe to expose to the client.
3. Profile bundle size with a visualizer before manually configuring `manualChunks`.
4. Prefer direct imports over large barrel files for frequently-edited modules to keep HMR fast.
5. Pin the Vite major version in `package.json` — config surface changes between major versions.
