import React, { useState, useEffect, useContext } from 'react';
import axios from '../utils/axiosConfig';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { FaFolder, FaPaperPlane, FaBars, FaTimes, FaBell, FaBullhorn } from 'react-icons/fa';

import { Layout } from '../components/Layout';

const BatchDashboard = () => {
    const { user } = useContext(AuthContext);
    const [activeTab, setActiveTab] = useState('notices'); // notices, folders, feedback
    const [teachers, setTeachers] = useState([]);
    const [announcements, setAnnouncements] = useState([]);
    const [feedbackMsg, setFeedbackMsg] = useState('');
    const [sentMsg, setSentMsg] = useState('');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const teachersRes = await axios.get(`/documents/batch/${user.id}/teachers`);
                setTeachers(teachersRes.data);

                const annRes = await axios.get('/announcements');
                setAnnouncements(annRes.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchData();
    }, [user.id]);

    const sendFeedback = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/feedback', { message_content: feedbackMsg });
            setSentMsg('Feedback Sent to Head Authority!');
            setFeedbackMsg('');
            setTimeout(() => setSentMsg(''), 3000);
        } catch (err) {
            setSentMsg('Failed to send');
        }
    };

    const renderTabButton = (id, label, icon) => (
        <button
            onClick={() => { setActiveTab(id); setMobileMenuOpen(false); }}
            className={`btn-tab ${activeTab === id ? 'active' : ''}`}
            style={{
                padding: '0.75rem 1.5rem',
                borderRadius: '12px',
                border: 'none',
                background: activeTab === id ? 'var(--primary)' : 'var(--surface)',
                color: activeTab === id ? 'white' : 'var(--text-main)',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '600',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)', transition: '0.2s',
                fontSize: '1rem'
            }}
        >
            {icon} {label}
        </button>
    );

    return (
        <Layout>
            <div className="container" style={{ maxWidth: '1000px' }}>

                {/* Mobile Menu Toggle */}
                <button
                    className="mobile-menu-toggle"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        {mobileMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
                        <span>Menu</span>
                    </div>
                </button>

                {/* Overlay */}
                <div
                    className={`menu-overlay ${mobileMenuOpen ? 'open' : ''}`}
                    onClick={() => setMobileMenuOpen(false)}
                />

                {/* Tab Menu */}
                <div className={`tab-menu ${mobileMenuOpen ? 'open' : ''}`} style={{ marginBottom: '2rem' }}>
                    {renderTabButton('notices', 'Notices & Announcements', <FaBell />)}
                    {renderTabButton('folders', 'Faculty Folders', <FaFolder />)}
                    {renderTabButton('feedback', 'Send Feedback', <FaPaperPlane />)}
                </div>

                <div className="glass-panel fade-in" style={{ minHeight: '400px' }}>

                    {activeTab === 'notices' && (
                        <div>
                            <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>Department Notices</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {announcements.length === 0 ? <p style={{ color: 'var(--text-dim)', textAlign: 'center' }}>No new notices.</p> :
                                    announcements.map(ann => (
                                        <div key={ann._id} style={{
                                            background: ann.type === 'NOTICE' ? '#fff7ed' : '#f0f9ff',
                                            borderLeft: `4px solid ${ann.type === 'NOTICE' ? '#f97316' : '#3b82f6'}`,
                                            padding: '1.5rem',
                                            borderRadius: '8px',
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.03)'
                                        }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                                <h4 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-main)' }}>
                                                    {ann.type === 'NOTICE' && <FaBullhorn style={{ marginRight: '0.5rem', color: '#f97316' }} />}
                                                    {ann.title}
                                                </h4>
                                                <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', background: 'rgba(255,255,255,0.5)', padding: '2px 8px', borderRadius: '10px' }}>
                                                    {new Date(ann.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <p style={{ margin: '0 0 0.5rem 0', color: 'var(--text-main)', whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>{ann.content}</p>
                                            <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginTop: '0.5rem', borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '0.5rem' }}>
                                                From: <span style={{ fontWeight: '500' }}>{ann.author?.full_name}</span> ({ann.type === 'NOTICE' ? 'Department Notice' : 'Batch Announcement'})
                                            </div>
                                        </div>
                                    ))
                                }
                            </div>
                        </div>
                    )}

                    {activeTab === 'folders' && (
                        <div>
                            <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>Faculty Folders</h3>
                            <p style={{ color: 'var(--text-dim)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                                Browse resources by Teacher. Folders appear only when content is uploaded.
                            </p>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem' }}>
                                {teachers.length === 0 ? <p style={{ color: 'var(--text-dim)' }}>No resources found yet.</p> :
                                    teachers.map(teacher => (
                                        <Link key={teacher._id} to={`/batch/teacher/${teacher._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                            <div className="interactive-card" style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '16px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s', border: '1px solid #e2e8f0' }}>
                                                <div style={{ background: '#fef3c7', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
                                                    <FaFolder size={28} color="#d97706" />
                                                </div>
                                                <div style={{ fontWeight: '600', fontSize: '0.95rem', color: 'var(--text-main)' }}>{teacher.full_name}</div>
                                            </div>
                                        </Link>
                                    ))
                                }
                            </div>
                        </div>
                    )}

                    {activeTab === 'feedback' && (
                        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                            <h3 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Contact Head Authority</h3>
                            {sentMsg && <p style={{ textAlign: 'center', color: sentMsg.includes('Failed') ? 'var(--error)' : 'var(--success)', marginBottom: '1rem' }}>{sentMsg}</p>}
                            <form onSubmit={sendFeedback}>
                                <textarea
                                    rows="6"
                                    placeholder="Message to Chairman... (e.g., Request for materials, Class scheduling issue)"
                                    value={feedbackMsg}
                                    onChange={e => setFeedbackMsg(e.target.value)}
                                    required
                                    style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid #ddd', marginBottom: '1rem', resize: 'vertical' }}
                                ></textarea>
                                <button type="submit" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center', width: '100%' }}>
                                    <FaPaperPlane /> Send Feedback
                                </button>
                            </form>
                        </div>
                    )}

                </div>
            </div>
        </Layout>
    );
};

export default BatchDashboard;
