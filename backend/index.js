import express from 'express';
import dotenv from 'dotenv';
import database from './configs/db.js';
import authRouter from './routes/auth.routes.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';
dotenv.config();

const app = express();
app.use(express.json());
app.use(cookieParser());
const port = process.env.PORT || 5000;
app.use(cors({
    origin:["http://localhost:5173"],
    methods:["GET","POST"],
    credentials:true
}));



app.get('/',(req,res)=>{
    res.send("thala API vodu dhu")
})

app.use("/api/auth",authRouter);

database().then(() => {
    app.listen(port,()=>{
        console.log(`server idula ${port} la run agudhu`)
    });
});
