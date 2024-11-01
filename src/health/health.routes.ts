import express from 'express';
import HealthService from './health.service';

const healthRouter = express.Router();
const healthService = new HealthService();

healthRouter.get('/', (_, res) => {
  const payload = healthService.getHealth(res.locals.token);
  res.json(payload);
});

export default healthRouter;
