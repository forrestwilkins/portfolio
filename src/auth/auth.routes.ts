import express from 'express';
import authService from './auth.service';

const authRouter = express.Router();

authRouter.post('/', (_, res) => {
  const token = authService.generateToken();
  res.json({ token });
});

export default authRouter;
