import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUserTie, FaUsers, FaArrowRight, FaBullhorn, FaFilePdf, FaImage, FaFolder, FaChalkboardTeacher, FaLayerGroup, FaShieldAlt, FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';
import { AuthContext } from '../context/AuthContext';
import { Layout } from '../components/Layout';
import axios from '../utils/axiosConfig';

const Home = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [notices, setNotices] = useState([]);
    const [loadingNotices, setLoadingNotices] = useState(true);

    useEffect(() => {
        const fetchNotices = async () => {
            try {
                const res = await axios.get('/announcements/public');
                setNotices(res.data);
            } catch (err) {
                console.error("Failed to fetch notices");
            } finally {
                setLoadingNotices(false);
            }
        };
        fetchNotices();
    }, []);

    const goToDashboard = () => {
        if (!user) return;
        if (user.role === 'CHAIRMAN') navigate('/chairman');
        else if (user.role === 'COORDINATOR') navigate('/coordinator');
        else if (user.role === 'COMPUTER_OPERATOR') navigate('/operator');
        else if (user.role === 'CC') navigate('/cc');
        else if (user.role === 'TEACHER') navigate('/teacher');
        else if (user.role === 'BATCH') navigate('/batch');
    };

    return (
        <Layout>
            <div className="home-page" style={{ overflowX: 'hidden' }}>

                {/* HERO SECTION */}
                <section id="home-hero" className="hero-section">
                    <div className="hero-bg-blob-1"></div>
                    <div className="hero-bg-blob-2"></div>

                    <div className="hero-container animate-fade-up">
                        <div className="hero-badge">
                            ✨ The Future of University Management
                        </div>
                        <h1 className="hero-title">
                            Academic Excellence, <span style={{ color: '#2563eb' }}>Simplified.</span>
                        </h1>
                        <p className="hero-subtitle">
                            A centralized platform for students, faculty, and administration to collaborate, share resources, and stay updated with real-time announcements.
                        </p>
                        <div id="hero-cta" className="hero-btn-group animate-fade-up animate-delay-2">
                            {!user ? (
                                <>
                                    <button onClick={() => navigate('/batch-login')} className="btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.1rem', borderRadius: '50px', boxShadow: '0 10px 15px -3px rgba(37, 99, 235, 0.3)' }}>
                                        Student Access <FaArrowRight style={{ marginLeft: '0.5rem' }} />
                                    </button>
                                    <button onClick={() => navigate('/staff-login')} className="btn-secondary">
                                        Faculty Login
                                    </button>
                                </>
                            ) : (
                                <button onClick={goToDashboard} className="btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.1rem', borderRadius: '50px' }}>
                                    Go to Dashboard <FaArrowRight style={{ marginLeft: '0.5rem' }} />
                                </button>
                            )}
                        </div>
                    </div>
                </section>

                {/* SERVICES SECTION */}
                <section id="services" className="section-padding" style={{ background: '#ffffff' }}>
                    <div className="container" style={{ maxWidth: '1200px' }}>
                        <div className="section-header animate-fade-up animate-delay-1">
                            <h2 className="section-title">Our Services</h2>
                            <p className="section-subtitle">Comprehensive tools designed for every role in the university ecosystem.</p>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                            {/* Service 1 */}
                            <div className="service-card animate-fade-up animate-delay-1">
                                <div className="service-icon-wrapper" style={{ background: '#dbeafe', color: '#2563eb' }}>
                                    <FaChalkboardTeacher />
                                </div>
                                <h3 className="service-title">Academic Management</h3>
                                <p className="service-desc">Empowering teachers and chairmen with tools to manage coursework, schedules, and departmental operations seamlessly.</p>
                            </div>

                            {/* Service 2 */}
                            <div className="service-card animate-fade-up animate-delay-2">
                                <div className="service-icon-wrapper" style={{ background: '#ffedd5', color: '#f97316' }}>
                                    <FaLayerGroup />
                                </div>
                                <h3 className="service-title">Resource Sharing</h3>
                                <p className="service-desc">A unified hub for students to access study materials, assignments, and important documents uploaded by faculty.</p>
                            </div>

                            {/* Service 3 */}
                            <div className="service-card animate-fade-up animate-delay-3">
                                <div className="service-icon-wrapper" style={{ background: '#dcfce7', color: '#16a34a' }}>
                                    <FaShieldAlt />
                                </div>
                                <h3 className="service-title">Secure Access</h3>
                                <p className="service-desc">Role-based authentication ensures data privacy and security for all users, from students to administrators.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* NOTICES SECTION */}
                <section id="notices" className="section-padding" style={{ background: '#f1f5f9' }}>
                    <div className="container" style={{ maxWidth: '1000px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                            <div>
                                <h2 className="section-title" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Latest Notices</h2>
                                <p className="section-subtitle">Stay informed with the latest updates from the department.</p>
                            </div>
                            <div style={{ background: 'white', padding: '0.8rem', borderRadius: '50%', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                                <FaBullhorn size={24} color="#f59e0b" />
                            </div>
                        </div>

                        <div className="animate-fade-up" style={{ background: 'white', borderRadius: '20px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                            {loadingNotices ? (
                                <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                                    <div className="spinner" style={{ margin: '0 auto 1rem' }}></div>
                                    <p>Loading updates...</p>
                                </div>
                            ) : notices.length === 0 ? (
                                <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>No recent notices available.</div>
                            ) : (
                                <div className="table-container">
                                    <table className="custom-table">
                                        <thead>
                                            <tr>
                                                <th style={{ padding: '1.25rem 1.5rem', width: '60%' }}>Title</th>
                                                <th style={{ padding: '1.25rem', textAlign: 'center' }}>Attachment</th>
                                                <th style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>Date</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {notices.map((notice) => {
                                                const isPdf = notice.file_url && notice.file_url.toLowerCase().endsWith('.pdf');
                                                const isImage = notice.file_url && (notice.file_url.match(/\.(jpeg|jpg|gif|png)$/) != null);

                                                return (
                                                    <tr key={notice._id}>
                                                        <td style={{ padding: '1.25rem 1.5rem' }}>
                                                            <div style={{ fontWeight: '600', color: '#334155', fontSize: '1.05rem' }}>{notice.title}</div>
                                                        </td>
                                                        <td style={{ padding: '1.25rem', textAlign: 'center' }}>
                                                            {notice.file_url ? (
                                                                <a href={notice.file_url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', borderRadius: '10px', background: isPdf ? '#fef2f2' : '#eff6ff', color: isPdf ? '#ef4444' : '#3b82f6', transition: 'transform 0.2s' }} className="hover-scale">
                                                                    {isPdf ? <FaFilePdf size={20} /> : isImage ? <FaImage size={20} /> : <FaFolder size={20} />}
                                                                </a>
                                                            ) : <span style={{ color: '#cbd5e1' }}>-</span>}
                                                        </td>
                                                        <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right', color: '#64748b', fontWeight: '500' }}>
                                                            {new Date(notice.created_at).toLocaleDateString()}
                                                        </td>
                                                    </tr>
                                                )
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                {/* CONTACT SECTION */}
                <section id="contact" className="section-padding" style={{ background: '#1e293b', color: 'white' }}>
                    <div className="container" style={{ maxWidth: '1000px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '4rem' }}>
                            <div className="animate-fade-up">
                                <h2 style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '1.5rem', color: 'white' }}>Get in Touch</h2>
                                <p style={{ color: '#94a3b8', marginBottom: '2.5rem', fontSize: '1.1rem', lineHeight: '1.6' }}>
                                    Have questions about the platform? Reach out to our administrative team for support and inquiries.
                                </p>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <div className="contact-item">
                                        <div className="contact-icon-circle">
                                            <FaEnvelope />
                                        </div>
                                        <div>
                                            <div className="contact-label">Email Us</div>
                                            <div className="contact-value">support@uniresource.edu</div>
                                        </div>
                                    </div>
                                    <div className="contact-item">
                                        <div className="contact-icon-circle">
                                            <FaPhone />
                                        </div>
                                        <div>
                                            <div className="contact-label">Call Us</div>
                                            <div className="contact-value">+1 (555) 123-4567</div>
                                        </div>
                                    </div>
                                    <div className="contact-item">
                                        <div className="contact-icon-circle">
                                            <FaMapMarkerAlt />
                                        </div>
                                        <div>
                                            <div className="contact-label">Visit Us</div>
                                            <div className="contact-value">University Campus, Admin Block A</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="contact-form-card animate-fade-up animate-delay-2">
                                <form onSubmit={(e) => e.preventDefault()}>
                                    <div style={{ marginBottom: '1.5rem' }}>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#cbd5e1' }}>Your Name</label>
                                        <input type="text" placeholder="John Doe" className="contact-input" />
                                    </div>
                                    <div style={{ marginBottom: '1.5rem' }}>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#cbd5e1' }}>Email Address</label>
                                        <input type="email" placeholder="john@example.com" className="contact-input" />
                                    </div>
                                    <div style={{ marginBottom: '1.5rem' }}>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#cbd5e1' }}>Message</label>
                                        <textarea rows="4" placeholder="How can we help you?" className="contact-input" style={{ resize: 'vertical' }}></textarea>
                                    </div>
                                    <button className="btn-primary" style={{ width: '100%', padding: '1rem', borderRadius: '12px', fontWeight: '600', fontSize: '1rem' }}>Send Message</button>
                                </form>
                            </div>
                        </div>
                    </div>
                </section>

            </div>
        </Layout>
    );
};

export default Home;

