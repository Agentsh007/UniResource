import { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import MyClassroom from './MyClassroom';
import UniversityHub from './UniversityHub';

const StudentDashboard = () => {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Top Navbar */}
            <nav className="bg-purple-900 text-white shadow-lg">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex items-center">
                            <h1 className="text-xl font-bold">Student Portal</h1>
                            <div className="ml-10 flex space-x-4">
                                <Link to="/student/dashboard" className="px-3 py-2 rounded-md hover:bg-purple-800 transition">My Classroom</Link>
                                <Link to="hub" className="px-3 py-2 rounded-md hover:bg-purple-800 transition">University Hub</Link>
                            </div>
                        </div>
                        <button
                            onClick={() => {
                                localStorage.removeItem('token');
                                window.location.href = '/';
                            }}
                            className="bg-purple-800 hover:bg-purple-700 px-4 py-2 rounded text-sm transition"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </nav>

            <main className="flex-1 max-w-7xl w-full mx-auto p-6">
                <Routes>
                    <Route path="/" element={<MyClassroom />} />
                    <Route path="hub" element={<UniversityHub />} />
                </Routes>
            </main>
        </div>
    );
};

export default StudentDashboard;
