import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Home from './pages/Home';
import StaffLogin from './pages/StaffLogin';
import BatchLogin from './pages/BatchLogin';
import ChairmanDashboard from './pages/ChairmanDashboard';
import ComputerOperatorDashboard from './pages/ComputerOperatorDashboard';
import CCDashboard from './pages/CCDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import CoordinatorDashboard from './pages/CoordinatorDashboard'; // Imported
import BatchDashboard from './pages/BatchDashboard';
import BatchFiles from './pages/BatchFiles'; // Added back
import { Loader } from './components/UI';

import './App.css';

const PrivateRoute = ({ children, role }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}><Loader /></div>;

  if (!user) return <Navigate to="/" />;

  // Role check
  if (role && user.role !== role) {
    // Handle redirect logic based on their actual role if they try accessing wrong route
    if (user.role === 'CHAIRMAN') return <Navigate to="/chairman" />;
    if (user.role === 'COORDINATOR') return <Navigate to="/coordinator" />; // Added
    if (user.role === 'COMPUTER_OPERATOR') return <Navigate to="/operator" />;
    if (user.role === 'CC') return <Navigate to="/cc" />;
    if (user.role === 'TEACHER') return <Navigate to="/teacher" />;
    if (user.role === 'BATCH') return <Navigate to="/batch" />;
    return <Navigate to="/" />;
  }

  return children;
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/staff-login" element={<StaffLogin />} />
          <Route path="/batch-login" element={<BatchLogin />} />

          <Route
            path="/chairman"
            element={<PrivateRoute role="CHAIRMAN"><ChairmanDashboard /></PrivateRoute>}
          />
          <Route
            path="/coordinator"
            element={<PrivateRoute role="COORDINATOR"><CoordinatorDashboard /></PrivateRoute>}
          />
          <Route
            path="/operator"
            element={<PrivateRoute role="COMPUTER_OPERATOR"><ComputerOperatorDashboard /></PrivateRoute>}
          />
          <Route
            path="/cc"
            element={<PrivateRoute role="CC"><CCDashboard /></PrivateRoute>}
          />
          <Route
            path="/teacher"
            element={<PrivateRoute role="TEACHER"><TeacherDashboard /></PrivateRoute>}
          />
          <Route
            path="/batch/*"
            element={<PrivateRoute role="BATCH"><BatchDashboard /></PrivateRoute>}
          />
          <Route
            path="/batch/teacher/:teacherId"
            element={<PrivateRoute role="BATCH"><BatchFiles /></PrivateRoute>}
          />
        </Routes>
        <Analytics />
      </Router>
    </AuthProvider>
  );
};

export default App;
