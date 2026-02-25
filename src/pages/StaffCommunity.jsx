import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { io } from 'socket.io-client';
import { Send, Image, FileText, Video, MoreHorizontal, Heart, MessageSquare, Paperclip, X } from 'lucide-react';
import toast from 'react-hot-toast';
import TeacherLayout from '../components/TeacherLayout';
import AdminLayout from '../components/AdminLayout'; // Will determine layout dynamically

const StaffCommunity = () => {
    const { token, user } = useSelector((state) => state.auth);
    const [posts, setPosts] = useState([]);
    const [content, setContent] = useState('');
    const [attachments, setAttachments] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [socket, setSocket] = useState(null);
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);

    const isTeacher = user.role === 'teacher';
    const Layout = isTeacher ? TeacherLayout : AdminLayout;

    useEffect(() => {
        // Connect Socket
        const newSocket = io('https://educbt-pro-backend.onrender.com');
        setSocket(newSocket);

        // Join School Room
        if (user.schoolId) {
            newSocket.emit('join_school_community', user.schoolId);
        }

        // Listen for new posts
        newSocket.on('new_post', (post) => {
            setPosts((prev) => [post, ...prev]);
        });

        // Fetch initial feed
        fetchFeed();

        return () => newSocket.close();
    }, [user.schoolId]);

    const fetchFeed = async () => {
        try {
            const res = await axios.get('https://educbt-pro-backend.onrender.com/community/feed', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPosts(res.data);
        } catch (error) {
            console.error('Error fetching feed:', error);
            toast.error('Failed to load community feed');
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        setUploading(true);
        const loadingToast = toast.loading('Uploading attachment...');

        try {
            const res = await axios.post('https://educbt-pro-backend.onrender.com/community/upload', formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            setAttachments(prev => [...prev, res.data]);
            toast.success('Attached!', { id: loadingToast });
        } catch (error) {
            console.error('Upload Error:', error);
            toast.error('Upload failed', { id: loadingToast });
        } finally {
            setUploading(false);
            e.target.value = null; // Reset input
        }
    };

    const removeAttachment = (index) => {
        setAttachments(prev => prev.filter((_, i) => i !== index));
    };

    const handlePost = async (e) => {
        e.preventDefault();
        if (!content.trim() && attachments.length === 0) return;

        try {
            await axios.post('https://educbt-pro-backend.onrender.com/community/create', {
                content,
                attachments
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Post is added via socket event to avoid duplication if we added it manually too
            // But for immediate UX we might want to, but socket is fast enough locally.
            setContent('');
            setAttachments([]);
        } catch (error) {
            toast.error('Failed to post');
        }
    };

    const handleLike = async (postId) => {
        try {
            // Optimistic update
            setPosts(prev => prev.map(p => {
                if (p._id === postId) {
                    const isLiked = p.likes.includes(user._id);
                    return {
                        ...p,
                        likes: isLiked ? p.likes.filter(id => id !== user._id) : [...p.likes, user._id]
                    };
                }
                return p;
            }));

            await axios.post('https://educbt-pro-backend.onrender.com/community/like', { postId }, {
                headers: { Authorization: `Bearer ${token}` }
            });
        } catch (error) {
            console.error('Like error', error);
        }
    };

    return (
        <Layout>
            <div className="max-w-3xl mx-auto pb-20">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Staff Community</h1>
                    <p className="text-gray-500">Share updates, resources, and connect with your colleagues.</p>
                </div>

                {/* Create Post Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mb-8">
                    <div className="flex gap-4">
                        <img
                            src={user.profilePicture || `https://ui-avatars.com/api/?name=${user.fullName}&background=random`}
                            alt="User"
                            className="w-10 h-10 rounded-full object-cover"
                        />
                        <div className="flex-1">
                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder={`What's on your mind, ${user.fullName.split(' ')[0]}?`}
                                className="w-full border-none focus:ring-0 resize-none text-gray-700 placeholder-gray-400 text-lg min-h-[100px]"
                            />

                            {/* Attachments Preview */}
                            {attachments.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {attachments.map((file, idx) => (
                                        <div key={idx} className="relative group bg-gray-50 border border-gray-200 rounded-lg p-2 pr-8 flex items-center gap-2">
                                            {file.type === 'image' ? <Image size={16} className="text-blue-500" /> :
                                                file.type === 'video' ? <Video size={16} className="text-purple-500" /> :
                                                    <FileText size={16} className="text-orange-500" />}
                                            <span className="text-xs font-medium truncate max-w-[150px]">{file.name || 'Attachment'}</span>
                                            <button
                                                onClick={() => removeAttachment(idx)}
                                                className="absolute right-1 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 p-1"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                <div className="flex items-center gap-2">
                                    <button onClick={() => fileInputRef.current?.click()} className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors flex items-center gap-2" title="Attach File">
                                        <Paperclip size={20} />
                                        <span className="text-sm font-medium hidden md:inline">Attach</span>
                                    </button>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileUpload}
                                        className="hidden"
                                    />
                                </div>
                                <button
                                    onClick={handlePost}
                                    disabled={(!content.trim() && attachments.length === 0) || uploading}
                                    className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    <Send size={18} /> Post
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Feed */}
                <div className="space-y-6">
                    {posts.map((post) => (
                        <div key={post._id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4">
                            <div className="p-4 flex gap-3">
                                <img
                                    src={post.senderAvatar || `https://ui-avatars.com/api/?name=${post.senderName}&background=random`}
                                    alt={post.senderName}
                                    className="w-10 h-10 rounded-full object-cover"
                                />
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-1">
                                        <div>
                                            <h3 className="font-bold text-gray-900">{post.senderName}</h3>
                                            <p className="text-xs text-indigo-600 font-medium uppercase tracking-wide">{post.senderRole === 'school_admin' ? 'Admin' : 'Teacher'}</p>
                                        </div>
                                        <span className="text-xs text-gray-400">{new Date(post.createdAt).toLocaleDateString()}</span>
                                    </div>

                                    <p className="text-gray-800 whitespace-pre-wrap mb-4">{post.content}</p>

                                    {/* Attachments Display */}
                                    {post.attachments && post.attachments.length > 0 && (
                                        <div className="grid grid-cols-2 gap-2 mb-4">
                                            {post.attachments.map((att, i) => (
                                                <div key={i} className="rounded-xl overflow-hidden border border-gray-200">
                                                    {att.type === 'image' ? (
                                                        <img src={att.url} alt="Attachment" className="w-full h-48 object-cover hover:scale-105 transition-transform cursor-pointer" onClick={() => window.open(att.url)} />
                                                    ) : att.type === 'video' ? (
                                                        <video src={att.url} controls className="w-full h-48 object-cover bg-black" />
                                                    ) : (
                                                        <div className="p-4 flex items-center gap-3 bg-gray-50 h-full cursor-pointer hover:bg-gray-100" onClick={() => window.open(att.url)}>
                                                            <div className="p-3 bg-indigo-100 text-indigo-600 rounded-lg">
                                                                <FileText size={24} />
                                                            </div>
                                                            <div className="overflow-hidden">
                                                                <p className="font-medium text-sm truncate">{att.name || 'Document'}</p>
                                                                <p className="text-xs text-gray-500">Click to view</p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <div className="flex items-center gap-6 pt-3 border-t border-gray-50">
                                        <button
                                            onClick={() => handleLike(post._id)}
                                            className={`flex items-center gap-2 text-sm font-medium transition-colors ${post.likes.includes(user._id) ? 'text-red-500' : 'text-gray-500 hover:text-red-500'}`}
                                        >
                                            <Heart size={18} fill={post.likes.includes(user._id) ? "currentColor" : "none"} />
                                            {post.likes.length || 0}
                                        </button>
                                        <button className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-indigo-600 transition-colors">
                                            <MessageSquare size={18} /> Comment
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {posts.length === 0 && (
                        <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-3xl border border-dashed border-gray-300">
                            <MessageSquare className="mx-auto text-gray-300 mb-3" size={48} />
                            <p>No posts yet. Be the first to say hello!</p>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default StaffCommunity;

