import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { ArrowLeft, Lock, Mail } from 'lucide-react';

const TeacherLogin = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const { loginTeacher } = useContext(AuthContext);
    const navigate = useNavigate();

    const { email, password } = formData;

    const handleSubmit = async (e) => {
        e.preventDefault();
        const success = await loginTeacher(formData);
        if (success) {
            navigate('/teacher/dashboard');
        } else {
            alert('Login Failed');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 bg-[url('https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center relative">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative z-10 bg-white/10 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-white/20 w-full max-w-md"
            >
                <Link to="/" className="text-gray-300 hover:text-white flex items-center text-sm mb-6 transition-colors">
                    <ArrowLeft size={16} className="mr-1" /> Back to Home
                </Link>

                <h2 className="text-3xl font-bold text-white mb-2 text-center">Faculty Login</h2>
                <p className="text-gray-400 text-center mb-8">Access your dashboard and manage batches</p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="relative">
                        <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
                        <input
                            type="email"
                            placeholder="Email Address"
                            className="w-full pl-10 pr-4 py-3 bg-white/5 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                            value={email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                            required
                        />
                    </div>
                    <div className="relative">
                        <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
                        <input
                            type="password"
                            placeholder="Password"
                            className="w-full pl-10 pr-4 py-3 bg-white/5 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                            value={password}
                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                            required
                        />
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        className="w-full py-3 bg-indigo-600 text-white rounded-lg font-bold shadow-lg hover:bg-indigo-700 transition"
                    >
                        Sign In
                    </motion.button>
                </form>
                <p className="mt-6 text-center text-gray-400">
                    New Faculty? <Link to="/teacher/register" className="text-indigo-400 font-semibold hover:text-indigo-300">Register here</Link>
                </p>
            </motion.div>
        </div>
    );
};

export default TeacherLogin;
