import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { serverurl } from '../main.jsx';
import OnlineIndicator from './OnlineIndicator';
import { MessageSquare, MoreVertical } from 'lucide-react';

const ContactList = ({ onSelectContact, selectedContact, onlineUsers = [] }) => {
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchContacts();
    }, []);

    const fetchContacts = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${serverurl}/api/users/contacts`, {
                withCredentials: true
            });
            setContacts(response.data);
        } catch (error) {
            console.error('Failed to fetch contacts:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredContacts = contacts.filter(contact =>
        contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.Username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="h-full bg-gray-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-lime-500"></div>
            </div>
        );
    }

    return (
        <div className="h-full bg-gray-900 flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-800">
                <h2 className="text-xl font-bold text-white mb-4">Contacts</h2>
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search contacts..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-4 py-2 pl-10 bg-gray-800 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-lime-500"
                    />
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* Contacts List */}
            <div className="flex-1 overflow-y-auto">
                {filteredContacts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                        <MessageSquare className="w-16 h-16 text-gray-600 mb-4" />
                        <h3 className="text-white font-medium mb-2">No contacts yet</h3>
                        <p className="text-gray-400">Add some friends to start chatting!</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-800">
                        {filteredContacts.map((contact) => {
                            const isOnline = onlineUsers.includes(contact._id);
                            const isSelected = selectedContact?._id === contact._id;

                            return (
                                <div
                                    key={contact._id}
                                    onClick={() => onSelectContact(contact)}
                                    className={`p-4 flex items-center space-x-3 cursor-pointer transition-colors ${
                                        isSelected ? 'bg-gray-800' : 'hover:bg-gray-800'
                                    }`}
                                >
                                    <div className="relative">
                                        <img
                                            src={contact.image || '/default-avatar.png'}
                                            alt={contact.name}
                                            className="w-12 h-12 rounded-full object-cover"
                                        />
                                        <div className="absolute bottom-0 right-0">
                                            <OnlineIndicator online={isOnline} />
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start">
                                            <h3 className="text-white font-medium truncate">{contact.name}</h3>
                                            <span className="text-xs text-gray-400">
                                                {contact.lastSeen ? 
                                                    new Date(contact.lastSeen).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
                                                    : 'Recently'
                                                }
                                            </span>
                                        </div>
                                        <p className="text-gray-400 text-sm truncate">@{contact.Username}</p>
                                        {contact.status && (
                                            <p className="text-gray-500 text-sm truncate mt-1">{contact.status}</p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ContactList;