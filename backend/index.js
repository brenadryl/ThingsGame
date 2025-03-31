import mongoose from 'mongoose';
import cors from 'cors';
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { createServer } from 'http';
import { initializeWebSocket } from "./websockets.js";
import { makeExecutableSchema } from '@graphql-tools/schema';
import typeDefs from './typeDefs.js';
import resolvers from './resolvers.js';
import dotenv from 'dotenv';

dotenv.config();
const allowedOrigins = ["http://localhost:3000", "https://things-game-ten.vercel.app/", "https://joaksonyou.com"];

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_CLUSTER_URL}/${process.env.DB_NAME}?retryWrites=true&w=majority`;

async function startServer() {
 try {
  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

  const app = express();

  app.use(cors({ credentials: true, origin: '*' }));
  // app.use(cors({ credentials: true, origin: allowedOrigins }));

  const httpServer = createServer(app);
  const { wsServerInstance, serverCleanup } = initializeWebSocket(httpServer);


  const schema = makeExecutableSchema({ typeDefs, resolvers });

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

  await server.start();

  server.applyMiddleware({ app });

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