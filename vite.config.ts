import { copyFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * Vite base（先頭・末尾スラッシュ付き）。
 * CI では VITE_BASE_PATH=/ringcraft-lab-clean/ を渡す。ルート公開は VITE_BASE_PATH=/
 */
function viteBaseFromEnv(): string {
  const raw = (process.env.VITE_BASE_PATH ?? '/ringcraft-lab-clean/').trim()
  if (raw === '' || raw === '/') return '/'
  const lead = raw.startsWith('/') ? raw : `/${raw}`
  return lead.endsWith('/') ? lead : `${lead}/`
}

const BASE = viteBaseFromEnv()

/** GitHub Pages: 直URL・リロード時に index を返す（SPA） */
function githubPagesSpaFallback() {
  return {
    name: 'github-pages-spa-fallback',
    closeBundle() {
      const out = resolve(__dirname, 'dist')
      copyFileSync(resolve(out, 'index.html'), resolve(out, '404.html'))
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  base: BASE,
  plugins: [react(), githubPagesSpaFallback()],
})
