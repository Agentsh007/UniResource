import React, { useState, useEffect, useContext } from 'react';
import axios from '../utils/axiosConfig';
import { AuthContext } from '../context/AuthContext';
import { Loader, Toast, ConfirmModal } from '../components/UI';
import { Layout } from '../components/Layout';
import { FaTrash, FaCheck, FaTimes, FaFileAlt, FaUserEdit, FaUserCircle, FaBullhorn, FaCalendarAlt, FaPaperclip } from 'react-icons/fa';
import { useLocation, useNavigate } from 'react-router-dom';

const ChairmanDashboard = () => {
    const { user, loadUser, loading: authLoading } = useContext(AuthContext);
    const location = useLocation();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('notices');

    // Data State
    const [notices, setNotices] = useState([]);
    const [routines, setRoutines] = useState([]);
    const [feedback, setFeedback] = useState([]);

    // Derived state for filtered views
    const [pendingNotices, setPendingNotices] = useState([]);
    const [publishedNotices, setPublishedNotices] = useState([]);
    const [pendingRoutines, setPendingRoutines] = useState([]);
    const [publishedRoutines, setPublishedRoutines] = useState([]);

    // UI State
    const [toast, setToast] = useState(null);
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', onConfirm: null, isDanger: false });
    const [loading, setLoading] = useState(false);
    const [editMode, setEditMode] = useState(false);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3500);
    };

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const tab = params.get('tab');
        if (tab) setActiveTab(tab);
        else navigate('?tab=notices', { replace: true });
    }, [location.search, navigate]);

    useEffect(() => {
        if (activeTab === 'notices' || activeTab === 'routine') fetchContent();
        if (activeTab === 'feedback') fetchFeedback();
    }, [activeTab]);

    const fetchContent = async () => {
        try {
            const res = await axios.get('/announcements');
            const allItems = res.data;

            // Filter Notices
            const allNotices = allItems.filter(i => i.type === 'NOTICE');
            setNotices(allNotices);
            setPendingNotices(allNotices.filter(n => n.status === 'PENDING' || n.status === 'PENDING_APPROVAL'));
            // publishedNotices: Approved AND (Global OR Created by Chairman himself to see his own) 
            // Requirement: "Notices are specific to batches and not shown to the chairman unless pending"
            // So we show Approved items ONLY if they are NOT batch-specific (target_batch is null)
            setPublishedNotices(allNotices.filter(n => n.status === 'APPROVED' && !n.target_batch));

            // Filter Routines
            const allRoutines = allItems.filter(i => i.type === 'ROUTINE');
            setRoutines(allRoutines);
            setPendingRoutines(allRoutines.filter(r => r.status === 'PENDING' || r.status === 'PENDING_APPROVAL'));
            // For routines, usually we want to see all approved ones, or follow same rule. 
            // Providing same rule for consistency: Global only. 
            // But usually routines ARE batch specific. If we hide batch specific routines, Chairman sees nothing.
            // "Notices are specific to batches..." - user specifically said Notices. 
            // I will show ALL Approved Routines for now to ensure visibility involved.
            setPublishedRoutines(allRoutines.filter(r => r.status === 'APPROVED'));

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

    const handleStatusUpdate = async (id, status, type, feedback = '') => {
        try {
            await axios.put(`/announcements/${id}/status`, { status, feedback });
            showToast(`${type} ${status === 'APPROVED' ? 'Published' : 'Declined'}`, 'success');
            fetchContent();
        } catch (err) {
            console.error(err);
            showToast('Action failed', 'error');
        }
    };

    const deleteItem = (id, endpoint = 'announcements') => {
        setConfirmModal({
            isOpen: true,
            title: 'Delete Item?',
            message: 'Are you sure you want to delete this item?',
            isDanger: true,
            onConfirm: async () => {
                try {
                    await axios.delete(`/${endpoint}/${id}`);
                    showToast('Deleted successfully', 'success');
                    if (endpoint === 'announcements') fetchContent();
                    else fetchFeedback();
                } catch (err) {
                    showToast('Delete failed', 'error');
                } finally {
                    setConfirmModal(prev => ({ ...prev, isOpen: false }));
                }
            }
        });
    };

    if (authLoading) return <Loader />;
    if (!user || user.role !== 'CHAIRMAN') return null;

    const Badge = ({ text, type }) => (
        <span style={{ fontSize: '0.75rem', padding: '0.25rem 0.75rem', borderRadius: '20px', fontWeight: '600', background: type === 'batch' ? '#e0f2fe' : '#f1f5f9', color: type === 'batch' ? '#0284c7' : '#64748b' }}>
            {text || 'General'}
        </span>
    );

    const AttachmentButton = ({ url }) => (
        <a href={url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: '#fffbeb', color: '#d97706', borderRadius: '6px', textDecoration: 'none', fontSize: '0.9rem', fontWeight: '500', marginTop: '0.75rem', border: '1px solid #fcd34d' }}>
            <FaPaperclip /> View Attachment
        </a>
    );

    return (
        <Layout>
            <div className="container" style={{ maxWidth: '1000px', paddingBottom: '4rem' }}>
                {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
                <ConfirmModal
                    isOpen={confirmModal.isOpen}
                    onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                    onConfirm={confirmModal.onConfirm}
                    title={confirmModal.title}
                    message={confirmModal.message}
                    isDanger={confirmModal.isDanger}
                />

                <header style={{ marginBottom: '2rem', textAlign: 'center' }}>
                    <h1 style={{ color: 'var(--primary)', fontSize: '2rem', marginBottom: '0.5rem' }}>Chairman Dashboard</h1>
                    <p style={{ color: 'var(--text-dim)' }}>Oversee Department Activities</p>
                </header>

                <div className="glass-panel fade-in" style={{ minHeight: '600px' }}>

                    {/* NOTICES TAB */}
                    {activeTab === 'notices' && (
                        <div>
                            {/* Pending Notices */}
                            <div style={{ marginBottom: '3rem' }}>
                                <h3 style={{ fontSize: '1.2rem', color: '#1e293b', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <FaBullhorn color="#ef4444" /> Pending Approvals ({pendingNotices.length})
                                </h3>

                                <div style={{ display: 'grid', gap: '1.5rem' }}>
                                    {pendingNotices.length === 0 ? <p style={{ color: 'var(--text-dim)', fontStyle: 'italic' }}>No pending notices.</p> :
                                        pendingNotices.map((item) => (
                                            <div key={item._id} className="interactive-card" style={{ padding: '1.5rem', background: '#fff', borderLeft: '4px solid #ef4444' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                                                    <div style={{ flex: 1, minWidth: '250px' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                                                            <h4 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#1e293b', margin: 0 }}>{item.title}</h4>
                                                            <Badge text={item.target_batch ? item.target_batch.batch_name : 'Global'} type={item.target_batch ? 'batch' : 'global'} />
                                                        </div>
                                                        <p style={{ color: '#475569', margin: '0 0 0.5rem 0', lineHeight: '1.5' }}>{item.content}</p>
                                                        <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                                                            Submitted by: <strong>{item.author?.full_name}</strong> • {new Date(item.created_at).toLocaleDateString()}
                                                        </div>
                                                        {item.file_url && <AttachmentButton url={item.file_url} />}
                                                    </div>
                                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                        <button onClick={() => handleStatusUpdate(item._id, 'APPROVED', 'Notice')} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: '#22c55e' }}>
                                                            <FaCheck /> Approve
                                                        </button>
                                                        <button onClick={() => {
                                                            const fb = prompt('Reason for rejection?');
                                                            if (fb !== null) handleStatusUpdate(item._id, 'REJECTED', 'Notice', fb);
                                                        }} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', color: '#ef4444', background: '#fee2e2' }}>
                                                            <FaTimes /> Reject
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    }
                                </div>
                            </div>

                            {/* Published Notices */}
                            <div style={{ paddingTop: '2rem', borderTop: '1px solid #e2e8f0' }}>
                                <h3 style={{ fontSize: '1.2rem', color: '#1e293b', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <FaCheck color="#22c55e" /> Published Global Notices
                                </h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {publishedNotices.length === 0 ? <p style={{ color: 'var(--text-dim)' }}>No published global notices.</p> :
                                        publishedNotices.map((item) => (
                                            <div key={item._id} style={{ padding: '1rem', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                <div>
                                                    <h4 style={{ fontSize: '1.05rem', fontWeight: '600', color: '#334155', marginBottom: '0.25rem' }}>{item.title}</h4>
                                                    <p style={{ fontSize: '0.9rem', color: '#64748b', margin: '0 0 0.5rem 0' }}>{item.content}</p>
                                                    <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{new Date(item.created_at).toLocaleDateString()}</span>
                                                    {item.file_url && <div style={{ marginTop: '0.25rem' }}><a href={item.file_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.8rem', color: 'var(--primary)', textDecoration: 'none' }}>View Attachment</a></div>}
                                                </div>
                                                <button onClick={() => deleteItem(item._id)} className="btn-icon" style={{ color: '#ef4444', width: '32px', height: '32px', background: '#fee2e2' }}>
                                                    <FaTrash size={14} />
                                                </button>
                                            </div>
                                        ))
                                    }
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ROUTINE TAB */}
                    {activeTab === 'routine' && (
                        <div>
                            {/* Pending Routines */}
                            <div style={{ marginBottom: '3rem' }}>
                                <h3 style={{ fontSize: '1.2rem', color: '#1e293b', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <FaCalendarAlt color="#f59e0b" /> Pending Routine Approvals ({pendingRoutines.length})
                                </h3>

                                <div style={{ display: 'grid', gap: '1.5rem' }}>
                                    {pendingRoutines.length === 0 ? <p style={{ color: 'var(--text-dim)', fontStyle: 'italic' }}>No pending routines.</p> :
                                        pendingRoutines.map((item) => (
                                            <div key={item._id} className="interactive-card" style={{ padding: '1.5rem', background: '#fff', borderLeft: '4px solid #f59e0b' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                                                    <div style={{ flex: 1, minWidth: '250px' }}>
                                                        <h4 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#1e293b', margin: '0 0 0.5rem 0' }}>{item.title}</h4>
                                                        <p style={{ color: '#475569', margin: '0 0 0.5rem 0' }}>{item.content}</p>
                                                        <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.5rem' }}>
                                                            Submitted by: <strong>{item.author?.full_name}</strong>
                                                        </div>
                                                        {item.file_url && <AttachmentButton url={item.file_url} />}
                                                    </div>
                                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                        <button onClick={() => handleStatusUpdate(item._id, 'APPROVED', 'Routine')} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: '#22c55e' }}>
                                                            <FaCheck /> Approve
                                                        </button>
                                                        <button onClick={() => {
                                                            const fb = prompt('Reason for rejection?');
                                                            if (fb !== null) handleStatusUpdate(item._id, 'REJECTED', 'Routine', fb);
                                                        }} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', color: '#ef4444', background: '#fee2e2' }}>
                                                            <FaTimes /> Reject
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    }
                                </div>
                            </div>

                            {/* Published Routines */}
                            <div style={{ paddingTop: '2rem', borderTop: '1px solid #e2e8f0' }}>
                                <h3 style={{ fontSize: '1.2rem', color: '#1e293b', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <FaCheck color="#22c55e" /> Published Routines
                                </h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {publishedRoutines.length === 0 ? <p style={{ color: 'var(--text-dim)' }}>No published routines.</p> :
                                        publishedRoutines.map((item) => (
                                            <div key={item._id} style={{ padding: '1rem', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                <div>
                                                    <h4 style={{ fontSize: '1.05rem', fontWeight: '600', color: '#334155', marginBottom: '0.25rem' }}>{item.title}</h4>
                                                    <p style={{ fontSize: '0.9rem', color: '#64748b', margin: '0 0 0.5rem 0' }}>{item.content}</p>
                                                    <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                                                        {new Date(item.created_at).toLocaleDateString()}
                                                    </div>
                                                    {item.file_url && <div style={{ marginTop: '0.25rem' }}><a href={item.file_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.8rem', color: 'var(--primary)', textDecoration: 'none' }}>View Routine</a></div>}
                                                </div>
                                                <button onClick={() => deleteItem(item._id)} className="btn-icon" style={{ color: '#ef4444', width: '32px', height: '32px', background: '#fee2e2' }}>
                                                    <FaTrash size={14} />
                                                </button>
                                            </div>
                                        ))
                                    }
                                </div>
                            </div>
                        </div>
                    )}

                    {/* FEEDBACK TAB */}
                    {activeTab === 'feedback' && (
                        <div>
                            <h3 style={{ fontSize: '1.5rem', color: 'var(--primary)', marginBottom: '2rem', textAlign: 'center', fontWeight: '700' }}>
                                Student Feedback
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                {feedback.map(item => (
                                    <div key={item._id} style={{ padding: '1.5rem', background: 'white', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <div>
                                                <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#1e293b', marginBottom: '0.5rem' }}>
                                                    {item.is_anonymous ? 'Anonymous' : item.from_batch?.batch_name || 'Unknown Batch'}
                                                </h3>
                                                <p style={{ color: '#475569', lineHeight: '1.5' }}>{item.message_content}</p>
                                                <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '1rem' }}>
                                                    {new Date(item.sent_at).toLocaleDateString()}
                                                </div>
                                            </div>
                                            <button onClick={() => deleteItem(item._id, 'feedback')} className="btn-icon" style={{ color: '#ef4444', background: '#fee2e2' }}>
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {feedback.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-dim)' }}>No registered feedback.</p>}
                            </div>
                        </div>
                    )}

                    {/* PROFILE TAB */}
                    {activeTab === 'profile' && (
                        <div style={{ background: 'white', padding: '3rem', borderRadius: '16px', border: '1px solid #e2e8f0', maxWidth: '800px', margin: '0 auto' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                                <div>
                                    <h2 style={{ fontSize: '1.5rem', color: 'var(--primary)', fontWeight: '700' }}>Chairman Profile</h2>
                                    <p style={{ color: '#64748b' }}>Manage your account details.</p>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
                                <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px' }}>
                                    <label style={{ display: 'block', fontSize: '0.85rem', color: '#64748b', marginBottom: '0.5rem' }}>Full Name</label>
                                    <div style={{ fontWeight: '600', color: '#1e293b' }}>{user.name}</div>
                                </div>
                                <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px' }}>
                                    <label style={{ display: 'block', fontSize: '0.85rem', color: '#64748b', marginBottom: '0.5rem' }}>Email Address</label>
                                    <div style={{ fontWeight: '600', color: '#1e293b' }}>{user.email}</div>
                                </div>
                                <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px' }}>
                                    <label style={{ display: 'block', fontSize: '0.85rem', color: '#64748b', marginBottom: '0.5rem' }}>Role</label>
                                    <div style={{ fontWeight: '600', color: '#1e293b' }}>CHAIRMAN</div>
                                </div>
                                <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px' }}>
                                    <label style={{ display: 'block', fontSize: '0.85rem', color: '#64748b', marginBottom: '0.5rem' }}>Department</label>
                                    <div style={{ fontWeight: '600', color: '#1e293b' }}>{user.department || 'ICE'}</div>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </Layout>
    );
};

export default ChairmanDashboard;
