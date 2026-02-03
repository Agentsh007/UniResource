import React, { useState, useEffect, useContext } from 'react';
import axios from '../utils/axiosConfig';
import { AuthContext } from '../context/AuthContext';
import { Loader, Toast, ConfirmModal } from '../components/UI';
import { Layout } from '../components/Layout';
import { FaTrash, FaPlus, FaList, FaComments, FaBars, FaTimes, FaUserShield, FaDesktop, FaUser, FaEye, FaEyeSlash } from 'react-icons/fa';
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

    const [showBatchPassword, setShowBatchPassword] = useState(false);
    const [showStaffPassword, setShowStaffPassword] = useState(false);

    // Profile Edit State
    const [editMode, setEditMode] = useState(false);
    const [editData, setEditData] = useState({ full_name: '', email: '', department: '' });

    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [toast, setToast] = useState(null);
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', onConfirm: null, isDanger: false });
    const [loading, setLoading] = useState(false);

    const closeConfirmModal = () => setConfirmModal(prev => ({ ...prev, isOpen: false }));

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

    const deleteBatch = (id) => {
        setConfirmModal({
            isOpen: true,
            title: 'Delete Batch?',
            message: 'Are you sure you want to delete this batch? All associated data will be lost.',
            isDanger: true,
            onConfirm: async () => {
                setLoading(true);
                try {
                    await axios.delete(`/batches/${id}`);
                    showToast('Batch deleted', 'success');
                    fetchBatches();
                } catch (err) {
                    showToast('Error deleting batch', 'error');
                } finally {
                    setLoading(false);
                    closeConfirmModal();
                }
            }
        });
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

    const deleteFeedback = (id) => {
        setConfirmModal({
            isOpen: true,
            title: 'Delete Feedback?',
            message: 'Are you sure you want to remove this feedback message?',
            isDanger: true,
            onConfirm: async () => {
                try {
                    await axios.delete(`/feedback/${id}`);
                    fetchFeedback();
                    showToast('Feedback deleted', 'success');
                } catch (err) {
                    showToast('Failed to delete feedback', 'error');
                } finally {
                    closeConfirmModal();
                }
            }
        });
    };

    const updateProfile = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.put('/auth/profile', editData);
            if (res.data.success) {
                showToast('Profile Updated.', 'success');
                setEditMode(false);
                await loadUser();
            }
        } catch (err) {
            showToast('Update failed', 'error');
        }
    };

    const deleteAccount = () => {
        setConfirmModal({
            isOpen: true,
            title: 'Delete Account?',
            message: 'Are you ABSOLUTELY SURE? This will permanently delete your account and cannot be undone.',
            isDanger: true,
            onConfirm: async () => {
                try {
                    await axios.delete('/auth/profile');
                    alert('Account deleted.');
                    window.location.href = '/';
                } catch (err) {
                    showToast('Delete failed', 'error');
                } finally {
                    closeConfirmModal();
                }
            }
        });
    };

    if (authLoading) return <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}><Loader /></div>;
    if (!user || user.role !== 'CHAIRMAN') return null;



    return (
        <Layout>
            <div className="container" style={{ maxWidth: '1100px' }}>
                {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
                <ConfirmModal
                    isOpen={confirmModal.isOpen}
                    onClose={closeConfirmModal}
                    onConfirm={confirmModal.onConfirm}
                    title={confirmModal.title}
                    message={confirmModal.message}
                    isDanger={confirmModal.isDanger}
                />

                <header style={{ marginBottom: '2rem' }}>
                    <h1 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>Chairman Dashboard</h1>
                    <p style={{ color: 'var(--text-dim)' }}>Department Administration Hub</p>
                </header>



                <div className="glass-panel fade-in" style={{ minHeight: '500px' }}>

                    {activeTab === 'profile' && (
                        <div style={{ background: 'white', padding: '2rem', borderRadius: '20px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', border: '1px solid #e2e8f0' }}>
                            <div style={{ padding: '0 0.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                                    <div>
                                        <h2 style={{ fontSize: '1.8rem', color: 'var(--text-main)', marginBottom: '0.25rem' }}>Chairman Profile</h2>
                                        <p style={{ color: 'var(--text-dim)' }}>Manage your account details.</p>
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
                                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '500', color: 'var(--text-main)' }}>Full Name</label>
                                                <input type="text" value={editData.full_name} onChange={e => setEditData({ ...editData, full_name: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '500', color: 'var(--text-main)' }}>Email</label>
                                                <input type="email" value={editData.email} onChange={e => setEditData({ ...editData, email: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '500', color: 'var(--text-main)' }}>Department</label>
                                                <input type="text" value={editData.department} onChange={e => setEditData({ ...editData, department: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
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
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'manage-batches' && (
                        <div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                                <div>
                                    <h4 style={{ marginBottom: '1rem' }}>Create New Batch</h4>
                                    <form onSubmit={createBatch} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        <input type="text" placeholder="Batch Name (e.g. CSE-24)" value={batchForm.batch_name} onChange={e => setBatchForm({ ...batchForm, batch_name: e.target.value })} required style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid #ddd' }} />
                                        <input type="text" placeholder="Batch Username" value={batchForm.batch_username} onChange={e => setBatchForm({ ...batchForm, batch_username: e.target.value })} required style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid #ddd' }} />
                                        <div style={{ position: 'relative' }}>
                                            <input
                                                type={showBatchPassword ? "text" : "password"}
                                                placeholder="Password"
                                                value={batchForm.batch_password}
                                                onChange={e => setBatchForm({ ...batchForm, batch_password: e.target.value })}
                                                required
                                                style={{ width: '100%', padding: '0.8rem', paddingRight: '40px', borderRadius: '8px', border: '1px solid #ddd' }}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowBatchPassword(!showBatchPassword)}
                                                style={{
                                                    position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
                                                    background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)'
                                                }}
                                            >
                                                {showBatchPassword ? <FaEyeSlash /> : <FaEye />}
                                            </button>
                                        </div>
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


                            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                                <button onClick={() => setStaffForm(s => ({ ...s, role: 'CC' }))} className={`btn-tab ${staffForm.role === 'CC' ? 'active' : ''}`} style={{ flex: 1, padding: '1rem', borderRadius: '8px', border: staffForm.role === 'CC' ? '2px solid var(--primary)' : '1px solid #ddd', background: staffForm.role === 'CC' ? 'var(--primary-fade)' : 'white' }}>Assign Class Coordinator</button>
                                <button onClick={() => setStaffForm(s => ({ ...s, role: 'COMPUTER_OPERATOR' }))} className={`btn-tab ${staffForm.role === 'COMPUTER_OPERATOR' ? 'active' : ''}`} style={{ flex: 1, padding: '1rem', borderRadius: '8px', border: staffForm.role === 'COMPUTER_OPERATOR' ? '2px solid var(--primary)' : '1px solid #ddd', background: staffForm.role === 'COMPUTER_OPERATOR' ? 'var(--primary-fade)' : 'white' }}>Create Operator</button>
                            </div>

                            {staffForm.role === 'CC' ? (
                                <div>
                                    <form onSubmit={assignCC} style={{ marginBottom: '3rem' }}>
                                        <p style={{ color: 'var(--text-dim)', marginBottom: '1.5rem', textAlign: 'center' }}>
                                            Promote a Teacher to Class Coordinator.
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
                                                {teachers.filter(t => t.role === 'TEACHER').map(t => (
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

                                    {teachers.filter(t => t.role === 'CC').length === 0 ? (
                                        <p style={{ color: 'var(--text-dim)', textAlign: 'center' }}>No Active CCs.</p>
                                    ) : (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                            {teachers.filter(t => t.role === 'CC').map(cc => (
                                                <div key={cc._id} style={{
                                                    padding: '1rem', background: 'white', borderRadius: '8px', border: '1px solid #e2e8f0',
                                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                                                }}>
                                                    <div>
                                                        <div style={{ fontWeight: '600' }}>{cc.full_name}</div>
                                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>{cc.email}</div>
                                                        <div style={{ fontSize: '0.85rem', color: 'var(--primary)', marginTop: '0.2rem' }}>
                                                            Batch: {cc.assigned_batch?.batch_name || 'N/A'}
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => {
                                                            setConfirmModal({
                                                                isOpen: true,
                                                                title: 'Revoke CC Access?',
                                                                message: `Are you sure you want to revoke Class Coordinator access for ${cc.full_name}?`,
                                                                isDanger: true,
                                                                onConfirm: async () => {
                                                                    setLoading(true);
                                                                    try {
                                                                        await axios.put('/auth/remove-cc', { teacher_id: cc._id });
                                                                        showToast('CC Access Revoked', 'success');
                                                                        fetchTeachers();
                                                                    } catch (err) {
                                                                        showToast('Revoke Failed', 'error');
                                                                    } finally {
                                                                        setLoading(false);
                                                                        closeConfirmModal();
                                                                    }
                                                                }
                                                            });
                                                        }}
                                                        className="btn-secondary"
                                                        style={{ color: '#ef4444', fontSize: '0.8rem', padding: '0.5rem 1rem' }}
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <form onSubmit={createStaff}>
                                    <p style={{ color: 'var(--text-dim)', marginBottom: '1.5rem', textAlign: 'center' }}>
                                        Create a new account for notice board management.
                                    </p>
                                    <input type="text" placeholder="Full Name" value={staffForm.full_name} onChange={e => setStaffForm({ ...staffForm, full_name: e.target.value })} required style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ddd', marginBottom: '1rem' }} />
                                    <input type="email" placeholder="Email Address" value={staffForm.email} onChange={e => setStaffForm({ ...staffForm, email: e.target.value })} required style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ddd', marginBottom: '1rem' }} />
                                    <input type="text" placeholder="Department" value={staffForm.department} onChange={e => setStaffForm({ ...staffForm, department: e.target.value })} required style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ddd', marginBottom: '1rem' }} />
                                    <div style={{ position: 'relative', marginBottom: '1rem' }}>
                                        <input
                                            type={showStaffPassword ? "text" : "password"}
                                            placeholder="Password"
                                            value={staffForm.password}
                                            onChange={e => setStaffForm({ ...staffForm, password: e.target.value })}
                                            required
                                            style={{ width: '100%', padding: '0.8rem', paddingRight: '40px', borderRadius: '8px', border: '1px solid #ddd' }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowStaffPassword(!showStaffPassword)}
                                            style={{
                                                position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
                                                background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)'
                                            }}
                                        >
                                            {showStaffPassword ? <FaEyeSlash /> : <FaEye />}
                                        </button>
                                    </div>

                                    <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={loading}>Create Account</button>
                                </form>
                            )}
                        </div>
                    )}

                    {activeTab === 'feedback' && (
                        <div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {feedback.length === 0 ? <p style={{ textAlign: 'center', color: 'var(--text-dim)' }}>No feedback messages.</p> :
                                    feedback.map(item => (
                                        <div key={item._id} style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0', position: 'relative' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                                                <span style={{ fontWeight: '600', color: 'var(--primary)' }}>{item.is_anonymous ? 'Anonymous Batch' : item.from_batch?.batch_name}</span>
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
