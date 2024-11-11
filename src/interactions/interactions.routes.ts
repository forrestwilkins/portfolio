import express from 'express';
import interactionsService from './interactions.service';

const interactionsRouter = express.Router();

interactionsRouter.get('/sockets', async (_, res) => {
  const payload = await interactionsService.getSocketTestStream();
  res.json(payload);
});

interactionsRouter.delete('/sockets', async (_, res) => {
  await interactionsService.clearSocketTestStream();
  res.status(204).end();
});

export default interactionsRouter;
