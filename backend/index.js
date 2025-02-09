import mongoose from 'mongoose';
import cors from 'cors';
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/use/ws';
import { makeExecutableSchema } from '@graphql-tools/schema';
import typeDefs from './typeDefs.js';
import resolvers from './resolvers.js';
import dotenv from 'dotenv';

dotenv.config();
const allowedOrigins = ["http://localhost:3000", "https://things-game-ten.vercel.app/"];

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_CLUSTER_URL}/${process.env.DB_NAME}?retryWrites=true&w=majority`;

async function startServer() {
 try { // Connect to MongoDB
  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

  // Create an Express application
  const app = express();

  // Configure CORS
  app.use(cors({ credentials: true, origin: '*' }));
  // app.use(cors({ credentials: true, origin: allowedOrigins }));

  // Create an HTTP server
  const httpServer = createServer(app);

  // Create the schema
  const schema = makeExecutableSchema({ typeDefs, resolvers });

  // Set up WebSocket server for subscriptions
  const wsServer = new WebSocketServer({
    server: httpServer,
    path: '/graphql',
  });

  const serverCleanup = useServer({ schema }, wsServer);

  // Set up Apollo Server
  const server = new ApolloServer({ 
    schema,
    plugins: [
      {
        async serverWillStart() {
          return {
            async drainServer () {
              await serverCleanup.dispose();
            }
          }
        }
      }
    ]
  });

  // Start Apollo Server
  await server.start();

  // Apply Apollo middleware to Express app
  server.applyMiddleware({ app });

  // Start the HTTP server
  const PORT = process.env.PORT || 5500;
  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server ready at http://localhost:${PORT}${server.graphqlPath}`);
  });
 } catch (error) {
  console.error("Error starting server", error)
  process.exit(1);
 }

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