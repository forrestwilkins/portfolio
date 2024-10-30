import { v4 as uuidv4 } from 'uuid';
import express from 'express';

const authRouter = express.Router();

authRouter.post('/', (_, res) => {
  res.json({ token: uuidv4() });
});

export default authRouter;
