import express from 'express';
import healthService from './health.service';

const healthRouter = express.Router();

healthRouter.get('/', (_, res) => {
  const payload = healthService.getHealth();
  res.json(payload);
});

export default healthRouter;
