import express from 'express';
import authRouter from './auth/auth.routes';

const appRouter = express.Router();

appRouter.get('/health', (_, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toLocaleString(),
  });
});

appRouter.use('/auth', authRouter);

export default appRouter;
