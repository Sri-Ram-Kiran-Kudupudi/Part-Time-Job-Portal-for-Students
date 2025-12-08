import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    global: 'window',   // ⭐ FIX: Prevent "global is not defined" for SockJS
  },
})


//// SockJS uses "global" like in Node.js, but browsers don't have global.
// Vite doesn't provide it automatically, so we map global → window to prevent errors.
