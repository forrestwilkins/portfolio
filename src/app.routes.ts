import express from 'express';

const appRouter = express.Router();

appRouter.get('/health', (_, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toLocaleString(),
  });
});

export default appRouter;
