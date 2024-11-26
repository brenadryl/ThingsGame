import express, { urlencoded } from 'express';
import cors from 'cors';import pkg from 'body-parser';
import { getPrompts } from './routes/testRoutes.js';
import connectToDb from './configs/db.config.js';
const app = express();

const { json } = pkg;

app.use(urlencoded({ extended: true }));
app.use(json());
app.use(cors({ credentials: true, origin: '*' }));

app.get('/', (req, res) => {
  res.send('Hello from the NodeJS backend!');
});

app.use('/test', getPrompts);

async function startServer() {
  const port = process.env.PORT || 5500;
  app.listen({ port }, () =>
    console.log(`✨ Server ready at http://localhost:${port}`)
  );
  connectToDb();
}

startServer();