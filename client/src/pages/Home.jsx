import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUserTie, FaUsers, FaArrowRight, FaBullhorn } from 'react-icons/fa'; // Added FaBullhorn
import { AuthContext } from '../context/AuthContext';
import { Layout } from '../components/Layout';
import axios from '../utils/axiosConfig'; // Added axios

const Home = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [notices, setNotices] = useState([]);
    const [loadingNotices, setLoadingNotices] = useState(true);

    useEffect(() => {
        const fetchNotices = async () => {
            try {
                const res = await axios.get('/announcements/public');
                setNotices(res.data);
            } catch (err) {
                console.error("Failed to fetch notices");
            } finally {
                setLoadingNotices(false);
            }
        };
        fetchNotices();
    }, []);

    const goToDashboard = () => {
        if (!user) return;
        if (user.role === 'CHAIRMAN') navigate('/chairman');
        else if (user.role === 'COMPUTER_OPERATOR') navigate('/operator');
        else if (user.role === 'CC') navigate('/cc');
        else if (user.role === 'TEACHER') navigate('/teacher');
        else if (user.role === 'BATCH') navigate('/batch');
    };

    return (
        <Layout>
            <div className="container fade-in" style={{ minHeight: '80vh', padding: '2rem 0' }}>
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <h1 style={{ fontSize: '3rem', marginBottom: '0.5rem', color: 'var(--primary)' }}>
                        UniResource
                    </h1>
                    <p style={{ fontSize: '1.2rem', color: 'var(--text-dim)', maxWidth: '600px', margin: '0 auto' }}>
                        Centralized University Resource & Announcement Platform
                    </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '4rem' }}>

                    {/* Notices Section */}
                    <div>
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <FaBullhorn color="#f59e0b" /> Department Notices
                        </h2>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {loadingNotices ? <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-dim)' }}>Loading updates...</div> :
                                notices.length === 0 ?
                                    <div style={{ padding: '2rem', background: '#f8fafc', borderRadius: '12px', textAlign: 'center', color: 'var(--text-dim)', border: '1px solid #e2e8f0' }}>No recent notices.</div> :
                                    notices.map(notice => (
                                        <div key={notice._id} style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.03)', borderLeft: '4px solid #f59e0b', border: '1px solid #e2e8f0', borderLeftWidth: '4px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', alignItems: 'flex-start' }}>
                                                <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-main)' }}>{notice.title}</h3>
                                                <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', background: '#f1f5f9', padding: '2px 8px', borderRadius: '6px', whiteSpace: 'nowrap' }}>
                                                    {new Date(notice.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <p style={{ color: '#475569', lineHeight: '1.5', margin: 0, whiteSpace: 'pre-wrap', fontSize: '0.95rem' }}>{notice.content}</p>
                                        </div>
                                    ))
                            }
                        </div>
                    </div>

                    {/* Login/Dashboard Section */}
                    <div>
                        <div className="glass-panel" style={{ padding: '2rem', border: '1px solid #e2e8f0' }}>
                            {!user ? (
                                <>
                                    <h2 style={{ textAlign: 'center', marginBottom: '2rem', fontSize: '1.5rem', color: 'var(--primary)' }}>Login Portal</h2>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        <Link to="/batch-login" style={{ textDecoration: 'none' }}>
                                            <div style={{ background: 'white', padding: '1.25rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '1rem', border: '1px solid #e2e8f0', transition: '0.2s', cursor: 'pointer' }} className="hover-shadow">
                                                <div style={{ background: '#eff6ff', padding: '10px', borderRadius: '8px' }}><FaUsers size={20} color="#3b82f6" /></div>
                                                <div>
                                                    <div style={{ fontWeight: '600', color: 'var(--text-main)' }}>Student Login</div>
                                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>Access batch resources</div>
                                                </div>
                                            </div>
                                        </Link>

                                        <Link to="/staff-login" style={{ textDecoration: 'none' }}>
                                            <div style={{ background: 'white', padding: '1.25rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '1rem', border: '1px solid #e2e8f0', transition: '0.2s', cursor: 'pointer' }} className="hover-shadow">
                                                <div style={{ background: '#f0fdf4', padding: '10px', borderRadius: '8px' }}><FaUserTie size={20} color="#22c55e" /></div>
                                                <div>
                                                    <div style={{ fontWeight: '600', color: 'var(--text-main)' }}>Faculty Login</div>
                                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>Teachers & Administration</div>
                                                </div>
                                            </div>
                                        </Link>
                                    </div>
                                </>
                            ) : (
                                <div style={{ textAlign: 'center' }}>
                                    <h2 style={{ marginBottom: '1rem', color: 'var(--text-main)' }}>Welcome, {user.name}</h2>
                                    <p style={{ color: 'var(--text-dim)', marginBottom: '2rem' }}>You are logged in as {user.role}.</p>
                                    <button onClick={goToDashboard} className="btn-primary" style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
                                        Go to Dashboard <FaArrowRight />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </Layout>
    );
};

export default Home;
