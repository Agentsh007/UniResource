import { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import CreateBatch from './CreateBatch';
import UploadResource from './UploadResource';
import ViewBatches from './ViewBatches';
import Networking from './Networking';
import Profile from './Profile';
import MyResources from './MyResources';
import api from '../../services/api';
import AuthContext from '../../context/AuthContext';
import { useContext } from 'react';

const TeacherDashboard = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-indigo-900 text-white flex-shrink-0">
                <div className="p-6">
                    <h2 className="text-2xl font-bold">Faculty Panel</h2>
                </div>
                <nav className="mt-6 px-4 space-y-2">
                    <Link to="/teacher/dashboard" className="block py-2.5 px-4 rounded transition hover:bg-indigo-800">
                        Overview
                    </Link>
                    <Link to="/teacher/dashboard/batches" className="block py-2.5 px-4 rounded transition hover:bg-indigo-800">
                        Manage Batches
                    </Link>
                    <Link to="/teacher/dashboard/upload" className="block py-2.5 px-4 rounded transition hover:bg-indigo-800">
                        Upload Resource
                    </Link>
                    <Link to="/teacher/dashboard/resources" className="block py-2.5 px-4 rounded transition hover:bg-indigo-800">
                        My Resources
                    </Link>
                    <Link to="/teacher/dashboard/networking" className="block py-2.5 px-4 rounded transition hover:bg-indigo-800">
                        Networking
                    </Link>
                    <Link to="/teacher/dashboard/profile" className="block py-2.5 px-4 rounded transition hover:bg-indigo-800">
                        Profile
                    </Link>
                    <button
                        onClick={() => {
                            localStorage.removeItem('token');
                            window.location.href = '/';
                        }}
                        className="w-full text-left block py-2.5 px-4 rounded transition hover:bg-red-600 mt-10"
                    >
                        Logout
                    </button>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 overflow-y-auto">
                <Routes>
                    <Route path="/" element={<DashboardOverview />} />
                    <Route path="batches" element={<ViewBatches />} />
                    <Route path="create-batch" element={<CreateBatch />} />
                    <Route path="upload" element={<UploadResource />} />
                    <Route path="resources" element={<MyResources />} />
                    <Route path="networking" element={<Networking />} />
                    <Route path="profile" element={<Profile />} />
                </Routes>
            </main>
        </div>
    );
};

const DashboardOverview = () => {
    const [stats, setStats] = useState({ batches: 0, resources: 0, unreadMessages: 0 });
    const { user } = useContext(AuthContext) || {}; // Handle safe access

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('/teacher/stats');
                setStats(res.data);
            } catch (err) {
                console.error("Error fetching stats:", err);
            }
        };
        fetchStats();
    }, []);

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800">Welcome, {user?.name || "Professor"}</h1>
            <p className="mt-2 text-gray-600">Here's what's happening in your classroom today.</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 flex flex-col justify-between h-full hover:shadow-lg transition">
                    <div>
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-bold text-indigo-700">My Batches</h3>
                            <span className="bg-indigo-100 text-indigo-800 text-sm font-bold px-3 py-1 rounded-full">{stats.batches} Active</span>
                        </div>
                        <p className="text-gray-500 mt-2">Manage your student groups and credentials.</p>
                    </div>
                    <Link to="/teacher/dashboard/batches" className="mt-6 inline-block text-indigo-600 font-semibold hover:underline">Manage Batches &rarr;</Link>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 flex flex-col justify-between h-full hover:shadow-lg transition">
                    <div>
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-bold text-indigo-700">Resources</h3>
                            <span className="bg-indigo-100 text-indigo-800 text-sm font-bold px-3 py-1 rounded-full">{stats.resources} Shared</span>
                        </div>
                        <p className="text-gray-500 mt-2">Upload notes, assignments, or announcements.</p>
                    </div>
                    <Link to="/teacher/dashboard/upload" className="mt-6 inline-block text-indigo-600 font-semibold hover:underline">Upload Items &rarr;</Link>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 flex flex-col justify-between h-full hover:shadow-lg transition">
                    <div>
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-bold text-indigo-700">Inbox</h3>
                            {stats.unreadMessages > 0 && (
                                <span className="bg-red-100 text-red-800 text-sm font-bold px-3 py-1 rounded-full">{stats.unreadMessages} New</span>
                            )}
                        </div>
                        <p className="text-gray-500 mt-2">Connect with other faculty members.</p>
                    </div>
                    <Link to="/teacher/dashboard/networking" className="mt-6 inline-block text-indigo-600 font-semibold hover:underline">View Messages &rarr;</Link>
                </div>
            </div>
        </div>
    );
};

export default TeacherDashboard;
