import User from "../models/user.model.js";
import Message from "../models/message.model.js";

// Get user profile
export const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password -secret_password');
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json(user);
    } catch (error) {
        console.error('Error getting user profile:', error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Update user profile
export const updateProfile = async (req, res) => {
    try {
        const { name, email, phone } = req.body;
        
        const updateData = {};
        if (name) updateData.name = name;
        if (email) updateData.email = email;
        if (phone) updateData.phone = phone;
        
        // Handle profile picture upload
        if (req.file) {
            updateData.image = `/uploads/${req.file.filename}`;
        }

        const user = await User.findByIdAndUpdate(
            req.user._id,
            updateData,
            { new: true, runValidators: true }
        ).select('-password -secret_password');

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ message: "Profile updated successfully", user });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Search users by username
export const searchUsers = async (req, res) => {
    try {
        const { query } = req.query;
        
        if (!query) {
            return res.status(400).json({ message: "Search query is required" });
        }

        const users = await User.find({
            $or: [
                { Username: { $regex: query, $options: 'i' } },
                { name: { $regex: query, $options: 'i' } },
                { email: { $regex: query, $options: 'i' } }
            ],
            _id: { $ne: req.user._id } // Exclude current user
        }).select('-password -secret_password');

        res.status(200).json(users);
    } catch (error) {
        console.error('Error searching users:', error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Add contact
export const addContact = async (req, res) => {
    try {
        const { contactId } = req.body;
        
        if (!contactId) {
            return res.status(400).json({ message: "Contact ID is required" });
        }

        const contact = await User.findById(contactId).select('-password -secret_password');
        if (!contact) {
            return res.status(404).json({ message: "User not found" });
        }

        // Add contact to user's contact list
        const user = await User.findById(req.user._id);
        
        // Check if contact already exists
        const existingContact = user.contacts?.find(c => c.userId.equals(contactId));
        if (!existingContact) {
            user.contacts = user.contacts || [];
            user.contacts.push({
                userId: contactId,
                addedAt: new Date()
            });
            await user.save();
        }

        res.status(200).json({ message: "Contact added successfully", contact });
    } catch (error) {
        console.error('Error adding contact:', error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Get user contacts
export const getContacts = async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .populate('contacts.userId', '-password -secret_password');
        
        const contacts = user.contacts?.map(contact => contact.userId) || [];
        res.status(200).json(contacts);
    } catch (error) {
        console.error('Error getting contacts:', error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Get chat history with a user
export const getChatHistory = async (req, res) => {
    try {
        const { userId } = req.params;
        
        const messages = await Message.find({
            $or: [
                { sender: req.user._id, receiver: userId },
                { sender: userId, receiver: req.user._id }
            ]
        })
        .sort({ timestamp: 1 })
        .populate('sender', 'name Username image')
        .populate('receiver', 'name Username image');

        // Mark messages as read
        await Message.updateMany(
            { sender: userId, receiver: req.user._id, read: false },
            { read: true }
        );

        res.status(200).json(messages);
    } catch (error) {
        console.error('Error getting chat history:', error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Get online users
export const getOnlineUsers = async (req, res) => {
    try {
        // This endpoint would typically be handled by Socket.io
        // For now, return all users (in production, you'd track online status)
        const users = await User.find({ _id: { $ne: req.user._id } })
            .select('-password -secret_password');
        
        // Add dummy online status (in real app, this comes from Socket.io)
        const usersWithStatus = users.map(user => ({
            ...user.toObject(),
            online: Math.random() > 0.5 // Random for demo
        }));
        
        res.status(200).json(usersWithStatus);
    } catch (error) {
        console.error('Error getting online users:', error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};