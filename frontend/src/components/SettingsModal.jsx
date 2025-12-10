import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Upload, Camera } from 'lucide-react';

const SettingsModal = ({ isOpen, onClose }) => {
    const { user, updateProfile } = useAuth();
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        status: user?.status || ''
    });
    const [profileImage, setProfileImage] = useState(null);
    const [previewImage, setPreviewImage] = useState(user?.image || '');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setMessage({ type: 'error', text: 'Image size should be less than 5MB' });
                return;
            }
            setProfileImage(file);
            setPreviewImage(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const data = new FormData();
            data.append('name', formData.name);
            data.append('email', formData.email);
            data.append('phone', formData.phone);
            data.append('status', formData.status);
            if (profileImage) {
                data.append('image', profileImage);
            }

            const result = await updateProfile(data);
            
            if (result.success) {
                setMessage({ type: 'success', text: 'Profile updated successfully!' });
                setTimeout(() => {
                    onClose();
                }, 1500);
            } else {
                setMessage({ type: 'error', text: result.message });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to update profile' });
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-white">Profile Settings</h2>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-full hover:bg-gray-800 transition-colors"
                        >
                            <X className="w-6 h-6 text-white" />
                        </button>
                    </div>

                    {message.text && (
                        <div className={`mb-6 p-3 rounded-lg ${message.type === 'success' ? 'bg-green-900 text-green-100' : 'bg-red-900 text-red-100'}`}>
                            {message.text}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        {/* Profile Picture Upload */}
                        <div className="mb-8">
                            <label className="block text-white mb-3">Profile Picture</label>
                            <div className="flex flex-col items-center">
                                <div className="relative mb-4">
                                    <img
                                        src={previewImage || '/default-avatar.png'}
                                        alt="Profile"
                                        className="w-32 h-32 rounded-full object-cover border-4 border-gray-800"
                                    />
                                    <label className="absolute bottom-0 right-0 bg-lime-600 text-white p-2 rounded-full cursor-pointer hover:bg-lime-700 transition-colors">
                                        <Camera className="w-5 h-5" />
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className="hidden"
                                        />
                                    </label>
                                </div>
                                <p className="text-gray-400 text-sm">Click camera icon to change photo</p>
                            </div>
                        </div>

                        {/* Form Fields */}
                        <div className="space-y-4 mb-6">
                            <div>
                                <label className="block text-white mb-2">Full Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 bg-gray-800 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-lime-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-white mb-2">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 bg-gray-800 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-lime-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-white mb-2">Phone Number</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 bg-gray-800 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-lime-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-white mb-2">Status</label>
                                <textarea
                                    name="status"
                                    value={formData.status}
                                    onChange={handleInputChange}
                                    rows="2"
                                    className="w-full px-4 py-3 bg-gray-800 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-lime-500 resize-none"
                                    placeholder="What's on your mind?"
                                />
                            </div>
                        </div>

                        <div className="flex space-x-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-4 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 px-4 py-3 bg-lime-600 text-white rounded-lg hover:bg-lime-700 transition-colors disabled:opacity-50"
                            >
                                {loading ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;