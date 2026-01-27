import React, { useState, useEffect, useContext } from 'react';
import axios from '../utils/axiosConfig';
import { AuthContext } from '../context/AuthContext';
import { Layout } from '../components/Layout';
import { Loader, Toast } from '../components/UI';
import { FaBullhorn, FaHistory } from 'react-icons/fa';

const ComputerOperatorDashboard = () => {
    const { user, loading: authLoading } = useContext(AuthContext);
    const [noticeForm, setNoticeForm] = useState({ title: '', content: '' });
    const [myNotices, setMyNotices] = useState([]);
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(null);

    const showToast = (message, type) => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3500);
    };

    useEffect(() => {
        fetchNotices();
    }, []);

    const fetchNotices = async () => {
        try {
            const res = await axios.get('/announcements');
            // Filter locally for simplicity to show only what I might have posted or all global notices
            // Since API returns all, let's just show all notices
            const notices = res.data.filter(a => a.type === 'NOTICE');
            setMyNotices(notices);
        } catch (err) {
            console.error(err);
        }
    };

    const postNotice = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post('/announcements', { ...noticeForm, type: 'NOTICE', target_batch: null });
            showToast('Notice Posted Successfully', 'success');
            setNoticeForm({ title: '', content: '' });
            fetchNotices();
        } catch (err) {
            showToast('Failed to post notice', 'error');
        } finally {
            setLoading(false);
        }
    };

    if (authLoading) return <Loader />;
    if (!user || user.role !== 'COMPUTER_OPERATOR') return null;

    return (
        <Layout>
            <div className="container" style={{ maxWidth: '900px' }}>
                {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

                <header style={{ marginBottom: '3rem', textAlign: 'center' }}>
                    <h1 style={{ color: 'var(--primary)' }}>Computer Operator</h1>
                    <p style={{ color: 'var(--text-dim)' }}>Department Notice Board Management</p>
                </header>

                <div className="glass-panel fade-in">
                    <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FaBullhorn color="#f59e0b" /> Post New Notice
                    </h3>
                    <form onSubmit={postNotice}>
                        <div style={{ marginBottom: '1rem' }}>
                            <input type="text" placeholder="Notice Title (e.g. Eid Holidays)" value={noticeForm.title} onChange={e => setNoticeForm({ ...noticeForm, title: e.target.value })} required style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1rem' }} />
                        </div>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <textarea rows="5" placeholder="Notice Details..." value={noticeForm.content} onChange={e => setNoticeForm({ ...noticeForm, content: e.target.value })} required style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ddd', resize: 'vertical', fontSize: '1rem' }}></textarea>
                        </div>
                        <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%' }}>Publish Notice</button>
                    </form>
                </div>

                <div style={{ marginTop: '3rem' }}>
                    <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FaHistory /> Recent Notices
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {myNotices.map(n => (
                            <div key={n._id} className="interactive-card" style={{ padding: '1.5rem', background: 'white', borderRadius: '12px', borderLeft: '4px solid #f59e0b', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                                <div style={{ fontWeight: '700', fontSize: '1.1rem', marginBottom: '0.5rem' }}>{n.title}</div>
                                <p style={{ color: 'var(--text-main)', margin: '0 0 0.5rem 0', whiteSpace: 'pre-wrap' }}>{n.content}</p>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>
                                    Posted by: {n.author.full_name} on {new Date(n.created_at).toLocaleDateString()}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default ComputerOperatorDashboard;
