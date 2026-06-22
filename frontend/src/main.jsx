import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import ErrorBoundary from './components/common/ErrorBoundary.jsx'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './config/queryClient.js'

// 🌟 NEW: นำเข้า BrowserRouter จาก react-router-dom
import { BrowserRouter } from 'react-router-dom'

// ดึง App.jsx ของเราไปยัดใส่ใน index.html
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      {/* 🌟 ครอบ App ด้วย BrowserRouter เพื่อให้ระบบ Routing และ useNavigate ทำงานได้ */}
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  </React.StrictMode>,
)