import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GraduationCap, Users, BookOpen, ArrowRight } from 'lucide-react';

const Landing = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-black text-white overflow-hidden relative">
            {/* Background Blobs */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-32 left-20 w-96 h-96 bg-pink-600 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>

            <nav className="relative z-10 flex justify-between items-center px-8 py-6 max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center space-x-2"
                >
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-indigo-900 shadow-lg">
                        <GraduationCap size={24} />
                    </div>
                    <span className="text-xl font-bold tracking-tight">UniResource<span className="text-indigo-400">Hub</span></span>
                </motion.div>
                <div className="space-x-4">
                    <Link to="/teacher/login" className="text-sm font-semibold hover:text-indigo-300 transition">Faculty Access</Link>
                    <Link to="/student/login" className="px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-sm font-semibold hover:bg-white/20 transition">Student Portal</Link>
                </div>
            </nav>

            <main className="relative z-10 flex flex-col items-center justify-center text-center mt-20 px-4">
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-6xl md:text-8xl font-extrabold tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400"
                >
                    Knowledge <br className="hidden md:block" /> Without Borders
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-xl text-gray-300 max-w-2xl mb-10 leading-relaxed"
                >
                    The next-generation platform for university resource sharing.
                    Connect faculty with students through a secure, batch-specific digital ecosystem.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="flex flex-col sm:flex-row gap-4"
                >
                    <Link to="/teacher/login" className="group px-8 py-4 bg-white text-indigo-900 rounded-full font-bold text-lg shadow-xl hover:bg-gray-100 transition flex items-center">
                        Generic Faculty Portal
                        <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <Link to="/student/login" className="px-8 py-4 bg-white/5 backdrop-blur-md border border-white/10 text-white rounded-full font-bold text-lg hover:bg-white/10 transition">
                        Enter Classroom &rarr;
                    </Link>
                </motion.div>

                {/* Feature Cards */}
                <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full px-4">
                    <FeatureCard
                        icon={<Users className="w-8 h-8 text-blue-400" />}
                        title="Batch Architecture"
                        description="Secure, isolated environments for each student cohort. One login for the whole class."
                        delay={0.8}
                    />
                    <FeatureCard
                        icon={<BookOpen className="w-8 h-8 text-pink-400" />}
                        title="Smart Sharing"
                        description="Distribute resources privately to batches or publish globally to the university hub."
                        delay={0.9}
                    />
                    <FeatureCard
                        icon={<GraduationCap className="w-8 h-8 text-green-400" />}
                        title="Faculty Network"
                        description="Connect with other professors, share curriculum, and collaborate seamlessly."
                        delay={1.0}
                    />
                </div>
            </main>
        </div>
    );
};

const FeatureCard = ({ icon, title, description, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        className="p-6 rounded-2xl bg-white/5 backdrop-blur-lg border border-white/10 hover:border-white/20 transition hover:transform hover:-translate-y-2 cursor-default"
    >
        <div className="mb-4">{icon}</div>
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-gray-400 leading-relaxed">{description}</p>
    </motion.div>
);

export default Landing;
