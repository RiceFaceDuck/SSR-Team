import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import ErrorBoundary from './components/common/ErrorBoundary.jsx'

// 🌟 NEW: นำเข้า BrowserRouter จาก react-router-dom
import { BrowserRouter } from 'react-router-dom'

// ดึง App.jsx ของเราไปยัดใส่ใน index.html
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      {/* 🌟 ครอบ App ด้วย BrowserRouter เพื่อให้ระบบ Routing และ useNavigate ทำงานได้ */}
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>,
)