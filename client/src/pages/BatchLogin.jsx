import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

import { Loader, Toast } from '../components/UI';

const BatchLogin = () => {
    const [formData, setFormData] = useState({ username: '', password: '' });
    const { loginBatch, user } = useContext(AuthContext);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    React.useEffect(() => {
        if (user) {
            navigate('/batch');
        }
    }, [user, navigate]);

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await loginBatch(formData.username, formData.password);
            if (res.success) {
                navigate('/batch');
            } else {
                setError(res.msg);
            }
        } catch (err) {
            setError('Connection failed. Please check your internet or try again later.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
            <div className="glass-panel" style={{ width: '100%', maxWidth: '400px' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Batch Login</h2>
                {error && <Toast message={error} onClose={() => setError('')} />}

                {loading ? <div style={{ textAlign: 'center', padding: '2rem' }}><Loader /><p style={{ marginTop: '1rem', color: 'var(--text-dim)' }}>Unlocking class resources...</p></div> :
                    <form onSubmit={onSubmit}>
                        <input type="text" placeholder="Batch Username (e.g. CSE-24)" name="username" value={formData.username} onChange={onChange} required />
                        <input type="password" placeholder="Batch Password" name="password" value={formData.password} onChange={onChange} required />

                        <button type="submit" className="btn-primary" style={{ width: '100%' }}>
                            Enter Class
                        </button>
                    </form>
                }
            </div>
        </div>
    );
};

export default BatchLogin;
