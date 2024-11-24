import express from 'express';
import interactionsService from './interactions.service';

const interactionsRouter = express.Router();

interactionsRouter.get('/draw', async (_, res) => {
  const payload = await interactionsService.getDrawStream();
  res.json(payload);
});

interactionsRouter.delete('/draw', async (_, res) => {
  await interactionsService.clearDrawStream();
  res.status(204).end();
});

export default interactionsRouter;
