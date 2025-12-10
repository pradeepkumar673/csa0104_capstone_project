import express from 'express';
import { 
    getUserProfile, 
    updateProfile, 
    searchUsers, 
    addContact, 
    getContacts,
    getChatHistory,
    getOnlineUsers 
} from '../controllers/user.controllers.js';
import { verifyToken } from '../middleware/auth.middleware.js';
import multer from 'multer';
import path from 'path';

const userRouter = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'));
        }
    }
});

// All routes require authentication
userRouter.use(verifyToken);

// User profile routes
userRouter.get('/profile', getUserProfile);
userRouter.put('/profile', upload.single('image'), updateProfile);

// Contact management routes
userRouter.get('/search', searchUsers);
userRouter.post('/contacts', addContact);
userRouter.get('/contacts', getContacts);

// Chat routes
userRouter.get('/chat/:userId', getChatHistory);
userRouter.get('/online', getOnlineUsers);

export default userRouter;