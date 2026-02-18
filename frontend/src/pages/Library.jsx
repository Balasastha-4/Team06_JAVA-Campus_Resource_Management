import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/useAuth';
import { toast } from 'react-toastify';
import { Plus, Search, BookOpen, AlertCircle, CheckCircle, XCircle, Clock, RotateCcw, Building2 } from 'lucide-react';

const Library = () => {
    const { user } = useAuth();
    const role = user?.roles?.[0] || 'STUDENT';
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [keyword, setKeyword] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showDemandModal, setShowDemandModal] = useState(false);
    const [activeTab, setActiveTab] = useState('catalog');

    // Admin Data
    const [pendingRequests, setPendingRequests] = useState([]);
    const [issuedBooks, setIssuedBooks] = useState([]);
    const [demands, setDemands] = useState([]);

    // User Data
    const [myHistory, setMyHistory] = useState([]);

    // Edit State
    const [isEditing, setIsEditing] = useState(false);
    const [currentBookId, setCurrentBookId] = useState(null);

    // Form states
    const [newBook, setNewBook] = useState({ title: '', author: '', category: '', isbn: '', totalCopies: 1, section: '' });
    const [demandData, setDemandData] = useState({ bookTitle: '' });

    const fetchBooks = async (search = '') => {
        try {
            console.log(`Library: Fetching books with keyword: "${search}"`);
            const res = await api.get(`/books?keyword=${search}`);
            console.log("Library: Books received:", res.data);
            setBooks(Array.isArray(res.data) ? res.data : []);
        } catch (error) {
            console.error("Library: Failed to fetch books", error);
            setBooks([]);
        }
    };

    const fetchAdminData = async () => {
        try {
            console.log("Library: Fetching admin data...");
            const [requestsRes, issuedRes, demandsRes] = await Promise.all([
                api.get('/borrow-request/pending'),
                api.get('/borrow-request/issued'),
                api.get('/book-demand/all')
            ]);
            setPendingRequests(requestsRes.data || []);
            setIssuedBooks(issuedRes.data || []);
            setDemands(demandsRes.data || []);
        } catch (error) {
            console.error("Library: Failed to fetch admin data", error);
        }
    };


    const fetchMyHistory = async () => {
        try {
            console.log("Library: Fetching my borrow history...");
            const res = await api.get('/borrow-request/my');
            setMyHistory(res.data || []);
        } catch (error) {
            console.error("Library: Failed to fetch history", error);
        }
    };

    useEffect(() => {
        const loadInitialData = async () => {
            console.log("Library: loadInitialData started for role:", role);
            setLoading(true);
            try {
                await fetchBooks();
                if (role === 'ADMIN') {
                    await fetchAdminData();
                } else {
                    await fetchMyHistory();
                }
            } catch (err) {
                console.error("Library: Error in loadInitialData", err);
            } finally {
                setLoading(false);
                console.log("Library: loadInitialData finished");
            }
        };
        loadInitialData();
    }, [role]);

    const handleSearch = (e) => {
        e.preventDefault();
        fetchBooks(keyword);
    };

    const openAddModal = () => {
        setIsEditing(false);
        setNewBook({ title: '', author: '', category: '', isbn: '', totalCopies: 1, section: '' });
        setShowAddModal(true);
    };

    const openEditModal = (book) => {
        setIsEditing(true);
        setCurrentBookId(book.id);
        setNewBook({
            title: book.title,
            author: book.author,
            category: book.category,
            isbn: book.isbn,
            totalCopies: book.totalCopies,
            section: book.section
        });
        setShowAddModal(true);
    };

    const handleSubmitBook = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                await api.put(`/books/${currentBookId}`, newBook);
                toast.success('Book updated successfully');
            } else {
                await api.post('/books', newBook);
                toast.success('Book added successfully');
            }
            setShowAddModal(false);
            fetchBooks();
        } catch (error) {
            toast.error('Failed to save book');
        }
    };

    const handleBorrow = async (bookId) => {
        try {
            await api.post('/borrow-request', { bookId });
            toast.success('Borrow request sent');
            if (role !== 'ADMIN') fetchMyHistory();
        } catch (error) {
            toast.error(error.response?.data || 'Borrow request failed');
        }
    };

    const handleDemand = async (e) => {
        e.preventDefault();
        try {
            await api.post('/book-demand', demandData);
            toast.success('Book added to demand list');
            setShowDemandModal(false);
            setDemandData({ bookTitle: '' });
        } catch (error) {
            toast.error('Failed to submit demand');
        }
    };

    const handleAdminAction = async (id, action) => {
        try {
            await api.patch(`/borrow-request/${id}/${action}`);
            toast.success(`Request ${action}ed`);
            fetchAdminData();
        } catch (error) {
            toast.error('Action failed');
        }
    };

    const handleDemandAction = async (id, action) => {
        try {
            await api.patch(`/book-demand/${id}/${action}`);
            toast.success(`Demand ${action}ed`);
            fetchAdminData();
        } catch (error) {
            toast.error('Action failed');
        }
    };

    if (loading) return <div>Loading Library...</div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <h1 className="text-2xl font-bold text-gray-900">Library & Resources</h1>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                    <button
                        onClick={() => setActiveTab('catalog')}
                        className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'catalog'
                            ? 'border-primary text-primary'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                    >
                        Book Catalog
                    </button>
                    {role !== 'ADMIN' && (
                        <button
                            onClick={() => setActiveTab('history')}
                            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'history'
                                ? 'border-primary text-primary'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            My Borrow History
                        </button>
                    )}
                    {role === 'ADMIN' && (
                        <>
                            <button
                                onClick={() => setActiveTab('requests')}
                                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'requests'
                                    ? 'border-primary text-primary'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                Borrow Requests
                                {pendingRequests.length > 0 && (
                                    <span className="ml-2 bg-red-100 text-red-600 px-2 py-0.5 rounded-full text-xs">
                                        {pendingRequests.length}
                                    </span>
                                )}
                            </button>
                            <button
                                onClick={() => setActiveTab('issued')}
                                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'issued'
                                    ? 'border-primary text-primary'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                Active Loans
                            </button>
                            <button
                                onClick={() => setActiveTab('demands')}
                                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'demands'
                                    ? 'border-primary text-primary'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                Book Demands
                            </button>
                        </>
                    )}
                </nav>
            </div>

            {/* Catalog Tab */}
            {activeTab === 'catalog' && (
                <div className="space-y-6">
                    <div className="flex justify-between">
                        <form onSubmit={handleSearch} className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                className="input-field pl-10 w-full"
                                placeholder="Search books..."
                                value={keyword}
                                onChange={(e) => setKeyword(e.target.value)}
                            />
                        </form>
                        <div className="flex gap-2">
                            {role === 'ADMIN' && (
                                <button onClick={openAddModal} className="btn btn-primary flex items-center gap-2">
                                    <Plus size={18} /> Add Book
                                </button>
                            )}
                            {(role === 'STUDENT' || role === 'STAFF') && (
                                <button onClick={() => setShowDemandModal(true)} className="btn btn-secondary flex items-center gap-2">
                                    <AlertCircle size={18} /> Request New Book
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {books.map(book => (
                            <div key={book.id} className="card flex flex-col justify-between">
                                <div>
                                    <div className="flex justify-between items-start">
                                        <h3 className="text-lg font-bold text-gray-900 line-clamp-1">{book.title}</h3>
                                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-nowrap">{book.section}</span>
                                    </div>
                                    <p className="text-sm text-gray-600">by {book.author}</p>
                                    <p className="text-xs text-gray-400 mt-1 uppercase tracking-wide">{book.category}</p>

                                    <div className="mt-4 flex items-center justify-between text-sm">
                                        <span className="text-gray-500">Available:</span>
                                        <span className={`font-bold ${book.availableCopies > 0 ? 'text-green-600' : 'text-red-500'}`}>
                                            {book.availableCopies} / {book.totalCopies}
                                        </span>
                                    </div>
                                </div>
                                {role === 'ADMIN' && (
                                    <button
                                        onClick={() => openEditModal(book)}
                                        className="mt-4 w-full btn btn-secondary flex items-center justify-center gap-2 text-blue-600"
                                    >
                                        Edit Details
                                    </button>
                                )}
                                {(role === 'STUDENT' || role === 'STAFF') && (
                                    <button
                                        onClick={() => handleBorrow(book.id)}
                                        disabled={book.availableCopies === 0}
                                        className="mt-4 w-full btn btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <BookOpen size={16} /> Borrow
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                    {books.length === 0 && (
                        <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                            <BookOpen size={48} className="mx-auto text-gray-300 mb-4" />
                            <p className="text-gray-500">No books found in the catalog.</p>
                            {role === 'ADMIN' && (
                                <button onClick={openAddModal} className="mt-4 text-primary font-medium hover:underline">
                                    Add your first book
                                </button>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* My History Tab */}
            {activeTab === 'history' && (
                <div className="bg-white rounded-lg shadowoverflow-hidden border border-gray-200">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Book</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {myHistory.map(item => (
                                <tr key={item.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.book?.title}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(item.requestDate).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${item.status === 'APPROVED' || item.status === 'ISSUED' ? 'bg-green-100 text-green-800' :
                                            item.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                                item.status === 'RETURNED' ? 'bg-blue-100 text-blue-800' :
                                                    'bg-red-100 text-red-800'
                                            }`}>
                                            {item.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {item.issueDate ? new Date(new Date(item.issueDate).getTime() + (7 * 24 * 60 * 60 * 1000)).toLocaleDateString() : '-'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {myHistory.length === 0 && <p className="p-4 text-center text-gray-500">No borrowing history found.</p>}
                </div>
            )}

            {/* Admin Requests Tab */}
            {activeTab === 'requests' && (
                <div className="space-y-4">
                    {pendingRequests.length === 0 ? <p className="text-gray-500">No pending borrow requests.</p> : (
                        <div className="grid grid-cols-1 gap-4">
                            {pendingRequests.map(req => (
                                <div key={req.id} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex justify-between items-center">
                                    <div>
                                        <h3 className="font-bold text-gray-900">{req.book?.title}</h3>
                                        <p className="text-sm text-gray-500">Requested by: <span className="font-medium text-gray-900">{req.user?.name}</span> ({req.user?.role} - {req.user?.department})</p>
                                        <p className="text-xs text-gray-400">Date: {new Date(req.requestDate).toLocaleDateString()}</p>
                                        <div className="mt-1">
                                            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">Priority: {req.priority}</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => handleAdminAction(req.id, 'approve')} className="btn bg-green-50 text-green-600 hover:bg-green-100 border-none flex items-center gap-2">
                                            <CheckCircle size={18} /> Approve
                                        </button>
                                        <button onClick={() => handleAdminAction(req.id, 'reject')} className="btn bg-red-50 text-red-600 hover:bg-red-100 border-none flex items-center gap-2">
                                            <XCircle size={18} /> Reject
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Admin Active Loans Tab */}
            {activeTab === 'issued' && (
                <div className="space-y-4">
                    {issuedBooks.length === 0 ? <p className="text-gray-500">No active loans.</p> : (
                        <div className="grid grid-cols-1 gap-4">
                            {issuedBooks.map(req => (
                                <div key={req.id} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex justify-between items-center">
                                    <div>
                                        <h3 className="font-bold text-gray-900">{req.book?.title}</h3>
                                        <p className="text-sm text-gray-500">Issued to: <span className="font-medium text-gray-900">{req.user?.name}</span></p>
                                        <p className="text-xs text-gray-400">Issued Date: {new Date(req.issueDate).toLocaleDateString()}</p>
                                        <p className="text-xs text-red-500">Due Date: {new Date(new Date(req.issueDate).getTime() + (7 * 24 * 60 * 60 * 1000)).toLocaleDateString()}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => handleAdminAction(req.id, 'return')} className="btn bg-blue-50 text-blue-600 hover:bg-blue-100 border-none flex items-center gap-2">
                                            <RotateCcw size={18} /> Mark Returned
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Admin Demands Tab */}
            {activeTab === 'demands' && (
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Book Title</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requested By</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {demands.map(d => (
                                <tr key={d.id}>
                                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{d.bookTitle}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{d.user?.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{d.user?.department}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(d.requestDate).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                        <div className="flex justify-end gap-2">
                                            {d.status === 'PENDING' ? (
                                                <>
                                                    <button onClick={() => handleDemandAction(d.id, 'approve')} className="text-green-600 hover:text-green-800 bg-green-50 px-2 py-1 rounded">Fulfill</button>
                                                    <button onClick={() => handleDemandAction(d.id, 'reject')} className="text-red-600 hover:text-red-800 bg-red-50 px-2 py-1 rounded">Reject</button>
                                                </>
                                            ) : (
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${d.status === 'APPROVED' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                    }`}>
                                                    {d.status}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {demands.length === 0 && <p className="p-4 text-center text-gray-500">No book demands.</p>}
                </div>
            )}

            {/* Modals */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg w-full max-w-md">
                        <h3 className="text-lg font-bold mb-4">{isEditing ? 'Edit Book' : 'Add New Book'}</h3>
                        <form onSubmit={handleSubmitBook} className="space-y-3">
                            <input className="input-field w-full" placeholder="Title" required value={newBook.title} onChange={e => setNewBook({ ...newBook, title: e.target.value })} />
                            <input className="input-field w-full" placeholder="Author" required value={newBook.author} onChange={e => setNewBook({ ...newBook, author: e.target.value })} />
                            <input className="input-field w-full" placeholder="Category" required value={newBook.category} onChange={e => setNewBook({ ...newBook, category: e.target.value })} />
                            <input className="input-field w-full" placeholder="ISBN" required value={newBook.isbn} onChange={e => setNewBook({ ...newBook, isbn: e.target.value })} />
                            <div className="grid grid-cols-2 gap-3">
                                <input type="number" className="input-field w-full" placeholder="Copies" required min="1" value={newBook.totalCopies} onChange={e => setNewBook({ ...newBook, totalCopies: e.target.value })} />
                                <input className="input-field w-full" placeholder="Section" value={newBook.section} onChange={e => setNewBook({ ...newBook, section: e.target.value })} />
                            </div>

                            <div className="flex gap-3 mt-4">
                                <button type="button" onClick={() => setShowAddModal(false)} className="btn btn-secondary flex-1">Cancel</button>
                                <button type="submit" className="btn btn-primary flex-1">{isEditing ? 'Update Book' : 'Add Book'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showDemandModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg w-full max-w-sm">
                        <h3 className="text-lg font-bold mb-4">Request New Book</h3>
                        <form onSubmit={handleDemand} className="space-y-4">
                            <input className="input-field w-full" placeholder="Book Title" required value={demandData.bookTitle} onChange={e => setDemandData({ bookTitle: e.target.value })} />
                            <div className="flex gap-3">
                                <button type="button" onClick={() => setShowDemandModal(false)} className="btn btn-secondary flex-1">Cancel</button>
                                <button type="submit" className="btn btn-primary flex-1">Submit Request</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Library;

