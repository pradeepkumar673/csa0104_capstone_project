import express from 'express';
import {Signup,login,logout} from '../controllers/auth.controllers.js';
const authRouter = express.Router();

authRouter.post('/api/auth/signup',Signup);

authRouter.post('/api/auth/login',login);
authRouter.get('/api/auth/logout',logout);



export default authRouter;
