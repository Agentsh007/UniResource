import { useState, useEffect } from 'react';
import api from '../services/api';
import { FileText, File, Video, Code, Download, ExternalLink, Search } from 'lucide-react';

const ResourceFeed = ({ type, title, subtitle }) => {
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchResources = async () => {
            try {
                // Determine endpoint based on type or use the generic feed query
                const endpoint = type ? `/resources/feed?type=${type}` : '/resources/feed';
                const res = await api.get(endpoint);
                setResources(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchResources();
    }, [type]);

    const getIcon = (itemType) => {
        switch (itemType) {
            case 'PDF': return <FileText className="text-red-500" size={24} />;
            case 'PPT': return <File className="text-orange-500" size={24} />;
            case 'VIDEO': return <Video className="text-blue-500" size={24} />;
            case 'CODE': return <Code className="text-green-500" size={24} />;
            default: return <File className="text-gray-500" size={24} />;
        }
    };

    const filteredResources = resources.filter(r =>
        r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="text-center py-10 text-gray-500">Loading resources...</div>;

    return (
        <div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    {title && <h2 className="text-2xl font-bold text-gray-800">{title}</h2>}
                    {subtitle && <p className="text-gray-600">{subtitle}</p>}
                </div>

                {/* Search Bar */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search resources..."
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none w-full md:w-64 transition"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredResources.map(resource => (
                    <div key={resource._id} className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition group">
                        <div className="p-5">
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 bg-gray-50 rounded-lg group-hover:bg-indigo-50 transition">
                                    {getIcon(resource.type)}
                                </div>
                                <span className="text-xs font-bold px-2 py-1 bg-gray-100 text-gray-600 rounded-full">{resource.type}</span>
                            </div>

                            <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-1">{resource.title}</h3>
                            <p className="text-sm text-gray-500 mb-4 line-clamp-2">{resource.description}</p>

                            <div className="flex items-center justify-between pt-4 border-t border-gray-50 text-xs text-gray-400">
                                <span>{new Date(resource.createdAt).toLocaleDateString()}</span>
                                {resource.fileUrl && (
                                    <a
                                        href={`http://localhost:5000/${resource.fileUrl}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-semibold"
                                    >
                                        Download <Download size={14} />
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
                {filteredResources.length === 0 && (
                    <div className="col-span-full text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                        <p className="text-gray-500">No resources found matching "{searchTerm}".</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ResourceFeed;
