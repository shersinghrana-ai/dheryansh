import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { MyReports } from './pages/MyReports';
import { AdminDashboard } from './pages/AdminDashboard';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-900">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/my-reports" element={<MyReports />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/map" element={<AdminDashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;