import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

const UploadResource = () => {
    const [batches, setBatches] = useState([]);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        type: 'PDF',
        visibility: 'BATCH',
        targetBatch: ''
    });
    const [file, setFile] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        // Fetch batches for the dropdown
        const fetchBatches = async () => {
            try {
                const res = await api.get('/batches');
                setBatches(res.data);
                if (res.data.length > 0) {
                    setFormData(prev => ({ ...prev, targetBatch: res.data[0]._id }));
                }
            } catch (err) {
                console.error(err);
            }
        };
        fetchBatches();
    }, []);

    const handleChange = e => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = e => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Create FormData for file upload
        const data = new FormData();
        data.append('title', formData.title);
        data.append('description', formData.description);
        data.append('type', formData.type);
        data.append('visibility', formData.visibility);
        if (formData.visibility === 'BATCH') {
            data.append('targetBatch', formData.targetBatch);
        }
        if (file) {
            data.append('file', file);
        }

        try {
            await api.post('/resources/upload', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success('Resource Uploaded Successfully!');
            navigate('../');
        } catch (err) {
            console.error(err);
            toast.error('Upload Failed');
        }
    };

    return (
        <div className="bg-white p-8 rounded-xl shadow-md max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Upload New Resource</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-gray-700 font-medium mb-1">Title</label>
                    <input
                        type="text"
                        name="title"
                        className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={formData.title}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div>
                    <label className="block text-gray-700 font-medium mb-1">Description</label>
                    <textarea
                        name="description"
                        rows="3"
                        className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={formData.description}
                        onChange={handleChange}
                    ></textarea>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-gray-700 font-medium mb-1">Resource Type</label>
                        <select name="type" value={formData.type} onChange={handleChange} className="w-full border rounded-lg px-4 py-2">
                            <option value="PDF">PDF Document</option>
                            <option value="PPT">Presentation (PPT)</option>
                            <option value="CODE">Code Snippet/File</option>
                            <option value="TEXT">Text Announcement</option>
                        </select>
                    </div>

                    {formData.type !== 'TEXT' && (
                        <div>
                            <label className="block text-gray-700 font-medium mb-1">File Attachment</label>
                            <input type="file" onChange={handleFileChange} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
                        </div>
                    )}
                </div>

                <div className="border-t pt-4">
                    <h3 className="text-lg font-semibold text-gray-700 mb-3">Visibility Settings</h3>
                    <div className="flex items-center space-x-6">
                        <label className="flex items-center">
                            <input
                                type="radio"
                                name="visibility"
                                value="BATCH"
                                checked={formData.visibility === 'BATCH'}
                                onChange={handleChange}
                                className="mr-2"
                            />
                            <span>Specific Batch (Private)</span>
                        </label>
                        <label className="flex items-center">
                            <input
                                type="radio"
                                name="visibility"
                                value="GLOBAL"
                                checked={formData.visibility === 'GLOBAL'}
                                onChange={handleChange}
                                className="mr-2"
                            />
                            <span>University Hub (Public)</span>
                        </label>
                    </div>

                    {formData.visibility === 'BATCH' && (
                        <div className="mt-4">
                            <label className="block text-gray-700 font-medium mb-1">Select Target Batch</label>
                            <select name="targetBatch" value={formData.targetBatch} onChange={handleChange} className="w-full border rounded-lg px-4 py-2">
                                {batches.map(b => (
                                    <option key={b._id} value={b._id}>{b.name}</option>
                                ))}
                                {batches.length === 0 && <option value="">No batches found (Create one first)</option>}
                            </select>
                        </div>
                    )}
                </div>

                <button className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition">
                    Publish Resource
                </button>
            </form>
        </div>
    );
};

export default UploadResource;
