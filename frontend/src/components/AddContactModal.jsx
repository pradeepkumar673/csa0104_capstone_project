import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { serverurl } from '../main.jsx';
import { X, Search, UserPlus, Check } from 'lucide-react';

const AddContactModal = ({ isOpen, onClose, onContactAdded }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [adding, setAdding] = useState({});

    useEffect(() => {
        if (searchQuery.trim()) {
            const delayDebounceFn = setTimeout(() => {
                searchUsers();
            }, 500);

            return () => clearTimeout(delayDebounceFn);
        } else {
            setSearchResults([]);
        }
    }, [searchQuery]);

    const searchUsers = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${serverurl}/api/users/search?query=${searchQuery}`, {
                withCredentials: true
            });
            setSearchResults(response.data);
        } catch (error) {
            console.error('Search failed:', error);
        } finally {
            setLoading(false);
        }
    };

    const addContact = async (userId) => {
        try {
            setAdding({ ...adding, [userId]: true });
            await axios.post(`${serverurl}/api/users/contacts`, 
                { contactId: userId },
                { withCredentials: true }
            );
            
            if (onContactAdded) {
                onContactAdded();
            }
            
            // Update the result to show added
            setSearchResults(prev => prev.map(user => 
                user._id === userId ? { ...user, added: true } : user
            ));
        } catch (error) {
            console.error('Add contact failed:', error);
        } finally {
            setAdding({ ...adding, [userId]: false });
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 rounded-2xl w-full max-w-md">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-white">Add New Contact</h2>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-full hover:bg-gray-800 transition-colors"
                        >
                            <X className="w-6 h-6 text-white" />
                        </button>
                    </div>

                    <div className="relative mb-6">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search by username, name, or email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-gray-800 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-lime-500"
                        />
                    </div>

                    <div className="space-y-3 max-h-96 overflow-y-auto">
                        {loading ? (
                            <div className="text-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-lime-500 mx-auto"></div>
                                <p className="text-gray-400 mt-2">Searching...</p>
                            </div>
                        ) : searchResults.length > 0 ? (
                            searchResults.map((user) => (
                                <div
                                    key={user._id}
                                    className="flex items-center justify-between p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
                                >
                                    <div className="flex items-center space-x-3">
                                        <div className="relative">
                                            <img
                                                src={user.image || '/default-avatar.png'}
                                                alt={user.name}
                                                className="w-10 h-10 rounded-full object-cover"
                                            />
                                            <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-gray-900 ${user.online ? 'bg-green-500' : 'bg-gray-400'}`} />
                                        </div>
                                        <div>
                                            <h3 className="text-white font-medium">{user.name}</h3>
                                            <p className="text-gray-400 text-sm">@{user.Username}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => addContact(user._id)}
                                        disabled={user.added || adding[user._id]}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                            user.added
                                                ? 'bg-green-600 text-white'
                                                : 'bg-lime-600 text-white hover:bg-lime-700'
                                        }`}
                                    >
                                        {user.added ? (
                                            <Check className="w-5 h-5" />
                                        ) : adding[user._id] ? (
                                            'Adding...'
                                        ) : (
                                            <UserPlus className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>
                            ))
                        ) : searchQuery ? (
                            <div className="text-center py-8">
                                <p className="text-gray-400">No users found</p>
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <Search className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                                <p className="text-gray-400">Search for users to add as contacts</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddContactModal;