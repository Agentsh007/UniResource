import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Trash2, Edit2, FileText, File, Video, Code, Download, X } from 'lucide-react';

const MyResources = () => {
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingResource, setEditingResource] = useState(null); // Resource being edited
    const [editFormData, setEditFormData] = useState({ title: '', description: '', visibility: 'BATCH' });

    useEffect(() => {
        fetchMyResources();
    }, []);

    const fetchMyResources = async () => {
        try {
            const res = await api.get('/resources/feed');
            setResources(res.data);
        } catch (err) {
            console.error(err);
            toast.error('Failed to load resources');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this resource?')) return;
        try {
            await api.delete(`/resources/${id}`);
            setResources(resources.filter(r => r._id !== id));
            toast.success('Resource deleted');
        } catch (err) {
            console.error(err);
            toast.error('Failed to delete');
        }
    };

    const openEditModal = (resource) => {
        setEditingResource(resource);
        setEditFormData({
            title: resource.title,
            description: resource.description,
            visibility: resource.visibility
        });
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await api.put(`/resources/${editingResource._id}`, editFormData);
            setResources(resources.map(r => r._id === editingResource._id ? res.data : r));
            toast.success('Resource updated successfully');
            setEditingResource(null);
        } catch (err) {
            console.error(err);
            toast.error('Failed to update resource');
        }
    };

    const getIcon = (itemType) => {
        switch (itemType) {
            case 'PDF': return <FileText className="text-red-500" size={24} />;
            case 'PPT': return <File className="text-orange-500" size={24} />;
            case 'VIDEO': return <Video className="text-blue-500" size={24} />;
            case 'CODE': return <Code className="text-green-500" size={24} />;
            default: return <File className="text-gray-500" size={24} />;
        }
    };

    if (loading) return <div className="text-center py-10">Loading...</div>;

    return (
        <div className="bg-white rounded-xl shadow-md p-6 relative">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">My Resources</h2>

            <div className="overflow-x-auto">
                <table className="min-w-full text-left">
                    <thead>
                        <tr className="bg-gray-50 text-gray-600 uppercase text-xs tracking-wider">
                            <th className="px-6 py-3">Type</th>
                            <th className="px-6 py-3">Title</th>
                            <th className="px-6 py-3">Visibility</th>
                            <th className="px-6 py-3">Date</th>
                            <th className="px-6 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {resources.map(resource => (
                            <tr key={resource._id} className="hover:bg-gray-50 transition">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center gap-2">
                                        {getIcon(resource.type)}
                                        <span className="text-sm font-medium text-gray-600">{resource.type}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="font-semibold text-gray-900">{resource.title}</div>
                                    <div className="text-xs text-gray-500 truncate max-w-xs">{resource.description}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 text-xs font-bold rounded-full ${resource.visibility === 'GLOBAL' ? 'bg-green-100 text-green-700' : 'bg-indigo-100 text-indigo-700'}`}>
                                        {resource.visibility}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500">
                                    {new Date(resource.createdAt).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 text-right flex justify-end gap-2">
                                    <button
                                        onClick={() => openEditModal(resource)}
                                        className="text-indigo-500 hover:text-indigo-700 p-2 rounded-full hover:bg-indigo-50 transition"
                                        title="Edit Resource"
                                    >
                                        <Edit2 size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(resource._id)}
                                        className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 transition"
                                        title="Delete Resource"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {resources.length === 0 && <p className="text-center py-8 text-gray-500">You haven't uploaded any resources yet.</p>}
            </div>

            {/* Edit Modal */}
            {editingResource && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg relative animate-in fade-in zoom-in duration-200">
                        <button
                            onClick={() => setEditingResource(null)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
                        >
                            <X size={24} />
                        </button>

                        <h3 className="text-2xl font-bold mb-6 text-gray-800">Edit Resource</h3>

                        <form onSubmit={handleEditSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                <input
                                    type="text"
                                    value={editFormData.title}
                                    onChange={e => setEditFormData({ ...editFormData, title: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none transition"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    rows="3"
                                    value={editFormData.description}
                                    onChange={e => setEditFormData({ ...editFormData, description: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none transition"
                                ></textarea>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Visibility</label>
                                <select
                                    value={editFormData.visibility}
                                    onChange={e => setEditFormData({ ...editFormData, visibility: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none transition"
                                >
                                    <option value="BATCH">Private (Batch Only)</option>
                                    <option value="GLOBAL">Public (University Hub)</option>
                                </select>
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setEditingResource(null)}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 shadow-lg hover:shadow-xl transition transform hover:-translate-y-0.5"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyResources;
