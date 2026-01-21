import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import './db/index.js';
import { setupSocket } from './socket/index.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "*", // Adjust for production
        methods: ["GET", "POST"]
    }
});

import authRoutes from './routes/authRoutes.js';
import clubRoutes from './routes/clubRoutes.js';
import tableRoutes from './routes/tableRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import historyRoutes from './routes/historyRoutes.js';

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/clubs', clubRoutes);
app.use('/api/tables', tableRoutes);

const PORT = process.env.PORT || 3000;


// Serve static files from the client dist directory
const clientBuildPath = path.join(__dirname, '../../client/dist');
app.use(express.static(clientBuildPath));

// Handle SPA routing: serve index.html for any unknown route
app.get('*', (req, res) => {
    res.sendFile(path.join(clientBuildPath, 'index.html'));
});

setupSocket(io);

httpServer.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
