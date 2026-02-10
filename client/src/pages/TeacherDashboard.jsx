import React, { useState, useEffect, useContext } from 'react';
import axios from '../utils/axiosConfig';
import { AuthContext } from '../context/AuthContext';
import { Layout } from '../components/Layout';
import { Loader, ConfirmModal } from '../components/UI';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaCloudUploadAlt, FaFilePdf, FaTrash, FaEye, FaEdit, FaUser, FaEnvelope, FaBuilding, FaIdBadge } from 'react-icons/fa';

const TeacherDashboard = () => {
    const { user, loadUser, loading: authLoading } = useContext(AuthContext);
    const location = useLocation();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('new-upload');
    const [batches, setBatches] = useState([]);
    const [myDocs, setMyDocs] = useState([]);
    const [notices, setNotices] = useState([]);
    const [routines, setRoutines] = useState([]);
    const [selectedBatch, setSelectedBatch] = useState('');
    const [file, setFile] = useState(null);
    const [msg, setMsg] = useState('');
    const [loading, setLoading] = useState(false);

    // Profile Edit State
    const [editMode, setEditMode] = useState(false);
    const [editData, setEditData] = useState({ full_name: '', email: '', department: '' });

    // Modal State
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', onConfirm: null, isDanger: false });
    const closeConfirmModal = () => setConfirmModal(prev => ({ ...prev, isOpen: false }));

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const tab = params.get('tab');
        if (tab) setActiveTab(tab);
        else navigate('?tab=new-upload', { replace: true });
    }, [location.search, navigate]);

    // Feedback State
    const [feedbackList, setFeedbackList] = useState([]);

    const fetchBatches = async () => {
        try {
            const res = await axios.get('/batches');
            setBatches(res.data);
            if (res.data.length > 0 && !selectedBatch) setSelectedBatch(res.data[0]._id);
        } catch (err) { console.error(err); }
    };

    const fetchMyDocs = async () => {
        try {
            const res = await axios.get('/documents/my-uploads');
            setMyDocs(res.data);
        } catch (err) { console.error(err); }
    };

    const fetchNotices = async () => {
        try {
            const res = await axios.get('/announcements');
            setNotices(res.data.filter(n => n.type === 'NOTICE'));
        } catch (err) { console.error(err); }
    };

    const fetchRoutines = async () => {
        try {
            const res = await axios.get('/announcements');
            const allRoutines = res.data.filter(n => n.type === 'ROUTINE');
            setRoutines(allRoutines);

            // Fetch feedback for my routines
            const myRoutines = allRoutines.filter(r => r.author?._id === user.id);
            if (myRoutines.length > 0) {
                // Fetch feedback for each
                let allFeedback = [];
                for (let r of myRoutines) {
                    try {
                        const fbRes = await axios.get(`/feedback?target_announcement_id=${r._id}`);
                        allFeedback = [...allFeedback, ...fbRes.data];
                    } catch (e) { console.error(e); }
                }
                setFeedbackList(allFeedback);
            }
        } catch (err) { console.error(err); }
    };

    useEffect(() => {
        if (activeTab === 'new-upload' || activeTab === 'announcement') fetchBatches();
        if (activeTab === 'my-uploads') fetchMyDocs();
        if (activeTab === 'notices') fetchNotices();
        if (activeTab === 'routine') {
            fetchRoutines();
        }
        if (activeTab === 'peer-review') fetchRoutines(); // To see others' routines
    }, [activeTab]);

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('target_batch_id', selectedBatch);

        setLoading(true);
        setMsg('');
        try {
            await axios.post(`/documents/upload?target_batch_id=${selectedBatch}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setMsg('File Uploaded Successfully');
            setFile(null);
        } catch (err) {
            setMsg('Upload Failed');
        } finally {
            setLoading(false);
        }
    };

    const handleRoutineUpload = async (e) => {
        e.preventDefault();
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('title', 'Routine');
        formData.append('content', e.target.msg.value);
        formData.append('type', 'ROUTINE');
        formData.append('status', window.uploadStatus || 'PENDING_FEEDBACK');

        setLoading(true);
        try {
            await axios.post('/announcements', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert('Routine Sent for Approval');
            setFile(null);
            e.target.reset();
            fetchRoutines();
        } catch (err) {
            alert('Failed to send routine');
        } finally {
            setLoading(false);
        }
    };

    const updateProfile = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.put('/auth/profile', editData);
            if (res.data.success) {
                alert('Profile Updated.');
                setEditMode(false);
                await loadUser();
            }
        } catch (err) {
            alert('Update failed');
        }
    };

    const handleClassUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMsg('');
        try {
            const type = e.target.type.value;
            const message = e.target.message.value;
            const title = `[${type}] Class Update`;

            await axios.post('/announcements', {
                title,
                content: message,
                type: 'ANNOUNCEMENT',
                target_batch: selectedBatch
            });
            setMsg('Class Update Sent Successfully');
            e.target.reset();
        } catch (err) {
            setMsg('Failed to send update');
        } finally {
            setLoading(false);
        }
    };

    const submitPeerFeedback = async (routineId, feedbackContent) => {
        if (!feedbackContent) return;
        try {
            await axios.post('/feedback', {
                message_content: feedbackContent,
                target_announcement: routineId, // Fixed: backend expects target_announcement or target_announcement_id? Check model.
                // feedbackRoutes says: const { ... target_announcement } = req.body;
                is_anonymous: false
            });
            alert('Feedback sent!');
            fetchRoutines();
        } catch (err) {
            alert('Failed to send feedback');
        }
    };

    const deleteFeedback = async (id) => {
        if (!window.confirm('Delete this feedback?')) return;
        try {
            await axios.delete(`/feedback/${id}`);
            fetchRoutines();
        } catch (err) {
            alert('Failed to delete feedback');
        }
    };

    const deleteRoutine = async (id) => {
        if (!window.confirm('Delete this routine?')) return;
        try {
            await axios.delete(`/announcements/${id}`);
            fetchRoutines();
        } catch (err) {
            alert('Failed to delete routine');
        }
    };

    const deleteDoc = (id) => {
        setConfirmModal({
            isOpen: true, title: 'Delete File?', message: 'Permanently delete this file?', isDanger: true,
            onConfirm: async () => {
                try { await axios.delete(`/documents/${id}`); fetchMyDocs(); }
                catch (err) { alert('Delete failed'); } finally { closeConfirmModal(); }
            }
        });
    };

    if (authLoading) return <div style={{ display: 'flex', justifyContent: 'center', height: '100vh', alignItems: 'center' }}><Loader /></div>;
    if (!user) return null;

    return (
        <Layout>
            <div className="container" style={{ maxWidth: '1200px', padding: '2rem' }}>
                <ConfirmModal isOpen={confirmModal.isOpen} onClose={closeConfirmModal} onConfirm={confirmModal.onConfirm} title={confirmModal.title} message={confirmModal.message} isDanger={confirmModal.isDanger} />

                {/* Profile Tab */}
                {activeTab === 'profile' && (
                    <div className="fade-in">
                        <div style={{ background: 'white', padding: '3rem', borderRadius: '16px', border: '1px solid #fee2e2', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                                <div>
                                    <h2 style={{ fontSize: '2rem', color: '#f97316', marginBottom: '0.5rem' }}>Teacher Profile</h2>
                                    <p style={{ color: '#64748b', fontSize: '1.1rem' }}>Manage your account details.</p>
                                </div>
                                {!editMode && (
                                    <button onClick={() => { setEditData({ full_name: user.name, email: user.email, department: user.department || '' }); setEditMode(true); }} style={{ padding: '0.8rem 1.5rem', background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', fontWeight: '500', color: '#1e293b' }}>
                                        Edit Profile
                                    </button>
                                )}
                            </div>
                            {editMode ? (
                                <form onSubmit={updateProfile} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                                    <div><label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Full Name</label><input type="text" value={editData.full_name} onChange={e => setEditData({ ...editData, full_name: e.target.value })} style={{ width: '100%', padding: '1rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px' }} /></div>
                                    <div><label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Email Address</label><input type="email" value={editData.email} onChange={e => setEditData({ ...editData, email: e.target.value })} style={{ width: '100%', padding: '1rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px' }} /></div>
                                    <div><label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Department</label><input type="text" value={editData.department} onChange={e => setEditData({ ...editData, department: e.target.value })} style={{ width: '100%', padding: '1rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px' }} /></div>
                                    <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '1rem', marginTop: '1rem' }}><button type="submit" className="btn-primary">Save Changes</button><button type="button" onClick={() => setEditMode(false)} className="btn-secondary">Cancel</button></div>
                                </form>
                            ) : (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                                    <div style={{ background: '#f1f5f9', padding: '2rem', borderRadius: '12px' }}><label style={{ display: 'block', fontSize: '0.9rem', color: '#64748b', marginBottom: '0.5rem' }}>Full Name</label><div style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1e293b' }}>{user.name}</div></div>
                                    <div style={{ background: '#f1f5f9', padding: '2rem', borderRadius: '12px' }}><label style={{ display: 'block', fontSize: '0.9rem', color: '#64748b', marginBottom: '0.5rem' }}>Email Address</label><div style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1e293b' }}>{user.email}</div></div>
                                    <div style={{ background: '#f1f5f9', padding: '2rem', borderRadius: '12px' }}><label style={{ display: 'block', fontSize: '0.9rem', color: '#64748b', marginBottom: '0.5rem' }}>Role</label><div style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1e293b' }}>{user.role}</div></div>
                                    <div style={{ background: '#f1f5f9', padding: '2rem', borderRadius: '12px' }}><label style={{ display: 'block', fontSize: '0.9rem', color: '#64748b', marginBottom: '0.5rem' }}>Department</label><div style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1e293b' }}>{user.department || 'ICE'}</div></div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Notices Tab */}
                {activeTab === 'notices' && (
                    <div className="fade-in">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}><h2 style={{ fontSize: '2rem', color: '#1e293b' }}>Latest Notices</h2></div>
                        <div style={{ background: 'white', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead><tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}><th style={{ padding: '1.5rem', textAlign: 'left', fontSize: '0.85rem', color: '#64748b' }}>NO</th><th style={{ padding: '1.5rem', textAlign: 'left', fontSize: '0.85rem', color: '#64748b' }}>Title</th><th style={{ padding: '1.5rem', textAlign: 'center', fontSize: '0.85rem', color: '#64748b' }}>Files</th><th style={{ padding: '1.5rem', textAlign: 'right', fontSize: '0.85rem', color: '#64748b' }}>Date</th><th style={{ padding: '1.5rem', textAlign: 'right', fontSize: '0.85rem', color: '#64748b' }}>Action</th></tr></thead>
                                <tbody>
                                    {notices.map((notice, index) => (
                                        <tr key={notice._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                            <td style={{ padding: '1.5rem', color: '#64748b' }}>{index + 1}</td>
                                            <td style={{ padding: '1.5rem', fontWeight: '500', color: '#1e293b' }}>{notice.title}</td>
                                            <td style={{ padding: '1.5rem', textAlign: 'center' }}>{notice.file_url ? <FaFilePdf color="#ef4444" size={20} /> : '-'}</td>
                                            <td style={{ padding: '1.5rem', textAlign: 'right', color: '#64748b' }}>{new Date(notice.created_at).toLocaleDateString()}</td>
                                            <td style={{ padding: '1.5rem', textAlign: 'right' }}>{notice.file_url && <a href={notice.file_url} target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6', fontWeight: '500', textDecoration: 'none' }}>View</a>}</td>
                                        </tr>
                                    ))}
                                    {notices.length === 0 && <tr><td colSpan="5" style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>No notices found.</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* My Routines Tab */}
                {activeTab === 'routine' && (
                    <div className="fade-in">
                        <div style={{ background: 'white', padding: '3rem', borderRadius: '16px', border: '1px solid #fee2e2', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', marginBottom: '2rem' }}>
                            <h2 style={{ fontSize: '1.5rem', color: '#1e293b', marginBottom: '2rem' }}>Upload Routine</h2>
                            <form onSubmit={handleRoutineUpload}>
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#1e293b' }}>Select Document</label>
                                    <div onClick={() => document.getElementById('routineFile').click()} style={{ border: '2px dashed #f97316', background: '#fff7ed', borderRadius: '12px', padding: '3rem', textAlign: 'center', cursor: 'pointer' }}>
                                        <div style={{ color: '#f97316', marginBottom: '1rem' }}><FaCloudUploadAlt size={48} /></div>
                                        {file ? <div style={{ fontWeight: '600' }}>{file.name}</div> : <div style={{ color: '#1e293b', fontWeight: '600' }}>Click to browse file</div>}
                                    </div>
                                    <input id="routineFile" type="file" onChange={e => setFile(e.target.files[0])} style={{ display: 'none' }} accept=".pdf,.doc,.docx,.jpg,.png" />
                                </div>
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <textarea name="msg" placeholder="Message..." rows="4" style={{ width: '100%', padding: '1rem', background: '#f1f5f9', border: 'none', borderRadius: '12px', resize: 'none' }}></textarea>
                                </div>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <button type="submit" onClick={() => { window.uploadStatus = 'PENDING_FEEDBACK'; }} className="btn-secondary" style={{ flex: 1, borderRadius: '8px' }} disabled={loading}>
                                        Request Peer Feedback
                                    </button>
                                    <button type="submit" onClick={() => { window.uploadStatus = 'PENDING_APPROVAL'; }} className="btn-primary" style={{ flex: 1, borderRadius: '8px' }} disabled={loading}>
                                        Send for Approval
                                    </button>
                                </div>
                            </form>
                        </div>
                        {/* My Uploaded Routines List */}
                        <div style={{ marginTop: '2rem' }}>
                            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#1e293b' }}>My Routine History</h3>
                            <div style={{ display: 'grid', gap: '1rem' }}>
                                {routines.filter(r => r.author?._id === user.id).map(r => (
                                    <div key={r._id} style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', alignItems: 'flex-start' }}>
                                            <div style={{ fontWeight: 'bold', color: '#334155' }}>{r.title}</div>
                                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                                <span style={{ fontSize: '0.8rem', padding: '0.2rem 0.6rem', borderRadius: '12px', background: r.status === 'APPROVED' ? '#dcfce7' : r.status === 'PENDING_FEEDBACK' ? '#fef9c3' : '#e0e7ff', color: r.status === 'APPROVED' ? '#166534' : r.status === 'PENDING_FEEDBACK' ? '#854d0e' : '#3730a3' }}>
                                                    {r.status.replace('_', ' ')}
                                                </span>
                                                <button onClick={() => deleteRoutine(r._id)} style={{ color: '#ef4444', background: '#fee2e2', padding: '0.4rem', borderRadius: '50%', cursor: 'pointer', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Delete Routine">
                                                    <FaTrash size={12} />
                                                </button>
                                            </div>
                                        </div>
                                        <p style={{ color: '#64748b' }}>{r.content}</p>
                                        {r.file_url && <a href={r.file_url} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}><FaFilePdf /> View Routine</a>}
                                        {r.feedback && (
                                            <div style={{ marginTop: '1rem', padding: '1rem', background: '#fef2f2', borderRadius: '8px', borderLeft: '3px solid #ef4444' }}>
                                                <div style={{ fontSize: '0.85rem', fontWeight: '600', color: '#991b1b' }}>Admin Feedback:</div>
                                                <div style={{ fontSize: '0.9rem', color: '#7f1d1d' }}>{r.feedback}</div>
                                            </div>
                                        )}
                                        {/* Peer Feedback Section */}
                                        {feedbackList.filter(f => f.target_announcement === r._id).length > 0 && (
                                            <div style={{ marginTop: '1rem', padding: '1rem', background: '#f0f9ff', borderRadius: '8px', borderLeft: '3px solid #0ea5e9' }}>
                                                <div style={{ fontSize: '0.85rem', fontWeight: '600', color: '#0369a1', marginBottom: '0.5rem' }}>Peer Feedback:</div>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                    {feedbackList.filter(f => f.target_announcement === r._id).map(f => (
                                                        <div key={f._id} style={{ fontSize: '0.9rem', color: '#334155', borderBottom: '1px solid #e0f2fe', paddingBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                            <div>
                                                                <span style={{ fontWeight: '600', marginRight: '0.5rem' }}>{f.from_user?.full_name || 'Anonymous'}:</span>
                                                                {f.message_content}
                                                            </div>
                                                            <button onClick={() => deleteFeedback(f._id)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.2rem' }} title="Delete Feedback">
                                                                <FaTrash size={12} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                                {routines.filter(r => r.author?._id === user.id).length === 0 && (
                                    <p style={{ color: '#94a3b8', textAlign: 'center' }}>No routines uploaded yet.</p>
                                )}
                            </div>
                        </div>

                        {/* Approved Routines from Others */}
                        <div style={{ marginTop: '3rem' }}>
                            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#1e293b' }}>Department Routines (Approved)</h3>
                            <div style={{ display: 'grid', gap: '1rem' }}>
                                {routines.filter(r => r.status === 'APPROVED' && r.author?._id !== user.id).map(r => (
                                    <div key={r._id} style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', alignItems: 'flex-start' }}>
                                            <div style={{ fontWeight: 'bold', color: '#334155' }}>{r.title} <span style={{ fontWeight: 'normal', color: '#64748b' }}>- by {r.author?.full_name}</span></div>
                                            <span style={{ fontSize: '0.8rem', padding: '0.2rem 0.6rem', borderRadius: '12px', background: '#dcfce7', color: '#166534' }}>
                                                APPROVED
                                            </span>
                                        </div>
                                        <p style={{ color: '#64748b' }}>{r.content}</p>
                                        {r.file_url && <a href={r.file_url} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}><FaFilePdf /> View Routine</a>}
                                    </div>
                                ))}
                                {routines.filter(r => r.status === 'APPROVED' && r.author?._id !== user.id).length === 0 && (
                                    <p style={{ color: '#94a3b8', textAlign: 'center' }}>No approved routines from others.</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Peer Review Tab */}
                {activeTab === 'peer-review' && (
                    <div className="fade-in">
                        <h2 style={{ fontSize: '1.5rem', color: '#1e293b', marginBottom: '2rem' }}>Peer Review (Pending Feedback)</h2>
                        <div style={{ display: 'grid', gap: '1.5rem' }}>
                            {routines.filter(r => r.status === 'PENDING_FEEDBACK' && r.author?._id !== user.id).map(r => (
                                <div key={r._id} style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                    <div style={{ fontWeight: 'bold' }}>{r.title} - <span style={{ fontWeight: 'normal', color: '#64748b' }}>by {r.author?.full_name}</span></div>
                                    <p style={{ margin: '0.5rem 0', color: '#475569' }}>{r.content}</p>
                                    {r.file_url && <a href={r.file_url} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}><FaFilePdf /> View Routine</a>}
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <input type="text" id={`feedback-${r._id}`} placeholder="Write feedback..." style={{ flex: 1, padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                                        <button onClick={() => {
                                            const val = document.getElementById(`feedback-${r._id}`).value;
                                            submitPeerFeedback(r._id, val);
                                        }} className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>Send</button>
                                    </div>
                                </div>
                            ))}
                            {routines.filter(r => r.status === 'PENDING_FEEDBACK' && r.author?._id !== user.id).length === 0 && (
                                <p style={{ color: '#94a3b8', textAlign: 'center' }}>No routines pending peer review.</p>
                            )}
                        </div>
                    </div>
                )}

                {/* Class Updates Tab */}
                {activeTab === 'class-updates' && (
                    <div className="fade-in" style={{ display: 'flex', justifyContent: 'center' }}>
                        <div style={{ maxWidth: '600px', width: '100%', background: 'white', padding: '3rem', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                            <h2 style={{ textAlign: 'center', marginBottom: '2rem', color: '#1e293b' }}>Send Class Update</h2>
                            {msg && <div style={{ textAlign: 'center', padding: '1rem', background: msg.includes('Success') ? '#dcfce7' : '#fee2e2', borderRadius: '8px', marginBottom: '1rem' }}>{msg}</div>}
                            <form onSubmit={handleClassUpdate}>
                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.5rem' }}>Select Batch</label>
                                    <select value={selectedBatch} onChange={e => setSelectedBatch(e.target.value)} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                                        {batches.map(b => <option key={b._id} value={b._id}>{b.batch_name}</option>)}
                                    </select>
                                </div>
                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.5rem' }}>Update Type</label>
                                    <select name="type" style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                                        <option value="CANCEL">Class Cancellation</option>
                                        <option value="RESCHEDULE">Reschedule</option>
                                        <option value="ALARM">Alarm/Reminder</option>
                                    </select>
                                </div>
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.5rem' }}>Message</label>
                                    <textarea name="message" rows="4" required style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}></textarea>
                                </div>
                                <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={loading}>Post Update</button>
                            </form>
                        </div>
                    </div>
                )}

                {/* Resource Upload Tab */}
                {activeTab === 'new-upload' && (
                    <div className="fade-in" style={{ display: 'flex', justifyContent: 'center' }}>
                        <div style={{ maxWidth: '700px', width: '100%', background: 'white', padding: '3rem', borderRadius: '20px', border: '1px solid #fee2e2', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)' }}>
                            <h2 style={{ textAlign: 'center', marginBottom: '2rem', color: '#1e293b' }}>Upload Resource</h2>
                            {msg && <div style={{ textAlign: 'center', padding: '1rem', background: msg.includes('Success') ? '#dcfce7' : '#fee2e2', color: msg.includes('Success') ? '#166534' : '#991b1b', borderRadius: '8px', marginBottom: '1.5rem' }}>{msg}</div>}

                            <form onSubmit={handleUpload}>
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Target Batch</label>
                                    <select value={selectedBatch} onChange={e => setSelectedBatch(e.target.value)} style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc' }}>
                                        {batches.map(b => <option key={b._id} value={b._id}>{b.batch_name}</option>)}
                                    </select>
                                </div>
                                <div style={{ marginBottom: '2rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Select Document</label>
                                    <div onClick={() => document.getElementById('resFile').click()} style={{ border: '2px dashed #cbd5e1', padding: '3rem', borderRadius: '16px', textAlign: 'center', cursor: 'pointer', background: '#f8fafc' }}>
                                        <div style={{ color: '#94a3b8', marginBottom: '1rem' }}><FaCloudUploadAlt size={40} /></div>
                                        {file ? <div style={{ fontWeight: '600' }}>{file.name}</div> : <div style={{ color: '#64748b' }}>Click to browse file</div>}
                                    </div>
                                    <input id="resFile" type="file" onChange={e => setFile(e.target.files[0])} style={{ display: 'none' }} />
                                </div>
                                <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={loading}>Upload Resource</button>
                            </form>
                        </div>
                    </div>
                )}

                {/* My Uploads Tab */}
                {activeTab === 'my-uploads' && (
                    <div className="fade-in" style={{ background: 'white', padding: '2rem', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                        <h2 style={{ marginBottom: '2rem', color: '#1e293b' }}>My Uploads</h2>
                        {myDocs.length === 0 ? <p style={{ color: '#94a3b8' }}>No uploads found.</p> :
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>
                                {myDocs.map(doc => (
                                    <div key={doc._id} style={{ padding: '1.5rem', border: '1px solid #e2e8f0', borderRadius: '12px', position: 'relative' }}>
                                        <div style={{ marginBottom: '1rem', color: '#f97316' }}><FaFilePdf size={32} /></div>
                                        <div style={{ fontWeight: '600', marginBottom: '0.5rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{doc.original_filename}</div>
                                        <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{new Date(doc.upload_date).toLocaleDateString()}</div>
                                        <button onClick={() => deleteDoc(doc._id)} style={{ position: 'absolute', top: '1rem', right: '1rem', border: 'none', background: '#fee2e2', color: '#ef4444', width: '30px', height: '30px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FaTrash size={12} /></button>
                                        <a href={doc.file_path} target="_blank" rel="noopener noreferrer" style={{ display: 'block', marginTop: '1rem', color: '#3b82f6', fontSize: '0.9rem', textDecoration: 'none', fontWeight: '500' }}>View File</a>
                                    </div>
                                ))}
                            </div>
                        }
                    </div>
                )}

            </div>
        </Layout>
    );
};

export default TeacherDashboard;
