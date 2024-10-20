import express from 'express';
import helloRouter from './hello.routes';

const appRouter = express.Router();
appRouter.use('/hello', helloRouter);

export default appRouter;
