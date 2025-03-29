import express from 'express';
import cors from 'cors';
import nftRoutes from './routes/nft';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/nft', nftRoutes);

export default app;
