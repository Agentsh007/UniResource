import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { ArrowLeft, Users, Key } from 'lucide-react';

const BatchLogin = () => {
    const [formData, setFormData] = useState({ username: '', password: '' });
    const { loginBatch } = useContext(AuthContext);
    const navigate = useNavigate();

    const { username, password } = formData;

    const handleSubmit = async (e) => {
        e.preventDefault();
        const success = await loginBatch(formData);
        if (success) {
            navigate('/student/dashboard');
        } else {
            alert('Login Failed');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 bg-[url('https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center relative">
            <div className="absolute inset-0 bg-indigo-900/80 backdrop-blur-sm"></div>

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative z-10 bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md border-4 border-white/20"
            >
                <Link to="/" className="text-gray-500 hover:text-indigo-600 flex items-center text-sm mb-6 transition-colors">
                    <ArrowLeft size={16} className="mr-1" /> Back to Home
                </Link>

                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-600">
                        <Users size={32} />
                    </div>
                    <h2 className="text-3xl font-extrabold text-gray-800">Student Portal</h2>
                    <p className="text-gray-500 mt-2">Enter your batch credentials to access the classroom.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="relative">
                        <Users className="absolute left-3 top-3 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Batch Username"
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium"
                            value={username}
                            onChange={e => setFormData({ ...formData, username: e.target.value })}
                            required
                        />
                    </div>
                    <div className="relative">
                        <Key className="absolute left-3 top-3 text-gray-400" size={20} />
                        <input
                            type="password"
                            placeholder="Batch Password"
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium"
                            value={password}
                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                            required
                        />
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg hover:bg-indigo-700 transition"
                    >
                        Enter Classroom
                    </motion.button>
                </form>
            </motion.div>
        </div>
    );
};

export default BatchLogin;
