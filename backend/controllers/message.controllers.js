import Message from "../models/message.model.js";

// Send a message
export const sendMessage = async (req, res) => {
    try {
        const { receiver, content } = req.body;
        
        if (!receiver || !content) {
            return res.status(400).json({ message: "Receiver and content are required" });
        }

        const message = new Message({
            sender: req.user._id,
            receiver,
            content
        });

        await message.save();
        
        // Populate sender info for response
        await message.populate('sender', 'name Username image');
        await message.populate('receiver', 'name Username image');

        res.status(201).json({ message: "Message sent successfully", data: message });
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Get unread messages count
export const getUnreadCount = async (req, res) => {
    try {
        const count = await Message.countDocuments({
            receiver: req.user._id,
            read: false
        });

        res.status(200).json({ count });
    } catch (error) {
        console.error('Error getting unread count:', error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Mark messages as read
export const markAsRead = async (req, res) => {
    try {
        const { senderId } = req.params;
        
        await Message.updateMany(
            { sender: senderId, receiver: req.user._id, read: false },
            { read: true }
        );

        res.status(200).json({ message: "Messages marked as read" });
    } catch (error) {
        console.error('Error marking messages as read:', error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};