import React, { useState, useEffect, useContext } from 'react';
import axios from '../utils/axiosConfig';
import { AuthContext } from '../context/AuthContext';
import { FaTrash, FaFile, FaUser, FaCloudUploadAlt, FaList, FaBars, FaTimes, FaBullhorn, FaFolder, FaChevronDown, FaChevronRight } from 'react-icons/fa';
import { Loader, Toast } from '../components/UI';
import { useLocation, useNavigate, Link } from 'react-router-dom';

import { Layout } from '../components/Layout';

const TeacherDashboard = () => {
    const { user, loadUser, loading: authLoading } = useContext(AuthContext);
    const location = useLocation();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('new-upload'); // profile, new-upload, my-uploads
    const [batches, setBatches] = useState([]);
    const [myDocs, setMyDocs] = useState([]);
    const [selectedBatch, setSelectedBatch] = useState('');
    const [file, setFile] = useState(null);
    const [msg, setMsg] = useState('');
    const [loading, setLoading] = useState(false);

    // Handle URL Queries
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const tab = params.get('tab');
        if (tab) setActiveTab(tab);
        else navigate('?tab=new-upload', { replace: true });
    }, [location.search, navigate]);

    // Profile Edit State
    const [editMode, setEditMode] = useState(false);
    const [editData, setEditData] = useState({ full_name: '', email: '', department: '' });

    // Mobile Menu
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const [viewingBatch, setViewingBatch] = useState(null);

    useEffect(() => {
        fetchBatches();
        if (activeTab === 'my-uploads') fetchMyDocs();
    }, [activeTab]);

    const fetchBatches = async () => {
        try {
            const res = await axios.get('/batches');
            setBatches(res.data);
            if (res.data.length > 0 && !selectedBatch) setSelectedBatch(res.data[0]._id);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchMyDocs = async () => {
        try {
            const res = await axios.get('/documents/my-uploads');
            setMyDocs(res.data);
        } catch (err) {
            console.error(err);
        }
    };

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
            // Optional: switch to list
        } catch (err) {
            setMsg('Upload Failed');
        } finally {
            setLoading(false);
        }
    };

    const deleteDoc = async (id) => {
        if (!window.confirm('Delete this file?')) return;
        try {
            await axios.delete(`/documents/${id}`);
            fetchMyDocs();
        } catch (err) {
            alert('Delete failed');
        }
    };

    const updateProfile = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.put('/auth/profile', editData);
            if (res.data.success) {
                alert('Profile Updated.');
                setEditMode(false);
                await loadUser(); // Refresh context
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

    if (authLoading) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><Loader /></div>;
    }

    if (!user) return null;

    // Group docs by batch
    const groupedDocs = myDocs.reduce((acc, doc) => {
        const batchName = doc.target_batch?.batch_name || 'Uncategorized';
        if (!acc[batchName]) acc[batchName] = [];
        acc[batchName].push(doc);
        return acc;
    }, {});

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
                    {user.assigned_batch && (
                        <Link to="/cc-dashboard" className="btn-tab" style={{ background: '#f59e0b', color: 'white', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold' }}>
                            <FaBars /> CC Dashboard
                        </Link>
                    )}
                    {renderTabButton('profile', 'Profile', <FaUser />)}
                    {renderTabButton('new-upload', 'New Upload', <FaCloudUploadAlt />)}
                    {renderTabButton('my-uploads', 'My Uploads', <FaList />)}
                    {renderTabButton('announcement', 'Announcements', <FaBullhorn />)}
                </div>

                <div className="glass-panel fade-in" style={{ minHeight: '400px' }}>

                    {activeTab === 'profile' && (
                        <div style={{ padding: '0 0.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                                <div>
                                    <h2 style={{ fontSize: '1.8rem', color: 'var(--text-main)', marginBottom: '0.25rem' }}>Faculty Profile</h2>
                                    <p style={{ color: 'var(--text-dim)' }}>Manage your faculty details.</p>
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

                    {activeTab === 'new-upload' && (
                        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                            <h3 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Upload New Resource</h3>
                            {msg && <p style={{ textAlign: 'center', color: msg.includes('Success') ? 'var(--success)' : 'var(--error)', marginBottom: '1rem' }}>{msg}</p>}

                            {loading ? <div style={{ display: 'flex', justifyContent: 'center', padding: '1rem' }}><Loader /></div> :
                                batches.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-dim)' }}>
                                        <p>No batches found. Please ask the Coordinator to create a batch first.</p>
                                    </div>
                                ) : (
                                    <form onSubmit={handleUpload}>
                                        <div style={{ marginBottom: '1rem' }}>
                                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Target Batch</label>
                                            <select
                                                value={selectedBatch}
                                                onChange={e => setSelectedBatch(e.target.value)}
                                                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd' }}
                                            >
                                                {batches?.map(b => (
                                                    <option key={b._id} value={b._id}>{b.batch_name}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div style={{ marginBottom: '1.5rem' }}>
                                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Select Document</label>
                                            <div style={{ border: '2px dashed #ddd', padding: '2rem', borderRadius: '12px', textAlign: 'center', cursor: 'pointer', background: '#f8fafc' }} onClick={() => document.getElementById('fileInput').click()}>
                                                {file ? <span style={{ fontWeight: 'bold', color: 'var(--primary)' }}>{file.name}</span> : <span style={{ color: 'var(--text-dim)' }}>Click to browse file</span>}
                                            </div>
                                            <input id="fileInput" type="file" onChange={e => setFile(e.target.files[0])} style={{ display: 'none' }} />
                                        </div>

                                        <button type="submit" className="btn-primary" style={{ width: '100%' }}>Upload Resource</button>
                                    </form>
                                )
                            }
                        </div>
                    )}

                    {activeTab === 'my-uploads' && (
                        <div>
                            {viewingBatch ? (
                                <div className="fade-in">
                                    <button
                                        onClick={() => setViewingBatch(null)}
                                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', color: 'var(--text-dim)', fontSize: '0.9rem', cursor: 'pointer', marginBottom: '1rem', padding: 0 }}
                                    >
                                        <FaChevronDown style={{ transform: 'rotate(90deg)' }} /> Back to Folers
                                    </button>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid #e2e8f0' }}>
                                        <div style={{ background: '#eff6ff', padding: '0.75rem', borderRadius: '12px' }}>
                                            <FaFolder size={24} color="#3b82f6" />
                                        </div>
                                        <h3 style={{ margin: 0, fontSize: '1.25rem' }}>{viewingBatch}</h3>
                                        <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)', background: '#f1f5f9', padding: '0.2rem 0.6rem', borderRadius: '12px', marginLeft: 'auto' }}>
                                            {groupedDocs[viewingBatch]?.length || 0} files
                                        </span>
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                        {groupedDocs[viewingBatch]?.map(doc => (
                                            <div key={doc._id} style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                padding: '1rem',
                                                background: 'white',
                                                borderRadius: '12px',
                                                border: '1px solid #e2e8f0',
                                                boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
                                            }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                    <FaFile color="var(--text-dim)" size={18} />
                                                    <div>
                                                        <a href={doc.file_path} target="_blank" rel="noopener noreferrer" style={{ display: 'block', textDecoration: 'none', color: 'var(--text-main)', fontWeight: '500', marginBottom: '0.2rem' }}>
                                                            {doc.original_filename}
                                                        </a>
                                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                                                            {new Date(doc.upload_date).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); deleteDoc(doc._id); }}
                                                    className="btn-icon"
                                                    style={{ width: '32px', height: '32px', color: '#ef4444', background: '#fee2e2' }}
                                                    title="Delete"
                                                >
                                                    <FaTrash size={12} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <h3 style={{ marginBottom: '1.5rem' }}>My Uploaded Resources</h3>
                                    {myDocs.length === 0 ? (
                                        <p style={{ textAlign: 'center', color: 'var(--text-dim)' }}>No uploads found.</p>
                                    ) : (
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                                            {Object.entries(groupedDocs).map(([batchName, docs]) => (
                                                <div
                                                    key={batchName}
                                                    onClick={() => setViewingBatch(batchName)}
                                                    style={{
                                                        background: 'white',
                                                        border: '1px solid #e2e8f0',
                                                        borderRadius: '16px',
                                                        padding: '1.5rem',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s',
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        alignItems: 'center',
                                                        textAlign: 'center',
                                                        userSelect: 'none'
                                                    }}
                                                    className="folder-card hover-lift"
                                                >
                                                    <div style={{ marginBottom: '1rem', color: '#3b82f6' }}>
                                                        <FaFolder size={48} />
                                                    </div>
                                                    <div style={{ fontWeight: '600', color: 'var(--text-main)', marginBottom: '0.25rem' }}>{batchName}</div>
                                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>{docs.length} files</div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'announcement' && (
                        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                            <h3 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Batch Announcement</h3>
                            {msg && <p style={{ textAlign: 'center', color: msg.includes('Success') ? 'var(--success)' : 'var(--error)', marginBottom: '1rem' }}>{msg}</p>}

                            {loading ? <div style={{ display: 'flex', justifyContent: 'center' }}><Loader /></div> :
                                <form onSubmit={async (e) => {
                                    e.preventDefault();
                                    setLoading(true);
                                    try {
                                        await axios.post('/announcements', {
                                            title: e.target.title.value,
                                            content: e.target.content.value,
                                            type: 'ANNOUNCEMENT',
                                            target_batch: selectedBatch
                                        });
                                        setMsg('Announcement Sent Successfully');
                                        e.target.reset();
                                    } catch (err) {
                                        setMsg('Failed to send announcement');
                                    } finally {
                                        setLoading(false);
                                    }
                                }}>
                                    <div style={{ marginBottom: '1rem' }}>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Target Batch</label>
                                        <select
                                            value={selectedBatch}
                                            onChange={e => setSelectedBatch(e.target.value)}
                                            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd' }}
                                        >
                                            {batches?.map(b => (
                                                <option key={b._id} value={b._id}>{b.batch_name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div style={{ marginBottom: '1rem' }}>
                                        <input name="title" type="text" placeholder="Title" required style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ddd' }} />
                                    </div>
                                    <div style={{ marginBottom: '1.5rem' }}>
                                        <textarea name="content" rows="4" placeholder="Message..." required style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ddd', resize: 'vertical' }}></textarea>
                                    </div>

                                    <button type="submit" className="btn-primary" style={{ width: '100%' }}>Send Announcement</button>
                                </form>
                            }
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default TeacherDashboard;
