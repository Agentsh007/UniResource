import React, { useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FaGraduationCap, FaSignOutAlt, FaCircle } from 'react-icons/fa';

export const Header = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const goToProfile = () => {
        if (!user) return;
        if (user.role === 'COORDINATOR') navigate('/coordinator?tab=profile');
        else if (user.role === 'TEACHER') navigate('/teacher?tab=profile');
        else if (user.role === 'BATCH') navigate('/batch?tab=folders'); // Batches don't have profile yet really, maybe just home
    };

    return (
        <header className="glass-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 2rem', background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 100 }}>
            <div className="logo-area" onClick={() => navigate('/')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <FaGraduationCap size={32} color="#4f46e5" />
                <h1 style={{ fontSize: '1.5rem', fontWeight: '800', background: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>UniRes</h1>
            </div>

            {user && (
                <div className="user-area" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <div
                        onClick={goToProfile}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', padding: '0.5rem 1rem', borderRadius: '50px', transition: 'all 0.2s', background: 'var(--surface)' }}
                        className="user-profile-trigger"
                    >
                        <div style={{ textAlign: 'right', lineHeight: '1.2' }}>
                            <div style={{ fontWeight: '600', fontSize: '0.9rem', color: 'var(--text-main)' }}>{user.name}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'capitalize' }}>{user.role ? user.role.toLowerCase() : ''}</div>
                        </div>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '1.1rem' }}>
                            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                    </div>

                    <button
                        onClick={logout}
                        className="btn-icon"
                        title="Logout"
                        style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#fef2f2', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #fee2e2' }}
                    >
                        <FaSignOutAlt size={16} />
                    </button>
                </div>
            )}
        </header>
    );
};

export const Footer = () => (
    <footer className="glass-footer">
        <p>© 2026 UniResource Platform</p>
        <div className="status-indicator" title="System Operational">
            <FaCircle size={10} color="#22c55e" />
            <span>Systems Online</span>
        </div>
    </footer>
);

export const Layout = ({ children }) => {
    const location = useLocation();
    // Don't show header/footer on login pages if desired, but consistency is better.
    // Let's show them everywhere for the "App" feel.

    return (
        <div className="app-layout">
            <Header />
            <main className="main-content fade-in">
                {children}
            </main>
            <Footer />
        </div>
    );
};
