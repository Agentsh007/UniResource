import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const ViewBatches = () => {
    const [batches, setBatches] = useState([]);

    useEffect(() => {
        const fetchBatches = async () => {
            try {
                const res = await api.get('/batches');
                setBatches(res.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchBatches();
    }, []);

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">My Batches</h2>
                <Link to="../create-batch" className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700">
                    + New Batch
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {batches.map(batch => (
                    <div key={batch._id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <h3 className="text-xl font-bold text-indigo-700">{batch.name}</h3>
                        <div className="mt-4 space-y-2 text-sm text-gray-600">
                            <p><span className="font-semibold">Username:</span> {batch.username}</p>
                            <p><span className="font-semibold">Created:</span> {new Date(batch.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="mt-4 pt-4 border-t flex justify-end">
                            {/* Placeholders for edit/delete */}
                            <button className="text-sm text-red-500 hover:text-red-700">Delete batch</button>
                        </div>
                    </div>
                ))}
                {batches.length === 0 && <p className="text-gray-500 col-span-full text-center">No batches created yet.</p>}
            </div>
        </div>
    );
};

export default ViewBatches;
