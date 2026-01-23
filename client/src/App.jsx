import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Landing from './pages/auth/Landing';
import TeacherLogin from './pages/auth/TeacherLogin';
import TeacherRegister from './pages/auth/TeacherRegister';
import BatchLogin from './pages/auth/BatchLogin';
// Placeholders for dashboard
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import StudentDashboard from './pages/student/StudentDashboard';
import PrivateRoute from './components/PrivateRoute';

import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-right" reverseOrder={false} />
        <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/teacher/login" element={<TeacherLogin />} />
            <Route path="/teacher/register" element={<TeacherRegister />} />
            <Route path="/student/login" element={<BatchLogin />} />

            {/* Protected Routes */}
            <Route path="/teacher/dashboard/*" element={
              <PrivateRoute role="TEACHER">
                <TeacherDashboard />
              </PrivateRoute>
            } />
            <Route path="/student/dashboard/*" element={
              <PrivateRoute role="BATCH">
                <StudentDashboard />
              </PrivateRoute>
            } />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
