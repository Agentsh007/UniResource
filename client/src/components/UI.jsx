import React from 'react';
import { FaExclamationCircle, FaTimes, FaCheckCircle } from 'react-icons/fa';

export const Loader = () => (
    <div className="loader-container">
        <div className="spinner"></div>
    </div>
);

export const Toast = ({ message, type = 'error', onClose }) => {
    if (!message) return null;
    const isSuccess = type === 'success';
    return (
        <div className={`toast-notification ${isSuccess ? 'toast-success' : 'toast-error'}`}>
            <div className="toast-icon">
                {isSuccess ? <FaCheckCircle /> : <FaExclamationCircle />}
            </div>
            <div>
                <strong>{isSuccess ? 'Success' : 'Error'}</strong>
                <div style={{ fontSize: '0.9rem' }}>{message}</div>
            </div>
            <button onClick={onClose}><FaTimes /></button>
        </div>
    );
};

export const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, isDanger = false }) => {
    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            background: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(4px)',
            display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 3000,
            animation: 'fadeIn 0.2s ease-out'
        }}>
            <div style={{
                background: 'white', padding: '2rem', borderRadius: '16px',
                width: '90%', maxWidth: '420px',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                border: '1px solid #e2e8f0',
                animation: 'slideInUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
            }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                    <div style={{
                        width: '48px', height: '48px', borderRadius: '50%',
                        background: isDanger ? '#fef2f2' : '#eff6ff',
                        color: isDanger ? '#ef4444' : 'var(--primary)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1.5rem', flexShrink: 0
                    }}>
                        {isDanger ? <FaExclamationCircle /> : <FaCheckCircle />}
                    </div>
                    <div>
                        <h3 style={{ fontSize: '1.25rem', margin: '0 0 0.5rem 0', color: 'var(--text-main)' }}>
                            {title || 'Are you sure?'}
                        </h3>
                        <p style={{ color: 'var(--text-dim)', margin: '0 0 1.5rem 0', lineHeight: '1.5' }}>
                            {message}
                        </p>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                    <button
                        onClick={onClose}
                        className="btn-secondary"
                        style={{ padding: '0.6rem 1.2rem', fontSize: '0.95rem' }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="btn-primary"
                        style={{
                            background: isDanger ? '#ef4444' : 'var(--primary)',
                            padding: '0.6rem 1.2rem',
                            fontSize: '0.95rem',
                            boxShadow: isDanger ? '0 4px 6px -1px rgba(239, 68, 68, 0.3)' : undefined
                        }}
                    >
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
};
