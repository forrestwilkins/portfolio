import express from 'express';
import AuthService from './auth.service';

const authRouter = express.Router();
const authService = new AuthService();

authRouter.post('/', (_, res) => {
  const token = authService.generateToken();
  res.json({ token });
});

export default authRouter;
