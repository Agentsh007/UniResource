import { useState, useContext, useEffect } from 'react';
import api from '../../services/api';
import AuthContext from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { User, Mail, Building, Lock, Save } from 'lucide-react';

const Profile = () => {
    const { user, loginTeacher } = useContext(AuthContext); // Re-using loginTeacher to update context if needed, or we might need a better way to update context user
    const [formData, setFormData] = useState({
        name: '',
        department: '',
        email: '',
        password: '' // Optional for update
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                department: user.department || '',
                email: user.email || '',
                password: ''
            });
        }
    }, [user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Only send password if it's not empty
            const payload = { ...formData };
            if (!payload.password) delete payload.password;

            const res = await api.put('/auth/teacher/profile', payload);

            // Update token in localStorage with the new one containing updated details
            if (res.data.token) {
                localStorage.setItem('token', res.data.token);
                alert('Profile Updated Successfully!');
                window.location.reload(); // Reload to re-initialize auth context from new token
            }
        } catch (err) {
            console.error(err);
            alert('Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
            >
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-10 text-white">
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <User size={32} />
                        My Profile
                    </h1>
                    <p className="opacity-80 mt-2">Manage your account settings and preferences.</p>
                </div>

                <div className="p-8">
                    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-3 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Department</label>
                                <div className="relative">
                                    <Building className="absolute left-3 top-3 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                        value={formData.department}
                                        onChange={e => setFormData({ ...formData, department: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
                                <input
                                    type="email"
                                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="pt-6 border-t border-gray-100">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Security</h3>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">New Password (Optional)</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
                                    <input
                                        type="password"
                                        placeholder="Leave blank to keep current password"
                                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                        value={formData.password}
                                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-6">
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-indigo-700 transition disabled:opacity-50"
                            >
                                <Save size={20} />
                                {loading ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            </motion.div>
        </div>
    );
};

export default Profile;
