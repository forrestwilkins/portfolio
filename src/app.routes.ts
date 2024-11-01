import express from 'express';
import authRouter from './auth/auth.routes';
import AuthService from './auth/auth.service';
import healthRouter from './health/health.routes';

const appRouter = express.Router();
const authService = new AuthService();

appRouter.use(authService.addTokenToLocals);
appRouter.use('/auth', authRouter);
appRouter.use('/health', healthRouter);

export default appRouter;
