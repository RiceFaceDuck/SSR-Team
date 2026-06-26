import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service here
    console.error('ErrorBoundary caught an error', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white p-6">
          <div className="bg-slate-800 p-8 rounded-2xl shadow-2xl max-w-lg w-full text-center border border-red-500/30">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-red-500 text-3xl">⚠️</span>
            </div>
            <h1 className="text-2xl font-black mb-4">โอ๊ะโอ! มีบางอย่างผิดพลาด</h1>
            <p className="text-slate-400 mb-6 text-sm">
              ระบบเกิดข้อผิดพลาดในการแสดงผล กรุณารีเฟรชหน้าเว็บอีกครั้ง
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-colors w-full"
            >
              รีเฟรชหน้าเว็บ (Reload)
            </button>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mt-6 text-left bg-black/50 p-4 rounded-lg overflow-auto max-h-48 text-xs text-red-400 font-mono">
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
