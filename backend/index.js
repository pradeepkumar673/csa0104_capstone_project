import express from 'express';
import dotenv from 'dotenv';
import database from './configs/db.js';
import authRouter from './routes/auth.routes.js';
import userRouter from './routes/user.routes.js';
import messageRouter from './routes/message.routes.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"],
        credentials: true
    }
});

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));

const port = process.env.PORT || 5000;

// Store online users
const onlineUsers = new Map();

// Socket.io connection
io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    // Handle user coming online
    socket.on('user-online', (userId) => {
        onlineUsers.set(userId, socket.id);
        io.emit('online-users', Array.from(onlineUsers.keys()));
    });

    // Handle sending messages
    socket.on('send-message', (messageData) => {
        const { receiverId, ...message } = messageData;
        const receiverSocketId = onlineUsers.get(receiverId);
        
        if (receiverSocketId) {
            io.to(receiverSocketId).emit('receive-message', message);
        }
    });

    // Handle typing indicator
    socket.on('typing', ({ receiverId, isTyping }) => {
        const receiverSocketId = onlineUsers.get(receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit('user-typing', { senderId: socket.id, isTyping });
        }
    });

    // Handle user disconnect
    socket.on('disconnect', () => {
        for (let [userId, socketId] of onlineUsers.entries()) {
            if (socketId === socket.id) {
                onlineUsers.delete(userId);
                io.emit('online-users', Array.from(onlineUsers.keys()));
                break;
            }
        }
        console.log('Client disconnected:', socket.id);
    });
});

// Routes
app.get('/', (req, res) => {
    res.send("Chat API Server Running");
});

app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/messages", messageRouter);

// Serve static files from uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

database().then(() => {
    server.listen(port, () => {
        console.log(`Server running on port ${port}`);
    });
});