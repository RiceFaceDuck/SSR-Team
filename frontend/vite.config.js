import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// ตั้งค่าให้ Vite รัน React ได้
export default defineConfig({
  plugins: [react()],
})