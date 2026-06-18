import React, { useState, useEffect } from 'react';
import NavBar from "../components/NavBar.jsx";
import API from "../services/api.js";

const TrainNews = () => {
    const [newsList, setNewsList] = useState([]);
    const [trainList, setTrainList] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Modal & Form State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModal, setIsDeleteModal] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const [currentId, setCurrentId] = useState(null);
    const [formData, setFormData] = useState({
        trainNumber: '',
        departure: '',
        destination: '',
        time: '',
        news: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Notification State
    const [notification, setNotification] = useState({ show: false, type: '', message: '' });

    // --- API Interactions ---

    const fetchNews = async () => {
        try {
            const res = await API.get('/news');
            if (res.data.success) {
                setNewsList(res.data.data);
            }
        } catch (error) {
            console.error("Error fetching news:", error);
            showNotification('error', 'Failed to load news.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchNews();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Basic validation
        if (!formData.trainNumber.trim() || !formData.departure.trim() || !formData.destination.trim() || !formData.time.trim() || !formData.news.trim()) {
            showNotification('error', 'All fields are required.');
            return;
        }

        setIsSubmitting(true);
        try {
            const res = currentId
                ? await API.put(`/news/${currentId}`, formData)
                : await API.post('/news', formData);

            const data = res.data;

            if (data.success) {
                const message = currentId ? '✓ News updated successfully!' : '✓ News added successfully!';
                showNotification('success', message);
                closeModal();
                fetchNews();
            } else {
                showNotification('error', data.message || 'Something went wrong.');
            }
        } catch (error) {
            showNotification('error', error.response?.data?.message || 'Server error. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const openDeleteConfirmation = (id) => {
        setDeleteId(id);
        setIsDeleteModal(true);
    };

    const handleConfirmDelete = async () => {
        setIsDeleting(true);
        try {
            const res = await API.delete(`/news/${deleteId}`);
            const data = res.data;

            if (data.success) {
                showNotification('success', '✓ News deleted successfully!');
                setIsDeleteModal(false);
                setDeleteId(null);
                fetchNews();
            } else {
                showNotification('error', 'Failed to delete news.');
            }
        } catch (error) {
            showNotification('error', 'Server error during deletion.');
        } finally {
            setIsDeleting(false);
        }
    };

    // --- UI Helpers ---

    const openAddModal = () => {
        setFormData({
            trainNumber: '',
            departure: '',
            destination: '',
            time: '',
            news: ''
        });
        setCurrentId(null);
        setIsModalOpen(true);
    };

    const openEditModal = (newsItem) => {
        setFormData({
            trainNumber: newsItem.trainNumber,
            departure: newsItem.departure,
            destination: newsItem.destination,
            time: newsItem.time,
            news: newsItem.news
        });
        setCurrentId(newsItem._id);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setFormData({
            trainNumber: '',
            departure: '',
            destination: '',
            time: '',
            news: ''
        });
        setCurrentId(null);
    };

    const showNotification = (type, message) => {
        setNotification({ show: true, type, message });
        setTimeout(() => setNotification({ show: false, type: '', message: '' }), 3000);
    };

    // --- Icons (SVG) ---
    const EditIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
    );

    const DeleteIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
    );

    const PlusIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
    );

    const TrainIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"></rect><path d="M6 18h12"></path><path d="M6 6h12"></path><circle cx="6" cy="18" r="1.5"></circle><circle cx="18" cy="18" r="1.5"></circle></svg>
    );

    return (
        <div className="flex h-screen bg-gradient-to-br from-[#0f172a] via-[#1a1f3a] to-[#0f172a] text-slate-200 font-sans overflow-hidden selection:bg-indigo-500/30">
            {/* Sidebar */}
            <div className="w-64 h-full shrink-0 border-r border-slate-700/50 bg-gradient-to-b from-slate-900 to-slate-950 overflow-y-auto">
                <NavBar />
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-auto">
                <div className="p-8">
                    {/* Header Section */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-12">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-gradient-to-br from-amber-600/20 to-orange-600/20 rounded-lg border border-amber-500/30">
                                    <TrainIcon />
                                </div>
                                <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                                    Train News
                                </h1>
                            </div>
                            <p className="text-slate-400 text-lg">Manage train updates and announcements</p>
                        </div>
                        <button
                            onClick={openAddModal}
                            className="flex items-center gap-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white px-6 py-3 rounded-lg shadow-lg shadow-amber-500/20 transition-all duration-300 hover:shadow-amber-500/40 font-semibold whitespace-nowrap"
                        >
                            <PlusIcon />
                            <span>Add News</span>
                        </button>
                    </div>

                    {/* Notification Toast */}
                    {notification.show && (
                        <div className={`fixed top-6 right-6 z-50 px-6 py-4 rounded-lg shadow-2xl text-white transform transition-all duration-300 flex items-center gap-3 ${notification.type === 'success' ? 'bg-gradient-to-r from-green-600 to-emerald-600 shadow-green-500/20' : 'bg-gradient-to-r from-red-600 to-rose-600 shadow-red-500/20'}`}>
                            {notification.type === 'success' ? (
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
                            )}
                            {notification.message}
                        </div>
                    )}

                    {/* Content Grid */}
                    {isLoading ? (
                        <div className="flex justify-center items-center py-32">
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-amber-600 to-orange-600 rounded-full blur-xl opacity-30 animate-pulse"></div>
                                <div className="relative animate-spin rounded-full h-16 w-16 border-2 border-slate-700 border-t-amber-500"></div>
                            </div>
                        </div>
                    ) : newsList.length === 0 ? (
                        <div className="text-center py-24 bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl border border-slate-700/50 backdrop-blur-sm">
                            <div className="mb-6">
                                <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mx-auto text-slate-600 opacity-50">
                                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                                </svg>
                            </div>
                            <p className="text-slate-400 text-xl font-medium">No train news available yet</p>
                            <p className="text-slate-500 text-sm mt-2">Create your first train news update to get started</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {newsList.map((news) => (
                                <div key={news._id} className="group relative bg-gradient-to-br from-slate-800/60 to-slate-900/60 rounded-xl border border-slate-700/50 hover:border-amber-500/50 backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/10 overflow-hidden flex flex-col">
                                    {/* Animated background on hover */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-amber-600/0 to-orange-600/0 group-hover:from-amber-600/5 group-hover:to-orange-600/5 transition-all duration-300 pointer-events-none"></div>

                                    <div className="relative p-6 flex-grow">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-2">
                                                <span className="text-lg font-bold text-amber-400">
                                                    #{news.trainNumber}
                                                </span>
                                                <span className="text-xs font-semibold uppercase tracking-widest text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                                                    Update
                                                </span>
                                            </div>
                                            <span className="text-xs text-slate-500">
                                                {new Date(news.createdAt).toLocaleDateString('en-US', {
                                                    weekday: 'short',
                                                    month: 'short',
                                                    day: 'numeric'
                                                })}
                                            </span>
                                        </div>

                                        <div className="space-y-3 mb-4">
                                            <div className="flex gap-4">
                                                <div className="flex-1">
                                                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">From</p>
                                                    <p className="text-sm font-semibold text-slate-300">{news.departure}</p>
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">To</p>
                                                    <p className="text-sm font-semibold text-slate-300">{news.destination}</p>
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Time</p>
                                                    <p className="text-sm font-semibold text-amber-400">{news.time}</p>
                                                </div>
                                            </div>

                                            <div className="pt-3 border-t border-slate-700/30">
                                                <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">News</p>
                                                <p className="text-slate-300 leading-relaxed whitespace-pre-wrap text-sm line-clamp-4">
                                                    {news.news}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="relative bg-gradient-to-r from-slate-800/30 to-slate-900/30 px-6 py-4 flex justify-end gap-2 border-t border-slate-700/30 backdrop-blur-sm">
                                        <button
                                            onClick={() => openEditModal(news)}
                                            className="p-2.5 text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-all duration-200"
                                            title="Edit"
                                        >
                                            <EditIcon />
                                        </button>
                                        <button
                                            onClick={() => openDeleteConfirmation(news._id)}
                                            className="p-2.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200"
                                            title="Delete"
                                        >
                                            <DeleteIcon />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Modal */}
                    {isModalOpen && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
                            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden transform transition-all scale-100 border border-slate-700/50">
                                <div className="px-8 py-6 border-b border-slate-700/50 flex justify-between items-center bg-gradient-to-r from-slate-800/80 to-slate-900/80 backdrop-blur-sm">
                                    <h3 className="text-2xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                                        {currentId ? '✎ Edit Train News' : '+ Add New Train News'}
                                    </h3>
                                    <button onClick={closeModal} disabled={isSubmitting} className="text-slate-400 hover:text-slate-200 text-3xl leading-none transition-colors disabled:opacity-50">&times;</button>
                                </div>

                                <form onSubmit={handleSubmit} className="p-8">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                        <div>
                                            <label className="block text-slate-300 text-sm font-semibold mb-2">
                                                Train Number *
                                            </label>
                                            <input
                                                type="text"
                                                className="w-full px-4 py-2.5 rounded-lg bg-slate-900/50 border border-slate-700 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all disabled:bg-slate-900/20 disabled:opacity-50 text-slate-200 placeholder-slate-500"
                                                placeholder="e.g., 12345"
                                                value={formData.trainNumber}
                                                onChange={(e) => setFormData({ ...formData, trainNumber: e.target.value })}
                                                disabled={isSubmitting}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-slate-300 text-sm font-semibold mb-2">
                                                Departure *
                                            </label>
                                            <input
                                                type="text"
                                                className="w-full px-4 py-2.5 rounded-lg bg-slate-900/50 border border-slate-700 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all disabled:bg-slate-900/20 disabled:opacity-50 text-slate-200 placeholder-slate-500"
                                                placeholder="e.g., New York"
                                                value={formData.departure}
                                                onChange={(e) => setFormData({ ...formData, departure: e.target.value })}
                                                disabled={isSubmitting}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-slate-300 text-sm font-semibold mb-2">
                                                Destination *
                                            </label>
                                            <input
                                                type="text"
                                                className="w-full px-4 py-2.5 rounded-lg bg-slate-900/50 border border-slate-700 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all disabled:bg-slate-900/20 disabled:opacity-50 text-slate-200 placeholder-slate-500"
                                                placeholder="e.g., Boston"
                                                value={formData.destination}
                                                onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                                                disabled={isSubmitting}
                                            />
                                        </div>
                                    </div>

                                    <div className="mb-6">
                                        <label className="block text-slate-300 text-sm font-semibold mb-2">
                                            Time *
                                        </label>
                                        <input
                                            type="time"
                                            className="w-full px-4 py-2.5 rounded-lg bg-slate-900/50 border border-slate-700 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all disabled:bg-slate-900/20 disabled:opacity-50 text-slate-200"
                                            value={formData.time}
                                            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                            disabled={isSubmitting}
                                        />
                                    </div>

                                    <div className="mb-6">
                                        <label className="block text-slate-300 text-sm font-semibold mb-3">
                                            News Description *
                                        </label>
                                        <textarea
                                            rows="6"
                                            className="w-full px-4 py-3 rounded-lg bg-slate-900/50 border border-slate-700 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all resize-none disabled:bg-slate-900/20 disabled:opacity-50 text-slate-200 placeholder-slate-500"
                                            placeholder="Enter train news or updates..."
                                            value={formData.news}
                                            onChange={(e) => setFormData({ ...formData, news: e.target.value })}
                                            disabled={isSubmitting}
                                        ></textarea>
                                    </div>

                                    <div className="flex justify-end gap-4">
                                        <button
                                            type="button"
                                            onClick={closeModal}
                                            disabled={isSubmitting}
                                            className="px-6 py-2.5 rounded-lg text-slate-300 hover:text-slate-200 hover:bg-slate-700/50 font-medium transition-all duration-200 disabled:opacity-50"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-semibold shadow-lg shadow-amber-500/20 transition-all duration-200 disabled:opacity-70 flex items-center gap-2"
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                    Processing...
                                                </>
                                            ) : (
                                                <>
                                                    {currentId ? '✓ Update' : '✓ Publish'}
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* Delete Confirmation Modal */}
                    {isDeleteModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
                            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100 border border-slate-700/50">
                                <div className="px-8 py-8 text-center">
                                    <div className="mx-auto w-16 h-16 bg-gradient-to-br from-red-600/20 to-rose-600/20 rounded-full flex items-center justify-center mb-6 border border-red-500/30">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="3 6 5 6 21 6"></polyline>
                                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                            <line x1="10" y1="11" x2="10" y2="17"></line>
                                            <line x1="14" y1="11" x2="14" y2="17"></line>
                                        </svg>
                                    </div>
                                    <h3 className="text-2xl font-bold text-slate-200 mb-2">Delete News</h3>
                                    <p className="text-slate-400 mb-8">Are you sure you want to delete this train news? This action cannot be undone.</p>

                                    <div className="flex justify-center gap-4">
                                        <button
                                            onClick={() => setIsDeleteModal(false)}
                                            disabled={isDeleting}
                                            className="px-6 py-2.5 rounded-lg text-slate-300 hover:text-slate-200 hover:bg-slate-700/50 font-medium transition-all duration-200 disabled:opacity-50"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleConfirmDelete}
                                            disabled={isDeleting}
                                            className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-semibold shadow-lg shadow-red-500/20 transition-all duration-200 disabled:opacity-70 flex items-center gap-2"
                                        >
                                            {isDeleting ? (
                                                <>
                                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                    Deleting...
                                                </>
                                            ) : (
                                                <>
                                                    ✓ Delete
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TrainNews;
