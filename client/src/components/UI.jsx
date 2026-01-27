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
