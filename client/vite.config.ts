import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./")
    }
  },
  server: {
    host: '0.0.0.0',  // This allows external connections
    port: 3000,       // Specify your desired port
    strictPort: true  // Fail if port is already in use
  }
})
