import { createServer } from "http";
import { SubscriptionServer } from "subscriptions-transport-ws";
import { execute, subscribe } from "graphql";
import { makeExecutableSchema } from "@graphql-tools/schema";
import typeDefs from "./typeDefs.js";
import resolvers from "./resolvers.js";
import { ApolloServer } from "apollo-server-express";

let wsServerInstance = null;

export function initializeWebSocket(httpServer) {
  if (wsServerInstance) {
    console.log("WebSocket Server is already running.");
    return wsServerInstance;
  }

  console.log("Initializing WebSocket Server...");

  const schema = makeExecutableSchema({ typeDefs, resolvers });

  wsServerInstance = new SubscriptionServer(
    {
      schema,
      execute,
      subscribe,
      onConnect: () => {
        console.log("New WebSocket connection established.");
      },
      onDisconnect: () => {
        console.log("WebSocket connection closed.");
      },
    },
    {
      server: httpServer,
      path: "/graphql",
    }
  );

  return wsServerInstance;
}