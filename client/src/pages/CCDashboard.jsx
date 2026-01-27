import React, { useState, useEffect, useContext } from 'react';
import axios from '../utils/axiosConfig';
import { AuthContext } from '../context/AuthContext';
import { Layout } from '../components/Layout';
import { Loader, Toast } from '../components/UI';
import { FaBullhorn, FaLayerGroup } from 'react-icons/fa';

const CCDashboard = () => {
    const { user, loading: authLoading } = useContext(AuthContext);
    const [batches, setBatches] = useState([]);
    const [form, setForm] = useState({ title: '', content: '', target_batch: '', type: 'ANNOUNCEMENT' });
    const [toEveryone, setToEveryone] = useState(false);
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(null);

    const showToast = (message, type) => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3500);
    };

    useEffect(() => {
        const fetchBatches = async () => {
            try {
                const res = await axios.get('/batches');
                setBatches(res.data);
                if (res.data.length > 0) setForm(f => ({ ...f, target_batch: res.data[0]._id }));
            } catch (err) {
                console.error(err);
            }
        };
        fetchBatches();
    }, []);

    const publish = async (e) => {
        e.preventDefault();
        setLoading(true);

        const payload = {
            title: form.title,
            content: form.content,
            type: toEveryone ? 'NOTICE' : 'ANNOUNCEMENT',
            target_batch: toEveryone ? null : form.target_batch
        };

        try {
            await axios.post('/announcements', payload);
            showToast(toEveryone ? 'Global Announcement Published' : 'Batch Announcement Sent', 'success');
            setForm({ ...form, title: '', content: '' });
        } catch (err) {
            showToast('Failed to publish', 'error');
        } finally {
            setLoading(false);
        }
    };

    if (authLoading) return <Loader />;
    // Allow if role is CC OR (role is TEACHER and has assigned_batch)
    const isCC = user && (user.role === 'CC' || (user.role === 'TEACHER' && user.assigned_batch));

    if (!isCC) return <div style={{ padding: '2rem', textAlign: 'center' }}>Access Denied. You are not assigned as a Class Coordinator.</div>;

    return (
        <Layout>
            <div className="container" style={{ maxWidth: '800px' }}>
                {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

                <header style={{ marginBottom: '3rem', textAlign: 'center' }}>
                    <h1 style={{ color: 'var(--primary)' }}>Class Coordinator {user.assigned_batch ? '(Teacher Mode)' : ''}</h1>
                    <p style={{ color: 'var(--text-dim)' }}>Batch Announcements & Notifications</p>
                    {user.role === 'TEACHER' && (
                        <Link to="/teacher-dashboard" style={{ display: 'inline-block', marginTop: '1rem', color: 'var(--primary)', fontWeight: '600' }}>&larr; Back to Faculty Dashboard</Link>
                    )}
                </header>

                <div className="glass-panel fade-in">
                    <h3 style={{ marginBottom: '1.5rem' }}>Make an Announcement</h3>

                    <form onSubmit={publish}>
                        <div style={{ marginBottom: '1.5rem', background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #eee' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', marginBottom: toEveryone ? 0 : '1rem' }}>
                                <input type="checkbox" checked={toEveryone} onChange={e => setToEveryone(e.target.checked)} style={{ width: '20px', height: '20px', accentColor: 'var(--primary)' }} />
                                <span style={{ fontWeight: '600' }}>Broadcast to Everyone (Notice)</span>
                            </label>

                            {!toEveryone && (
                                <div className="fade-in">
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Select Target Batch</label>
                                    <select
                                        value={form.target_batch}
                                        onChange={e => setForm({ ...form, target_batch: e.target.value })}
                                        style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid #ddd' }}
                                    >
                                        {batches.map(b => (
                                            <option key={b._id} value={b._id}>{b.batch_name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>

                        <div style={{ marginBottom: '1rem' }}>
                            <input type="text" placeholder="Title / Subject" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ddd' }} />
                        </div>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <textarea rows="5" placeholder="Write your announcement here..." value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} required style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ddd', resize: 'vertical' }}></textarea>
                        </div>

                        <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%' }}>
                            {toEveryone ? 'Broadcast Notice' : 'Send to Batch'}
                        </button>
                    </form>
                </div>
            </div>
        </Layout>
    );
};

export default CCDashboard;
