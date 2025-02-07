import mongoose from 'mongoose';
import express from 'express'; // Import express
import { ApolloServer } from 'apollo-server-express';
import { PubSub } from 'graphql-subscriptions';
import typeDefs from './typeDefs.js';
import resolvers from './resolvers.js';

const pubsub = new PubSub();

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_CLUSTER_URL}/${process.env.DB_NAME}?retryWrites=true&w=majority`;
async function startServer() {
  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

  const app = express();

  const server = new ApolloServer({ typeDefs, resolvers });

  await server.start();

  server.applyMiddleware({ app });

  app.listen({ port: 5500 }, () => {
    console.log(`Server ready at http://localhost:5500${server.graphqlPath}`);
  });
}

startServer();

// const app = express();


// const { json } = pkg;

// app.use(urlencoded({ extended: true }));
// app.use(json());
// app.use(cors({ credentials: true, origin: '*' }));
// app.get('/', (req, res) => {
//   res.send('Hello from the NodeJS backend!');
// });

// app.use('/test', getPrompts);

// app.use('/prompt', getPrompts);
// app.use('/player', getPrompts);
// app.use('/game', getPrompts);
// app.use('/round', getPrompts);
// app.use('/response', getPrompts);

// async function startServer() {
//   const port = process.env.PORT || 5500;
//   app.listen({ port }, () =>
//     console.log(`✨ Server ready at http://localhost:${port}`)
//   );
// }

// startServer();