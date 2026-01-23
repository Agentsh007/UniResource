import { useState, useEffect, useRef, useContext } from 'react';
import api from '../../services/api';
import AuthContext from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { Search, Send, MessageCircle } from 'lucide-react';

const Networking = () => {
    const { user } = useContext(AuthContext);
    const [directory, setDirectory] = useState([]);
    const [selectedTeacher, setSelectedTeacher] = useState(null);
    const [message, setMessage] = useState('');
    const [conversation, setConversation] = useState([]);
    const messagesEndRef = useRef(null);

    // Fetch Directory
    useEffect(() => {
        const fetchDirectory = async () => {
            try {
                const res = await api.get('/networking/teachers');
                setDirectory(res.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchDirectory();
    }, []);

    // Fetch Conversation & Poll
    useEffect(() => {
        let interval;
        if (selectedTeacher) {
            const fetchConversation = async () => {
                try {
                    const res = await api.get(`/networking/${selectedTeacher._id}`);
                    setConversation(res.data);
                } catch (err) {
                    console.error(err);
                }
            };
            fetchConversation();
            interval = setInterval(fetchConversation, 3000); // Poll every 3 seconds
        }
        return () => clearInterval(interval);
    }, [selectedTeacher]);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [conversation]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!message.trim() || !selectedTeacher) return;

        try {
            await api.post('/networking', {
                recipientId: selectedTeacher._id,
                content: message
            });
            setMessage('');
            // Immediate fetch to show message
            const res = await api.get(`/networking/${selectedTeacher._id}`);
            setConversation(res.data);
        } catch (err) {
            console.error(err);
            alert('Failed to send message'); // Will upgrade this later
        }
    };

    return (
        <div className="flex h-[calc(100vh-140px)] bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
            {/* Sidebar List */}
            <div className="w-1/3 border-r border-gray-200 bg-gray-50 flex flex-col">
                <div className="p-4 border-b border-gray-200 bg-white">
                    <h2 className="text-lg font-bold text-gray-800 mb-2">Faculty Directory</h2>
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search professors..."
                            className="w-full pl-10 pr-4 py-2 bg-gray-100 border-none rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm transition"
                        />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {directory.map(teacher => (
                        <div
                            key={teacher._id}
                            onClick={() => setSelectedTeacher(teacher)}
                            className={`p-4 flex items-center cursor-pointer hover:bg-indigo-50 transition border-b border-gray-100 ${selectedTeacher?._id === teacher._id ? 'bg-indigo-100 border-indigo-200' : ''}`}
                        >
                            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold shadow-sm">
                                {teacher.name.charAt(0)}
                            </div>
                            <div className="ml-3">
                                <h3 className="font-semibold text-gray-800 text-sm">{teacher.name}</h3>
                                <p className="text-xs text-gray-500 truncate">{teacher.department || 'Academic Staff'}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Chat Area */}
            <div className="w-2/3 flex flex-col bg-[#efeae2] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
                {selectedTeacher ? (
                    <>
                        <div className="p-4 bg-white border-b border-gray-200 flex items-center shadow-sm z-10">
                            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-bold mr-3">
                                {selectedTeacher.name.charAt(0)}
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-800">{selectedTeacher.name}</h3>
                                <p className="text-xs text-indigo-500 font-medium">Online</p>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            {conversation.length === 0 && (
                                <div className="text-center mt-20 opacity-50">
                                    <MessageCircle size={48} className="mx-auto mb-2 text-gray-400" />
                                    <p>Start a conversation with {selectedTeacher.name}</p>
                                </div>
                            )}
                            {conversation.map((msg, index) => {
                                // Logic update: msg.recipient === selectedTeacher._id means *I* sent it.
                                const isMe = msg.recipient === selectedTeacher._id;
                                return (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        key={index}
                                        className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div className={`max-w-[70%] px-4 py-2 rounded-2xl text-sm shadow-sm ${isMe
                                                ? 'bg-indigo-600 text-white rounded-br-none'
                                                : 'bg-white text-gray-800 rounded-bl-none border border-gray-100'
                                            }`}>
                                            <p>{msg.content}</p>
                                            <span className={`text-[10px] block text-right mt-1 ${isMe ? 'text-indigo-200' : 'text-gray-400'}`}>
                                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </motion.div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        <div className="p-4 bg-white border-t border-gray-200">
                            <form onSubmit={handleSendMessage} className="flex gap-2">
                                <input
                                    type="text"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Type a message..."
                                    className="flex-1 px-4 py-3 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                                />
                                <button
                                    type="submit"
                                    className="p-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition shadow-md flex items-center justify-center"
                                >
                                    <Send size={20} />
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                        <MessageCircle size={64} className="mb-4 opacity-20" />
                        <h3 className="text-xl font-medium">Select a colleague to chat</h3>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Networking;
