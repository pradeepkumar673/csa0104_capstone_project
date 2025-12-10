import React, { useState, useRef, useEffect } from 'react';
import { Send, Smile, Paperclip } from 'lucide-react';

const MessageInput = ({ onSendMessage, onTyping, receiverId }) => {
    const [message, setMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const typingTimeout = useRef(null);

    const handleInputChange = (e) => {
        const value = e.target.value;
        setMessage(value);
        
        // Handle typing indicator
        if (value && !isTyping) {
            setIsTyping(true);
            onTyping?.(receiverId, true);
        } else if (!value && isTyping) {
            setIsTyping(false);
            onTyping?.(receiverId, false);
        }
        
        // Clear previous timeout
        if (typingTimeout.current) {
            clearTimeout(typingTimeout.current);
        }
        
        // Set new timeout
        typingTimeout.current = setTimeout(() => {
            if (isTyping) {
                setIsTyping(false);
                onTyping?.(receiverId, false);
            }
        }, 3000);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (message.trim()) {
            onSendMessage(message.trim());
            setMessage('');
            
            // Clear typing indicator
            if (isTyping) {
                setIsTyping(false);
                onTyping?.(receiverId, false);
            }
            
            if (typingTimeout.current) {
                clearTimeout(typingTimeout.current);
            }
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    useEffect(() => {
        return () => {
            if (typingTimeout.current) {
                clearTimeout(typingTimeout.current);
            }
        };
    }, []);

    return (
        <form onSubmit={handleSubmit} className="p-4 border-t border-gray-800 bg-gray-900">
            <div className="flex items-center space-x-2">
                <button
                    type="button"
                    className="p-3 text-gray-400 hover:text-white transition-colors"
                >
                    <Paperclip className="w-5 h-5" />
                </button>
                
                <div className="flex-1 relative">
                    <textarea
                        value={message}
                        onChange={handleInputChange}
                        onKeyPress={handleKeyPress}
                        placeholder="Type a message..."
                        rows="1"
                        className="w-full px-4 py-3 pr-12 bg-gray-800 rounded-full text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-lime-500 resize-none max-h-32"
                    />
                    <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                    >
                        <Smile className="w-5 h-5" />
                    </button>
                </div>
                
                <button
                    type="submit"
                    disabled={!message.trim()}
                    className={`p-3 rounded-full transition-colors ${
                        message.trim()
                            ? 'bg-lime-600 text-white hover:bg-lime-700'
                            : 'bg-gray-800 text-gray-400 cursor-not-allowed'
                    }`}
                >
                    <Send className="w-5 h-5" />
                </button>
            </div>
        </form>
    );
};

export default MessageInput;