import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';

import authRoutes from './modules/auth/auth.routes.js';
import userRoutes from './modules/user/user.routes.js';
import homeRoutes from './modules/home/home.routes.js';
import postsRoutes from './modules/posts/posts.routes.js';
import { errorHandler } from './middlewares/error.middleware.js';

const app = express();

app.use(helmet());

const corsOptions = {
  credentials: true,
};

// Development: allow any localhost port
if (process.env.NODE_ENV !== 'production') {
  corsOptions.origin = (origin, callback) => {
    if (!origin || /^http:\/\/localhost(:\d+)?$/.test(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS not allowed'));
    }
  };
} else {
  corsOptions.origin = process.env.CLIENT_URL;
}

app.use(cors(corsOptions));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/home', homeRoutes);
app.use('/api/posts', postsRoutes);

app.get('/health', (_, res) => {
  res.json({ status: 'ok' });
});

app.use(errorHandler);

export default app;