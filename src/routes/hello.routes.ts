import express from 'express';

const helloRouter = express.Router();

helloRouter.get('/', (_, res) => {
  res.send('Hello World');
});

export default helloRouter;
