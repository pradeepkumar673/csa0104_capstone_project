import express from 'express';
import { 
    sendMessage, 
    getUnreadCount, 
    markAsRead 
} from '../controllers/message.controllers.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const messageRouter = express.Router();

// All routes require authentication
messageRouter.use(verifyToken);

// Message routes
messageRouter.post('/send', sendMessage);
messageRouter.get('/unread', getUnreadCount);
messageRouter.put('/read/:senderId', markAsRead);

export default messageRouter;