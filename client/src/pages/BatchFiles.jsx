import React, { useState, useEffect, useContext } from 'react';
import axios from '../utils/axiosConfig';
import { AuthContext } from '../context/AuthContext';
import { useParams, Link } from 'react-router-dom';
import { FaFilePdf, FaFileWord, FaFileImage, FaFile, FaArrowLeft, FaDownload, FaSearch } from 'react-icons/fa';
import { Layout } from '../components/Layout';

const BatchFiles = () => {
    const { user } = useContext(AuthContext);
    const { teacherId } = useParams();
    const [docs, setDocs] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchDocs = async () => {
            try {
                const res = await axios.get(`/documents/batch/${user.id}/teacher/${teacherId}`);
                setDocs(res.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchDocs();
    }, [user.id, teacherId]);

    const getIcon = (filename) => {
        const ext = filename.split('.').pop().toLowerCase();
        if (ext === 'pdf') return <FaFilePdf color="#ef4444" />;
        if (['doc', 'docx'].includes(ext)) return <FaFileWord color="#3b82f6" />;
        if (['jpg', 'png', 'jpeg'].includes(ext)) return <FaFileImage color="#10b981" />;
        return <FaFile color="var(--text-dim)" />;
    };

    const filteredDocs = docs.filter(doc =>
        doc.original_filename.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getDownloadUrl = (doc) => {
        if (!doc.file_path) return '#';

        let url = doc.file_path;

        // Check if it's a Cloudinary URL
        if (url.includes('cloudinary.com')) {
            // Insert fl_attachment to force download and set filename
            const parts = url.split('/upload/');
            if (parts.length === 2) {
                // Extract filename without extension for the parameter, 
                // as Cloudinary adds extension based on original file if not specified, 
                // or we can specify it. Safeguard: just format it nicely.
                // Note: The original_filename typically includes extension.
                // We'll strip the extension for the attachment name param
                // so Cloudinary effectively does name.ext
                const nameWithoutExt = doc.original_filename.replace(/\.[^/.]+$/, "");
                const safeName = encodeURIComponent(nameWithoutExt);

                // Construct new URL with fl_attachment:name
                return `${parts[0]}/upload/fl_attachment:${safeName}/${parts[1]}`;
            }
        }

        // Fallback or local file (though local shouldn't happen with current config)
        if (!url.startsWith('http')) {
            const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            return `${baseUrl}/${url.replace(/\\/g, '/')}`;
        }

        return url;
    };

    return (
        <Layout>
            <div className="container">
                <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <Link to="/batch" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-dim)', textDecoration: 'none', marginBottom: '0.5rem' }}>
                            <FaArrowLeft /> Back to Subject Folders
                        </Link>
                        <h2>Course Documents</h2>
                    </div>
                </header>

                <div className="glass-panel">
                    <div style={{ marginBottom: '1.5rem', position: 'relative' }}>
                        <FaSearch style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                        <input
                            type="text"
                            placeholder="Search files..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 2.5rem', borderRadius: '8px', border: '1px solid #ddd' }}
                        />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {filteredDocs.length === 0 ? <p style={{ color: 'var(--text-dim)', textAlign: 'center', padding: '2rem' }}>No files found matching your search.</p> :
                            filteredDocs.map(doc => (
                                <div key={doc._id} className="interactive-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', transition: 'all 0.2s' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                                        <div style={{ fontSize: '1.75rem' }}>{getIcon(doc.original_filename)}</div>
                                        <div>
                                            <div style={{ fontWeight: '600', color: 'var(--text-main)', fontSize: '1.05rem' }}>{doc.original_filename}</div>
                                            <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>Uploaded: {new Date(doc.upload_date).toLocaleDateString()}</div>
                                        </div>
                                    </div>
                                    <a href={getDownloadUrl(doc)} className="btn-primary" style={{ padding: '0.6rem 1.2rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', borderRadius: '8px' }}>
                                        <FaDownload size={14} /> Download
                                    </a>
                                </div>
                            ))
                        }
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default BatchFiles;
