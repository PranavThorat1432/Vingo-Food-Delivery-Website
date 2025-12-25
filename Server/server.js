import express from 'express';
import dotenv from 'dotenv';
dotenv.config();
import connectDB from './config/mongoDB.js';
import authRouter from './routes/authRoutes.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import userRouter from './routes/userRoutes.js';
import shopRouter from './routes/shopRoutes.js';
import itemRouter from './routes/itemRoutes.js';
import orderRouter from './routes/orderRoutes.js';
import http from 'http';
import { Server } from 'socket.io';
import { socketHandler } from './socket.js';

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

const io = new Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:5173',
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE']
    }
});

app.set('io', io);

// Middlewares
app.use(express.json());
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
}));
app.use(cookieParser());


app.get('/', (req, res) => {
    res.send('Server is running....')
});

// Routes
app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);
app.use('/api/shop', shopRouter);
app.use('/api/item', itemRouter);
app.use('/api/order', orderRouter);

socketHandler(io); 
server.listen(PORT, () => {
    connectDB(); 
    console.log(`Server is running on PORT: http://localhost:${PORT}`);
});