import React from 'react';
import Sidebar from './Sidebar';

export default function AdminLayout({ children, currentPath, setPath }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar currentPath={currentPath} setPath={setPath} />
      <div className="flex-1 bg-slate-50 p-8">{children}</div>
    </div>
  );
}
