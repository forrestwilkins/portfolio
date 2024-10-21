import express from 'express';
import helloRouter from './hello.routes';

const appRouter = express.Router();

appRouter.get('/health', (_, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toLocaleString(),
  });
});

appRouter.use('/hello', helloRouter);

export default appRouter;
