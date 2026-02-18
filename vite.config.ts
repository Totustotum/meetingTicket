import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/scheduling-app/', // Change this to your GitHub repo name, or '/' if repo is username.github.io
})
