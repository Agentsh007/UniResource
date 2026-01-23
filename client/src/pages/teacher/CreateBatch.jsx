import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const CreateBatch = () => {
    const [formData, setFormData] = useState({ name: '', username: '', password: '' });
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/batches', formData);
            alert('Batch Created Successfully!');
            navigate('../batches');
        } catch (err) {
            alert('Error creating batch');
        }
    };

    return (
        <div className="bg-white p-8 rounded-xl shadow-md max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Create New Student Batch</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-gray-700 mb-1">Batch Name (e.g. CSE-2025)</label>
                    <input
                        type="text"
                        className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        required
                    />
                </div>
                <div>
                    <label className="block text-gray-700 mb-1">Batch Login Username</label>
                    <input
                        type="text"
                        className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={formData.username}
                        onChange={e => setFormData({ ...formData, username: e.target.value })}
                        required
                    />
                </div>
                <div>
                    <label className="block text-gray-700 mb-1">Batch Login Password</label>
                    <input
                        type="text"
                        className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={formData.password}
                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                        required
                    />
                </div>
                <button className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700 transition">
                    Create Batch
                </button>
            </form>
        </div>
    );
};

export default CreateBatch;
