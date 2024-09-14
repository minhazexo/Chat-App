import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',             // Bind the server to 0.0.0.0 to expose it externally
    port: process.env.PORT || 5173,  // Use PORT from environment variable or fallback to 5173
  }
})
