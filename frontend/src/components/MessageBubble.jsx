import React from 'react';

const MessageBubble = ({ message, isOwn }) => {
    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}>
            <div className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                isOwn 
                    ? 'bg-lime-600 text-white rounded-br-none' 
                    : 'bg-gray-800 text-white rounded-bl-none'
            }`}>
                <div className="flex items-end space-x-2">
                    <div>
                        <p className="break-words">{message.content}</p>
                        <div className={`flex items-center mt-1 text-xs ${
                            isOwn ? 'text-lime-200' : 'text-gray-400'
                        }`}>
                            <span>{formatTime(message.timestamp)}</span>
                            {isOwn && (
                                <span className="ml-1">
                                    {message.read ? '✓✓' : '✓'}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MessageBubble;