import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import ContactList from '../components/ContactList';
import ChatContainer from '../components/ChatContainer';
import AddContactModal from '../components/AddContactModal';
import SettingsModal from '../components/SettingsModal';
import { serverurl } from '../main.jsx';
import { 
    MessageSquare, 
    UserPlus, 
    Settings, 
    LogOut, 
    Menu, 
    X 
} from 'lucide-react';

const Dashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [socket, setSocket] = useState(null);
    const [selectedContact, setSelectedContact] = useState(null);
    const [showAddContact, setShowAddContact] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [onlineUsers, setOnlineUsers] = useState([]);

    useEffect(() => {
        // Initialize socket connection
        const newSocket = io(serverurl, {
            withCredentials: true,
            transports: ['websocket', 'polling']
        });
        
        setSocket(newSocket);

        // Set user as online
        if (user) {
            newSocket.emit('user-online', user._id);
        }

        // Listen for online users
        newSocket.on('online-users', (users) => {
            setOnlineUsers(users);
        });

        return () => {
            newSocket.disconnect();
        };
    }, [user]);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const handleContactAdded = () => {
        setShowAddContact(false);
    };

    return (
        <div className="h-screen bg-black overflow-hidden">
            {/* Mobile Header */}
            <div className="lg:hidden p-4 bg-gray-900 border-b border-gray-800 flex items-center justify-between">
                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="p-2 text-gray-400 hover:text-white"
                >
                    {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
                <div className="flex items-center space-x-3">
                    <img
                        src={user?.image || '/default-avatar.png'}
                        alt={user?.name}
                        className="w-8 h-8 rounded-full object-cover"
                    />
                    <span className="text-white font-medium">{user?.name}</span>
                </div>
            </div>

            <div className="flex h-[calc(100vh-64px)] lg:h-screen">
                {/* Sidebar */}
                <div className={`
                    ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                    fixed lg:relative inset-y-0 left-0 z-30 w-80 lg:w-96 bg-gray-900 transform transition-transform duration-300 ease-in-out lg:transform-none
                    h-full lg:h-auto
                `}>
                    {/* Sidebar Header */}
                    <div className="p-6 border-b border-gray-800">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center space-x-3">
                                <MessageSquare className="w-8 h-8 text-lime-500" />
                                <h1 className="text-2xl font-bold text-white">ChatApp</h1>
                            </div>
                            <button
                                onClick={() => setSidebarOpen(false)}
                                className="lg:hidden p-2 text-gray-400 hover:text-white"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <div className="flex items-center space-x-3 mb-6">
                            <img
                                src={user?.image || '/default-avatar.png'}
                                alt={user?.name}
                                className="w-12 h-12 rounded-full object-cover border-2 border-lime-500"
                            />
                            <div className="flex-1 min-w-0">
                                <h2 className="text-white font-medium truncate">{user?.name}</h2>
                                <p className="text-gray-400 text-sm truncate">@{user?.Username}</p>
                                <p className="text-green-400 text-xs">● Online</p>
                            </div>
                        </div>

                        <div className="flex space-x-2">
                            <button
                                onClick={() => setShowAddContact(true)}
                                className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-lime-600 text-white rounded-lg hover:bg-lime-700 transition-colors"
                            >
                                <UserPlus className="w-4 h-4" />
                                <span>Add Contact</span>
                            </button>
                            <button
                                onClick={() => setShowSettings(true)}
                                className="p-2 bg-gray-800 text-gray-400 rounded-lg hover:text-white hover:bg-gray-700 transition-colors"
                            >
                                <Settings className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Contacts */}
                    <div className="h-[calc(100vh-240px)] lg:h-[calc(100vh-200px)]">
                        <ContactList
                            onSelectContact={(contact) => {
                                setSelectedContact(contact);
                                if (window.innerWidth < 1024) {
                                    setSidebarOpen(false);
                                }
                            }}
                            selectedContact={selectedContact}
                            onlineUsers={onlineUsers}
                        />
                    </div>

                    {/* Footer */}
                    <div className="p-4 border-t border-gray-800">
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gray-800 text-red-400 rounded-lg hover:bg-gray-700 transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                            <span>Logout</span>
                        </button>
                    </div>
                </div>

                {/* Chat Area */}
                <div className="flex-1 h-full">
                    <ChatContainer
                        contact={selectedContact}
                        socket={socket}
                        onBack={() => setSidebarOpen(true)}
                    />
                </div>
            </div>

            {/* Modals */}
            <AddContactModal
                isOpen={showAddContact}
                onClose={() => setShowAddContact(false)}
                onContactAdded={handleContactAdded}
            />
            
            <SettingsModal
                isOpen={showSettings}
                onClose={() => setShowSettings(false)}
            />

            {/* Overlay for mobile */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}
        </div>
    );
};

export default Dashboard;