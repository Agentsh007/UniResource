import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowRight, FaChalkboardTeacher, FaLayerGroup, FaShieldAlt, FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';
import { AuthContext } from '../context/AuthContext';
import { Layout } from '../components/Layout';

const Home = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();


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
            <div className="home-page" style={{ overflowX: 'hidden', fontFamily: "'Inter', sans-serif" }}>

                {/* HERO SECTION */}
                <section style={{
                    padding: '8rem 1rem',
                    textAlign: 'center',
                    background: '#f8fafc',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '80vh'
                }}>
                    <h1 style={{
                        fontSize: '6rem',
                        fontWeight: '800',
                        color: '#ff8c69',
                        marginBottom: '1rem',
                        lineHeight: '1.1'
                    }}>
                        DeptHub
                    </h1>
                    <p style={{
                        fontSize: '1.8rem',
                        color: '#334155',
                        fontFamily: "'Playfair Display', serif",
                        marginBottom: '4rem',
                        letterSpacing: '1px'
                    }}>
                        Connect. Coordinate. Control.
                    </p>

                    <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                        {!user ? (
                            <>
                                <button onClick={() => navigate('/batch-login')} className="hover-scale" style={{
                                    padding: '1rem 2.5rem',
                                    fontSize: '1.1rem',
                                    fontWeight: '600',
                                    borderRadius: '12px',
                                    border: 'none',
                                    background: '#ff7e5f',
                                    color: 'white',
                                    cursor: 'pointer',
                                    boxShadow: '0 4px 12px rgba(255, 126, 95, 0.4)'
                                }}>
                                    Student Access
                                </button>
                                <button onClick={() => navigate('/staff-login')} className="hover-scale" style={{
                                    padding: '1rem 2.5rem',
                                    fontSize: '1.1rem',
                                    fontWeight: '600',
                                    borderRadius: '12px',
                                    border: '2px solid #e2e8f0',
                                    background: 'white',
                                    color: '#475569',
                                    cursor: 'pointer'
                                }}>
                                    Faculty Login
                                </button>
                            </>
                        ) : (
                            <button onClick={goToDashboard} className="hover-scale" style={{
                                padding: '1rem 2.5rem',
                                fontSize: '1.1rem',
                                fontWeight: '600',
                                borderRadius: '12px',
                                border: 'none',
                                background: '#ff7e5f',
                                color: 'white',
                                cursor: 'pointer',
                                boxShadow: '0 4px 12px rgba(255, 126, 95, 0.4)'
                            }}>
                                Go to Dashboard
                            </button>
                        )}
                    </div>
                </section>

                {/* SERVICES SECTION */}
                <section style={{ padding: '6rem 1rem', background: 'white' }}>
                    <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
                        <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
                            <h2 style={{ fontSize: '2.5rem', color: '#1e293b', marginBottom: '1rem', fontWeight: '800' }}>Our Services</h2>
                            <p style={{ fontSize: '1.1rem', color: '#64748b', fontWeight: '500' }}>Comprehensive tools designed for every role in the university ecosystem</p>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '3rem' }}>
                            {/* Academic Management */}
                            <div style={{ padding: '2rem', borderRadius: '16px', background: 'white', border: '1px solid #f1f5f9', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.05)' }}>
                                <div style={{
                                    width: '60px', height: '60px',
                                    borderRadius: '12px',
                                    background: '#dbeafe',
                                    color: '#2563eb',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    marginBottom: '1.5rem',
                                    fontSize: '1.5rem'
                                }}>
                                    <FaChalkboardTeacher />
                                </div>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1e293b', marginBottom: '1rem' }}>Academic Management</h3>
                                <p style={{ color: '#64748b', lineHeight: '1.6' }}>
                                    Empowering teachers and chairmen with tools to manage coursework, schedules, and departmental operations seamlessly.
                                </p>
                            </div>

                            {/* Resource Sharing */}
                            <div style={{ padding: '2rem', borderRadius: '16px', background: 'white', border: '1px solid #f1f5f9', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.05)' }}>
                                <div style={{
                                    width: '60px', height: '60px',
                                    borderRadius: '12px',
                                    background: '#ffedd5',
                                    color: '#f97316',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    marginBottom: '1.5rem',
                                    fontSize: '1.5rem'
                                }}>
                                    <FaLayerGroup />
                                </div>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1e293b', marginBottom: '1rem' }}>Resource Sharing</h3>
                                <p style={{ color: '#64748b', lineHeight: '1.6' }}>
                                    A unified hub for students to access study materials, assignments, and important documents uploaded by faculty.
                                </p>
                            </div>

                            {/* Secure Access */}
                            <div style={{ padding: '2rem', borderRadius: '16px', background: 'white', border: '1px solid #f1f5f9', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.05)' }}>
                                <div style={{
                                    width: '60px', height: '60px',
                                    borderRadius: '12px',
                                    background: '#dcfce7',
                                    color: '#16a34a',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    marginBottom: '1.5rem',
                                    fontSize: '1.5rem'
                                }}>
                                    <FaShieldAlt />
                                </div>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1e293b', marginBottom: '1rem' }}>Secure Access</h3>
                                <p style={{ color: '#64748b', lineHeight: '1.6' }}>
                                    Role-based authentication ensures data privacy and security for all users, from students to administrators.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CONTACT SECTION */}
                <section style={{ background: '#1e293b', color: 'white', padding: '6rem 1rem 2rem 1rem' }}>
                    <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '6rem', marginBottom: '6rem' }}>

                            {/* Left Column */}
                            <div>
                                <h2 style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '1.5rem', color: 'white' }}>Get in Touch</h2>
                                <p style={{ color: '#94a3b8', fontSize: '1.1rem', lineHeight: '1.7', marginBottom: '3rem' }}>
                                    Have questions about the platform? Reach out to our administrative team for support and inquiries.
                                </p>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                                        <div style={{ width: '50px', height: '50px', background: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1e293b' }}>
                                            <FaEnvelope size={20} />
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '0.9rem', color: '#94a3b8', marginBottom: '0.2rem' }}>Email Us</div>
                                            <div style={{ fontSize: '1.1rem', fontWeight: '500' }}>support@uniresource.edu</div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                                        <div style={{ width: '50px', height: '50px', background: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1e293b' }}>
                                            <FaPhone size={20} />
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '0.9rem', color: '#94a3b8', marginBottom: '0.2rem' }}>Call Us</div>
                                            <div style={{ fontSize: '1.1rem', fontWeight: '500' }}>+1 (555) 123-4567</div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                                        <div style={{ width: '50px', height: '50px', background: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1e293b' }}>
                                            <FaMapMarkerAlt size={20} />
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '0.9rem', color: '#94a3b8', marginBottom: '0.2rem' }}>Visit Us</div>
                                            <div style={{ fontSize: '1.1rem', fontWeight: '500' }}>University Campus, Admin Block A</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column - Form */}
                            <div>
                                <form onSubmit={(e) => e.preventDefault()} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    <input
                                        type="text"
                                        placeholder="Your Name"
                                        style={{
                                            background: 'transparent',
                                            border: '1px solid #475569',
                                            padding: '1rem',
                                            borderRadius: '8px',
                                            color: 'white',
                                            fontSize: '1rem'
                                        }}
                                    />
                                    <input
                                        type="email"
                                        placeholder="Email"
                                        style={{
                                            background: 'transparent',
                                            border: '1px solid #475569',
                                            padding: '1rem',
                                            borderRadius: '8px',
                                            color: 'white',
                                            fontSize: '1rem'
                                        }}
                                    />
                                    <textarea
                                        placeholder="Write Your Message Here..."
                                        rows="5"
                                        style={{
                                            background: 'transparent',
                                            border: '1px solid #475569',
                                            padding: '1rem',
                                            borderRadius: '8px',
                                            color: 'white',
                                            fontSize: '1rem',
                                            resize: 'vertical'
                                        }}
                                    ></textarea>
                                    <button style={{
                                        background: '#bf6c4e',
                                        color: 'white',
                                        border: 'none',
                                        padding: '1rem',
                                        borderRadius: '8px',
                                        fontSize: '1rem',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        marginTop: '1rem'
                                    }}>
                                        Send Message
                                    </button>
                                </form>
                            </div>

                        </div>

                        <div style={{ textAlign: 'center', color: '#64748b', fontSize: '0.9rem', paddingTop: '2rem', borderTop: '1px solid #334155' }}>
                            © 2026 UniResource Platform. All rights reserved.
                        </div>
                    </div>
                </section>
            </div>
        </Layout>
    );
};

export default Home;

