import express from 'express';
import mongoose from 'mongoose';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import dotenv from 'dotenv';
import xss from 'xss-clean';
import mongoSanitize from 'express-mongo-sanitize';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';

import routes from './routes/index.js';
import { errorHandler, notFound } from './middlewares/error.js';

dotenv.config();

const app = express();

// Security & parsers
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || '*', credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(xss());
app.use(mongoSanitize());

// Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Rate limiting
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200 });
app.use(limiter);

// Swagger docs
try {
  const swaggerDocument = YAML.load(new URL('./swagger/swagger.yaml', import.meta.url));
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
} catch (e) {
  // eslint-disable-next-line no-console
  console.warn('Swagger not loaded yet.');
}

// Routes
app.use('/api', routes);

// 404 and error
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI;

// Only enforce MONGO_URI in non-test environments
if (!MONGO_URI && process.env.NODE_ENV !== 'test') {
  // eslint-disable-next-line no-console
  console.error('MONGO_URI is not set. Please set it in your environment.');
  process.exit(1);
}

async function connectWithRetry(retries = 5, delayMs = 3000) {
  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      await mongoose.connect(MONGO_URI);
      // eslint-disable-next-line no-console
      console.log('MongoDB connected');
      return;
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(`MongoDB connection failed (attempt ${attempt}/${retries}):`, err.message);
      if (attempt === retries) throw err;
      // eslint-disable-next-line no-await-in-loop
      await new Promise((res) => setTimeout(res, delayMs));
    }
  }
}

export const start = async () => {
  await connectWithRetry();
  return app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Server running on port ${PORT}`);
  });
};

// Start only if not in test mode
if (process.env.NODE_ENV !== 'test') {
  start();
}

export default app;
