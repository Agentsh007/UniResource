import React, { useState, useEffect, useContext } from 'react';
import axios from '../utils/axiosConfig';
import { AuthContext } from '../context/AuthContext';
import { Loader, Toast } from '../components/UI';
import { Layout } from '../components/Layout';
import { FaTrash, FaPlus, FaList, FaComments, FaBars, FaTimes, FaUserShield, FaDesktop } from 'react-icons/fa';
import { useLocation, useNavigate } from 'react-router-dom';

const ChairmanDashboard = () => {
    const { user, loadUser, loading: authLoading } = useContext(AuthContext);
    const location = useLocation();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('manage-batches');
    const [batches, setBatches] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [feedback, setFeedback] = useState([]);
    const [batchForm, setBatchForm] = useState({ batch_name: '', batch_username: '', batch_password: '' });
    const [staffForm, setStaffForm] = useState({ full_name: '', email: '', password: '', role: 'CC', department: '', teacher_id: '', batch_id: '' });

    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [toast, setToast] = useState(null);
    const [loading, setLoading] = useState(false);

    const showToast = (message, type = 'error') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3500);
    };

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const tab = params.get('tab');
        if (tab) setActiveTab(tab);
    }, [location.search]);

    useEffect(() => {
        if (activeTab === 'manage-batches') fetchBatches();
        if (activeTab === 'assign-staff') { fetchBatches(); fetchTeachers(); }
        if (activeTab === 'feedback') fetchFeedback();
    }, [activeTab]);

    const fetchBatches = async () => {
        try {
            const res = await axios.get('/batches');
            setBatches(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchFeedback = async () => {
        try {
            const res = await axios.get('/feedback');
            setFeedback(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchTeachers = async () => {
        try {
            const res = await axios.get('/auth/teachers');
            setTeachers(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const createBatch = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post('/batches', batchForm);
            showToast('Batch Created Successfully!', 'success');
            setBatchForm({ batch_name: '', batch_username: '', batch_password: '' });
            fetchBatches();
        } catch (err) {
            showToast(err.response?.data?.msg || 'Error creating batch', 'error');
        } finally {
            setLoading(false);
        }
    };

    const deleteBatch = async (id) => {
        if (!window.confirm('Are you sure? This will delete the batch and all associated data.')) return;
        setLoading(true);
        try {
            await axios.delete(`/batches/${id}`);
            showToast('Batch deleted', 'success');
            fetchBatches();
        } catch (err) {
            showToast('Error deleting batch', 'error');
        } finally {
            setLoading(false);
        }
    };

    const createStaff = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post('/auth/create-staff', staffForm);
            showToast(`${staffForm.role} created successfully!`, 'success');
            setStaffForm({ ...staffForm, full_name: '', email: '', password: '' });
        } catch (err) {
            showToast(err.response?.data?.msg || 'Error creating staff', 'error');
        } finally {
            setLoading(false);
        }
    };

    const assignCC = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.put('/auth/assign-cc', {
                teacher_id: staffForm.teacher_id,
                batch_id: staffForm.batch_id
            });
            showToast('Teacher assigned as CC successfully!', 'success');
            setStaffForm({ ...staffForm, teacher_id: '', batch_id: '' });
        } catch (err) {
            showToast(err.response?.data?.msg || 'Error assigning CC', 'error');
        } finally {
            setLoading(false);
        }
    };

    const deleteFeedback = async (id) => {
        if (!window.confirm('Delete this feedback?')) return;
        try {
            await axios.delete(`/feedback/${id}`);
            fetchFeedback();
            showToast('Feedback deleted', 'success');
        } catch (err) {
            showToast('Failed to delete feedback', 'error');
        }
    };

    if (authLoading) return <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}><Loader /></div>;
    if (!user || user.role !== 'CHAIRMAN') return null;

    const renderTabButton = (id, label, icon) => (
        <button
            onClick={() => { navigate(`?tab=${id}`); setMobileMenuOpen(false); }}
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
            <div className="container" style={{ maxWidth: '1100px' }}>
                {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

                <header style={{ marginBottom: '2rem' }}>
                    <h1 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>Chairman Dashboard</h1>
                    <p style={{ color: 'var(--text-dim)' }}>Department Administration Hub</p>
                </header>

                {/* Mobile Menu Toggle - Simplified for brevity */}
                <button className="mobile-menu-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} style={{ marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        {mobileMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
                        <span>Menu</span>
                    </div>
                </button>
                <div className={`menu-overlay ${mobileMenuOpen ? 'open' : ''}`} onClick={() => setMobileMenuOpen(false)} />

                <div className={`tab-menu ${mobileMenuOpen ? 'open' : ''}`} style={{ marginBottom: '2rem' }}>
                    {renderTabButton('manage-batches', 'Batches', <FaList />)}
                    {renderTabButton('assign-staff', 'Assign Staff (CC/Operator)', <FaUserShield />)}
                    {renderTabButton('feedback', 'Student Feedback', <FaComments />)}
                </div>

                <div className="glass-panel fade-in" style={{ minHeight: '500px' }}>

                    {activeTab === 'manage-batches' && (
                        <div>
                            <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>Batch Management</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                                <div>
                                    <h4 style={{ marginBottom: '1rem' }}>Create New Batch</h4>
                                    <form onSubmit={createBatch} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        <input type="text" placeholder="Batch Name (e.g. CSE-24)" value={batchForm.batch_name} onChange={e => setBatchForm({ ...batchForm, batch_name: e.target.value })} required style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid #ddd' }} />
                                        <input type="text" placeholder="Batch Username" value={batchForm.batch_username} onChange={e => setBatchForm({ ...batchForm, batch_username: e.target.value })} required style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid #ddd' }} />
                                        <input type="text" placeholder="Password" value={batchForm.batch_password} onChange={e => setBatchForm({ ...batchForm, batch_password: e.target.value })} required style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid #ddd' }} />
                                        <button type="submit" className="btn-primary" disabled={loading}>Create Batch</button>
                                    </form>
                                </div>
                                <div>
                                    <h4 style={{ marginBottom: '1rem' }}>Existing Batches</h4>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '400px', overflowY: 'auto' }}>
                                        {batches.length === 0 ? <p style={{ color: 'var(--text-dim)' }}>No batches found.</p> :
                                            batches.map(b => (
                                                <div key={b._id} style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <div>
                                                        <div style={{ fontWeight: '600' }}>{b.batch_name}</div>
                                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>@{b.batch_username}</div>
                                                    </div>
                                                    <button onClick={() => deleteBatch(b._id)} className="btn-icon" style={{ color: '#ef4444', background: '#fee2e2' }}><FaTrash /></button>
                                                </div>
                                            ))
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'assign-staff' && (
                        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                            <h3 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Assign Staff</h3>

                            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                                <button onClick={() => setStaffForm(s => ({ ...s, role: 'CC' }))} className={`btn-tab ${staffForm.role === 'CC' ? 'active' : ''}`} style={{ flex: 1, padding: '1rem', borderRadius: '8px', border: staffForm.role === 'CC' ? '2px solid var(--primary)' : '1px solid #ddd', background: staffForm.role === 'CC' ? 'var(--primary-fade)' : 'white' }}>Assign Class Coordinator</button>
                                <button onClick={() => setStaffForm(s => ({ ...s, role: 'COMPUTER_OPERATOR' }))} className={`btn-tab ${staffForm.role === 'COMPUTER_OPERATOR' ? 'active' : ''}`} style={{ flex: 1, padding: '1rem', borderRadius: '8px', border: staffForm.role === 'COMPUTER_OPERATOR' ? '2px solid var(--primary)' : '1px solid #ddd', background: staffForm.role === 'COMPUTER_OPERATOR' ? 'var(--primary-fade)' : 'white' }}>Create Operator</button>
                            </div>

                            {staffForm.role === 'CC' ? (
                                <form onSubmit={assignCC}>
                                    <p style={{ color: 'var(--text-dim)', marginBottom: '1.5rem', textAlign: 'center' }}>
                                        Promote an existing Teacher to Class Coordinator for a specific batch.
                                    </p>

                                    <div style={{ marginBottom: '1rem' }}>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Select Teacher</label>
                                        <select
                                            value={staffForm.teacher_id}
                                            onChange={e => setStaffForm({ ...staffForm, teacher_id: e.target.value })}
                                            required
                                            style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ddd' }}
                                        >
                                            <option value="">-- Select Faculty --</option>
                                            {teachers.map(t => (
                                                <option key={t._id} value={t._id}>{t.full_name} ({t.email})</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div style={{ marginBottom: '1.5rem' }}>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}> Assign to Batch</label>
                                        <select
                                            value={staffForm.batch_id}
                                            onChange={e => setStaffForm({ ...staffForm, batch_id: e.target.value })}
                                            required
                                            style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ddd' }}
                                        >
                                            <option value="">-- Select Batch --</option>
                                            {batches.map(b => (
                                                <option key={b._id} value={b._id}>{b.batch_name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={loading}>Assign as CC</button>
                                </form>
                            ) : (
                                <form onSubmit={createStaff}>
                                    <p style={{ color: 'var(--text-dim)', marginBottom: '1.5rem', textAlign: 'center' }}>
                                        Create a new account for notice board management.
                                    </p>
                                    <input type="text" placeholder="Full Name" value={staffForm.full_name} onChange={e => setStaffForm({ ...staffForm, full_name: e.target.value })} required style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ddd', marginBottom: '1rem' }} />
                                    <input type="email" placeholder="Email Address" value={staffForm.email} onChange={e => setStaffForm({ ...staffForm, email: e.target.value })} required style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ddd', marginBottom: '1rem' }} />
                                    <input type="text" placeholder="Department" value={staffForm.department} onChange={e => setStaffForm({ ...staffForm, department: e.target.value })} required style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ddd', marginBottom: '1rem' }} />
                                    <input type="password" placeholder="Password" value={staffForm.password} onChange={e => setStaffForm({ ...staffForm, password: e.target.value })} required style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ddd', marginBottom: '1rem' }} />

                                    <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={loading}>Create Account</button>
                                </form>
                            )}
                        </div>
                    )}

                    {activeTab === 'feedback' && (
                        <div>
                            <h3 style={{ marginBottom: '1.5rem' }}>Student Feedback</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {feedback.length === 0 ? <p style={{ textAlign: 'center', color: 'var(--text-dim)' }}>No feedback messages.</p> :
                                    feedback.map(item => (
                                        <div key={item._id} style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0', position: 'relative' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                                                <span style={{ fontWeight: '600', color: 'var(--primary)' }}>{item.from_batch?.batch_name}</span>
                                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                                    <span style={{ color: 'var(--text-dim)' }}>{new Date(item.sent_at).toLocaleDateString()}</span>
                                                    <button onClick={() => deleteFeedback(item._id)} className="btn-icon" style={{ color: '#ef4444', background: '#fee2e2' }}><FaTrash size={14} /></button>
                                                </div>
                                            </div>
                                            <p style={{ margin: 0 }}>{item.message_content}</p>
                                        </div>
                                    ))
                                }
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </Layout>
    );
};

export default ChairmanDashboard;
