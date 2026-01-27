import React, { useState, useEffect, useContext } from 'react';
import axios from '../utils/axiosConfig';
import { AuthContext } from '../context/AuthContext';
import { Loader, Toast } from '../components/UI';
import { Layout } from '../components/Layout';
import { FaTrash, FaPlus, FaList, FaComments, FaBars, FaTimes, FaUser } from 'react-icons/fa';
import { useLocation, useNavigate } from 'react-router-dom'; // Add useNavigate

const CoordinatorDashboard = () => {
    const { user, loadUser, loading: authLoading } = useContext(AuthContext);
    const location = useLocation();
    const navigate = useNavigate(); // Add navigate hook
    const [activeTab, setActiveTab] = useState('create'); // create, list, feedback, profile
    const [batches, setBatches] = useState([]);
    const [feedback, setFeedback] = useState([]);
    const [formData, setFormData] = useState({ batch_name: '', batch_username: '', batch_password: '' });

    // Handle URL Queries for Tab Switching
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const tab = params.get('tab');
        if (tab) setActiveTab(tab);
        else navigate('?tab=create', { replace: true }); // Default to create if no tab
    }, [location.search, navigate]);

    // Mobile Menu State
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Toast State
    const [toast, setToast] = useState(null); // { message, type }
    const showToast = (message, type = 'error') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3500); // clear after 3.5s
    };

    const [loading, setLoading] = useState(false);

    // Profile Edit State
    const [editMode, setEditMode] = useState(false);
    const [editData, setEditData] = useState({ full_name: '', email: '', department: '' });

    const updateProfile = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.put('/auth/profile', editData);
            if (res.data.success) {
                alert('Profile Updated.');
                setEditMode(false);
                await loadUser(); // Refresh user context
            }
        } catch (err) {
            alert('Update failed');
        }
    };

    const deleteAccount = async () => {
        if (!window.confirm('Are you ABSOLUTELY SURE? This will delete your account and all files permanently.')) return;
        try {
            await axios.delete('/auth/profile');
            alert('Account deleted.');
            window.location.href = '/';
        } catch (err) {
            alert('Delete failed');
        }
    };

    useEffect(() => {
        if (activeTab === 'list') fetchBatches();
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

    const createBatch = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post('/batches', formData);
            showToast('Batch Created Successfully!', 'success');
            setFormData({ batch_name: '', batch_username: '', batch_password: '' });
            // Optionally switch to list view
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
            showToast('Batch deleted successfully', 'success');
            fetchBatches();
        } catch (err) {
            showToast('Error deleting batch', 'error');
        } finally {
            setLoading(false);
        }
    };

    const deleteFeedback = async (id) => {
        if (!window.confirm('Delete this feedback?')) return;
        try {
            console.log('Deleting feedback:', id);
            await axios.delete(`/feedback/${id}`);
            fetchFeedback();
            showToast('Feedback deleted', 'success');
        } catch (err) {
            console.error(err);
            showToast('Failed to delete feedback', 'error');
        }
    };

    if (authLoading) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><Loader /></div>;
    }

    if (!user) return null; // Or redirect, but Layout handles protection usually.

    return (
        <Layout>
            <div className="container" style={{ maxWidth: '1000px' }}>
                {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

                {/* Mobile Menu Toggle */}
                <button
                    className="mobile-menu-toggle"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    style={{ marginBottom: '1rem' }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        {mobileMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
                        <span>{mobileMenuOpen ? 'Close' : 'Coordinator Menu'}</span>
                    </div>
                </button>

                {/* Overlay for mobile */}
                <div
                    className={`menu-overlay ${mobileMenuOpen ? 'open' : ''}`}
                    onClick={() => setMobileMenuOpen(false)}
                />

                {/* Menu System */}
                <div className={`tab-menu ${mobileMenuOpen ? 'open' : ''}`}>
                    <div style={{ padding: '0 0.5rem 1rem 0.5rem', marginBottom: '1rem', borderBottom: '1px solid var(--glass-border)', display: 'none' }} className="mobile-only-header">
                        <span style={{ fontWeight: 'bold', fontSize: '1.2rem', color: 'var(--primary)' }}>Menu</span>
                    </div>

                    {/* 'My Profile' removed from here, accessed via Header */}

                    <button
                        onClick={() => { navigate('?tab=create'); setMobileMenuOpen(false); }}
                        className={`btn-tab ${activeTab === 'create' ? 'active' : ''}`}
                        style={{
                            padding: '0.75rem 1.5rem',
                            borderRadius: '12px',
                            border: 'none',
                            background: activeTab === 'create' ? 'var(--primary)' : 'var(--surface)',
                            color: activeTab === 'create' ? 'white' : 'var(--text-main)',
                            cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '600',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.05)', transition: '0.2s',
                            fontSize: '1rem'
                        }}
                    >
                        <FaPlus /> Create Batch
                    </button>
                    <button
                        onClick={() => { navigate('?tab=list'); setMobileMenuOpen(false); }}
                        className={`btn-tab ${activeTab === 'list' ? 'active' : ''}`}
                        style={{
                            padding: '0.75rem 1.5rem',
                            borderRadius: '12px',
                            border: 'none',
                            background: activeTab === 'list' ? 'var(--primary)' : 'var(--surface)',
                            color: activeTab === 'list' ? 'white' : 'var(--text-main)',
                            cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '600',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.05)', transition: '0.2s',
                            fontSize: '1rem'
                        }}
                    >
                        <FaList /> Existing Batches
                    </button>
                    <button
                        onClick={() => { navigate('?tab=feedback'); setMobileMenuOpen(false); }}
                        className={`btn-tab ${activeTab === 'feedback' ? 'active' : ''}`}
                        style={{
                            padding: '0.75rem 1.5rem',
                            borderRadius: '12px',
                            border: 'none',
                            background: activeTab === 'feedback' ? 'var(--primary)' : 'var(--surface)',
                            color: activeTab === 'feedback' ? 'white' : 'var(--text-main)',
                            cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '600',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.05)', transition: '0.2s',
                            fontSize: '1rem'
                        }}
                    >
                        <FaComments /> Student Feedback
                    </button>
                </div>

                <div className="glass-panel fade-in" style={{ minHeight: '400px' }}>

                    {activeTab === 'profile' && (
                        <div style={{ padding: '0 0.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                                <div>
                                    <h2 style={{ fontSize: '1.8rem', color: 'var(--text-main)', marginBottom: '0.25rem' }}>Coordinator Profile</h2>
                                    <p style={{ color: 'var(--text-dim)' }}>Manage your account details and settings.</p>
                                </div>
                                {!editMode && (
                                    <button
                                        onClick={() => { setEditData({ full_name: user.name, email: user.email, department: user.department || '' }); setEditMode(true); }}
                                        className="btn-secondary"
                                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.2rem', borderRadius: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}
                                    >
                                        Edit Profile
                                    </button>
                                )}
                            </div>

                            {editMode ? (
                                <form onSubmit={updateProfile} style={{ background: '#f8fafc', padding: '2rem', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem', maxWidth: '600px' }}>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--text-main)' }}>Full Name</label>
                                            <input type="text" value={editData.full_name} onChange={e => setEditData({ ...editData, full_name: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem' }} />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--text-main)' }}>Email Address</label>
                                            <input type="email" value={editData.email} onChange={e => setEditData({ ...editData, email: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem' }} />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--text-main)' }}>Department</label>
                                            <input type="text" value={editData.department} onChange={e => setEditData({ ...editData, department: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem' }} />
                                        </div>
                                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                            <button type="submit" className="btn-primary" style={{ padding: '0.75rem 1.5rem' }}>Save Changes</button>
                                            <button type="button" onClick={() => setEditMode(false)} className="btn-secondary" style={{ padding: '0.75rem 1.5rem', background: 'white', border: '1px solid #cbd5e1' }}>Cancel</button>
                                        </div>
                                    </div>
                                </form>
                            ) : (
                                <div>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
                                        <div className="profile-card-item" style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #eee', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                                            <label style={{ color: 'var(--text-dim)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.5rem', display: 'block' }}>Full Name</label>
                                            <div style={{ fontSize: '1.2rem', fontWeight: '600', color: 'var(--text-main)' }}>{user.name}</div>
                                        </div>
                                        <div className="profile-card-item" style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #eee', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                                            <label style={{ color: 'var(--text-dim)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.5rem', display: 'block' }}>Email Address</label>
                                            <div style={{ fontSize: '1.2rem', fontWeight: '600', color: 'var(--text-main)' }}>{user.email}</div>
                                        </div>
                                        <div className="profile-card-item" style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #eee', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                                            <label style={{ color: 'var(--text-dim)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.5rem', display: 'block' }}>Role</label>
                                            <div><span className="badge badge-primary" style={{ fontSize: '1rem', padding: '0.4rem 0.8rem' }}>{user.role}</span></div>
                                        </div>
                                        <div className="profile-card-item" style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #eee', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                                            <label style={{ color: 'var(--text-dim)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.5rem', display: 'block' }}>Department</label>
                                            <div style={{ fontSize: '1.2rem', fontWeight: '600', color: 'var(--text-main)' }}>{user.department || 'Not Specified'}</div>
                                        </div>
                                    </div>

                                    <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '2rem' }}>
                                        <h3 style={{ fontSize: '1.1rem', color: '#ef4444', marginBottom: '1rem' }}>Danger Zone</h3>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fef2f2', padding: '1.5rem', borderRadius: '12px', border: '1px solid #fecaca' }}>
                                            <div>
                                                <div style={{ fontWeight: '600', color: '#991b1b', marginBottom: '0.25rem' }}>Delete Account</div>
                                                <div style={{ fontSize: '0.9rem', color: '#b91c1c' }}>Permanently remove your account and all associated data.</div>
                                            </div>
                                            <button
                                                onClick={deleteAccount}
                                                className="btn-icon"
                                                style={{ background: '#ef4444', color: 'white', padding: '0.75rem 1.5rem', width: 'auto', borderRadius: '8px', border: 'none', fontWeight: '600', cursor: 'pointer' }}
                                            >
                                                Delete Account
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'create' && (
                        <div style={{ maxWidth: '500px', margin: '0 auto' }}>
                            <h3 style={{ textAlign: 'center', marginBottom: '1.5rem', color: 'var(--primary)' }}>Create New Batch</h3>
                            {loading ? <div style={{ display: 'flex', justifyContent: 'center' }}><Loader /></div> :
                                <form onSubmit={createBatch}>
                                    <input type="text" placeholder="Batch Name (e.g. CSE 2026)" value={formData.batch_name} onChange={e => setFormData({ ...formData, batch_name: e.target.value })} required />
                                    <input type="text" placeholder="Batch Username" value={formData.batch_username} onChange={e => setFormData({ ...formData, batch_username: e.target.value })} required />
                                    <input type="text" placeholder="Batch Password" value={formData.batch_password} onChange={e => setFormData({ ...formData, batch_password: e.target.value })} required />
                                    <button type="submit" className="btn-primary" style={{ width: '100%' }}>Create Batch</button>
                                </form>
                            }
                        </div>
                    )}

                    {activeTab === 'list' && (
                        <div>
                            <h3 style={{ marginBottom: '1.5rem' }}>Managed Batches</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {batches.length === 0 ? <p style={{ textAlign: 'center', color: 'var(--text-dim)' }}>No batches found. Create one first.</p> :
                                    batches.map(batch => (
                                        <div key={batch._id} className="interactive-card" style={{
                                            padding: '1rem',
                                            background: '#f8fafc',
                                            borderRadius: '12px',
                                            border: '1px solid #e2e8f0',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            transition: '0.2s'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>{batch.batch_name}</span>
                                                <span style={{ color: 'var(--text-dim)', fontSize: '0.85rem', background: '#e2e8f0', padding: '0.25rem 0.75rem', borderRadius: '20px' }}>@{batch.batch_username}</span>
                                            </div>
                                            <button onClick={() => deleteBatch(batch._id)} className="btn-icon" style={{ width: '36px', height: '36px' }} title="Delete Batch">
                                                <FaTrash size={15} />
                                            </button>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'feedback' && (
                        <div>
                            <h3 style={{ marginBottom: '1.5rem' }}>Student Feedback</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '600px', overflowY: 'auto' }}>
                                {feedback.length === 0 ? <p style={{ textAlign: 'center', color: 'var(--text-dim)' }}>No feedback messages.</p> :
                                    feedback.map(item => (
                                        <div key={item._id} style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0', position: 'relative' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                                                <span style={{ fontWeight: '600', color: 'var(--primary)' }}>{item.from_batch?.batch_name}</span>
                                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                                    <span style={{ color: 'var(--text-dim)' }}>{new Date(item.sent_at).toLocaleDateString()}</span>
                                                    <button
                                                        onClick={() => deleteFeedback(item._id)}
                                                        className="btn-icon"
                                                        style={{ width: '32px', height: '32px', background: '#fee2e2', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                        title="Delete Feedback"
                                                    >
                                                        <FaTrash size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                            <p style={{ margin: 0, color: 'var(--text-main)' }}>{item.message_content}</p>
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

export default CoordinatorDashboard;
