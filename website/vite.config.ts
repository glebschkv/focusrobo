import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: { port: 3000 },
  css: {
    // Inline empty PostCSS config prevents Vite from walking up to
    // the root project's Tailwind v3 PostCSS config.
    // Tailwind v4 is handled entirely by the @tailwindcss/vite plugin above.
    postcss: { plugins: [] },
  },
})
