import express from 'express';
import authRouter from './auth/auth.routes';
import healthRouter from './health/health.routes';
import interactionsRouter from './interactions/interactions.routes';

const appRouter = express.Router();

appRouter.use('/auth', authRouter);
appRouter.use('/health', healthRouter);
appRouter.use('/interactions', interactionsRouter);

export default appRouter;
