import React, { useState, useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import axios from 'axios';
import { serverurl } from '../main.jsx';
import { ArrowLeft, Phone, Video, MoreVertical, User } from 'lucide-react';

const ChatContainer = ({ contact, socket, onBack }) => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [typing, setTyping] = useState(false);
    const messagesEndRef = useRef(null);
    const chatContainerRef = useRef(null);

    useEffect(() => {
        if (contact) {
            fetchChatHistory();
            
            // Set up socket listeners
            if (socket) {
                socket.on('receive-message', handleNewMessage);
                socket.on('user-typing', handleTyping);
            }
        }

        return () => {
            if (socket) {
                socket.off('receive-message', handleNewMessage);
                socket.off('user-typing', handleTyping);
            }
        };
    }, [contact, socket]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const fetchChatHistory = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${serverurl}/api/users/chat/${contact._id}`, {
                withCredentials: true
            });
            setMessages(response.data);
        } catch (error) {
            console.error('Failed to fetch chat history:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleNewMessage = (message) => {
        if (message.sender._id === contact._id) {
            setMessages(prev => [...prev, message]);
        }
    };

    const handleTyping = ({ senderId, isTyping }) => {
        if (senderId === contact._id) {
            setTyping(isTyping);
        }
    };

    const handleSendMessage = async (content) => {
        if (!content.trim() || !contact) return;

        const messageData = {
            sender: {
                _id: contact._id, // This should be current user's ID
                name: contact.name,
                Username: contact.Username,
                image: contact.image
            },
            receiver: contact._id,
            content,
            timestamp: new Date().toISOString(),
            read: false
        };

        // Add message to local state immediately
        setMessages(prev => [...prev, messageData]);

        // Send via socket
        if (socket) {
            socket.emit('send-message', {
                ...messageData,
                receiverId: contact._id
            });
        }

        // Send to backend for storage
        try {
            await axios.post(`${serverurl}/api/messages/send`, {
                receiver: contact._id,
                content
            }, {
                withCredentials: true
            });
        } catch (error) {
            console.error('Failed to save message:', error);
        }
    };

    const handleTypingIndicator = (isTyping) => {
        if (socket && contact) {
            socket.emit('typing', {
                receiverId: contact._id,
                isTyping
            });
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    if (!contact) {
        return (
            <div className="h-full bg-gray-900 flex flex-col items-center justify-center text-center p-8">
                <User className="w-20 h-20 text-gray-600 mb-4" />
                <h3 className="text-white text-xl font-medium mb-2">Select a conversation</h3>
                <p className="text-gray-400">Choose a contact from the list to start chatting</p>
            </div>
        );
    }

    return (
        <div className="h-full bg-gray-900 flex flex-col">
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-800 flex items-center justify-between bg-gray-900">
                <div className="flex items-center space-x-3">
                    <button
                        onClick={onBack}
                        className="lg:hidden p-2 text-gray-400 hover:text-white"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="flex items-center space-x-3">
                        <div className="relative">
                            <img
                                src={contact.image || '/default-avatar.png'}
                                alt={contact.name}
                                className="w-10 h-10 rounded-full object-cover"
                            />
                            <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-gray-900 bg-green-500" />
                        </div>
                        <div>
                            <h3 className="text-white font-medium">{contact.name}</h3>
                            <p className="text-gray-400 text-sm">
                                {typing ? 'typing...' : 'online'}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="flex items-center space-x-4">
                    <button className="p-2 text-gray-400 hover:text-white transition-colors">
                        <Phone className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-white transition-colors">
                        <Video className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-white transition-colors">
                        <MoreVertical className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Messages Container */}
            <div 
                ref={chatContainerRef}
                className="flex-1 overflow-y-auto p-4 bg-gray-900"
            >
                {loading ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-lime-500"></div>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                        <div className="w-20 h-20 rounded-full bg-gray-800 flex items-center justify-center mb-4">
                            <User className="w-10 h-10 text-gray-400" />
                        </div>
                        <h3 className="text-white text-xl font-medium mb-2">Start a conversation</h3>
                        <p className="text-gray-400">Send your first message to {contact.name}</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {messages.map((message, index) => (
                            <MessageBubble
                                key={index}
                                message={message}
                                isOwn={message.sender._id !== contact._id}
                            />
                        ))}
                        <div ref={messagesEndRef} />
                    </div>
                )}
            </div>

            {/* Message Input */}
            <MessageInput
                onSendMessage={handleSendMessage}
                onTyping={handleTypingIndicator}
                receiverId={contact._id}
            />
        </div>
    );
};

export default ChatContainer;