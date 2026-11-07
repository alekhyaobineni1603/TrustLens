import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import routes from './routes/index.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

const app = express();
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL?.split(',') || 'http://localhost:5173' }));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use('/api', rateLimit({ windowMs: 60*1000, limit: 120, standardHeaders: 'draft-7', legacyHeaders: false }));
app.use('/api/v1', routes);
app.use(notFound);
app.use(errorHandler);
export default app;
