import React from 'react';

const OnlineIndicator = ({ online, size = 'small' }) => {
    const sizes = {
        small: 'w-3 h-3',
        medium: 'w-4 h-4',
        large: 'w-5 h-5'
    };

    return (
        <div className={`${sizes[size]} rounded-full border-2 border-white ${online ? 'bg-green-500' : 'bg-gray-400'}`} />
    );
};

export default OnlineIndicator;