import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Admin ErrorBoundary caught an error", error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 text-slate-900 p-6">
          <div className="bg-white p-8 rounded-2xl shadow-xl max-w-lg w-full text-center border border-red-200">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-red-600 text-3xl">⚠️</span>
            </div>
            <h1 className="text-2xl font-black mb-4 text-slate-800">เกิดข้อผิดพลาดในระบบ Admin</h1>
            <p className="text-slate-500 mb-6 text-sm">
              หน้าจอนี้พบปัญหาการประมวลผล กรุณารีเฟรชหน้าต่างเพื่อเริ่มต้นใหม่
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-slate-800 hover:bg-slate-900 text-white font-bold py-3 px-6 rounded-xl transition-colors w-full"
            >
              โหลดหน้าใหม่ (Reload)
            </button>
            {this.state.error && (
              <div className="mt-6 text-left bg-slate-100 p-4 rounded-lg overflow-auto max-h-48 text-xs text-red-600 font-mono border border-slate-200">
                <p className="font-bold">{this.state.error.toString()}</p>
                <p className="mt-2 text-slate-500">{this.state.errorInfo?.componentStack}</p>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;
