const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const { gql } = require('graphql-tag');
const { createServer } = require('http');
const cors = require('cors');

const isDev = process.env.MIDDLEWARE_ENV === 'dev';

const typeDefs = gql`
type Query {
    hello: String
}
`;

const resolvers = {
    Query: {
        hello: () => 'Hello world!',
    },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: isDev,
  playground: isDev
});
const app = express();
app.use(cors());

async function startServer() {
  await server.start();
  server.applyMiddleware({ app });

  // Only listen on HTTP port in local development, not when deployed on Vercel
  if (!process.env.VERCEL) {
    const PORT = process.env.PORT || 4000;
    app.listen(PORT, () => console.log(`💫 Server ready at http://localhost:${PORT}/graphql`));
  }
}

startServer();
const requestHandler = app;
const vercelServer = createServer((req, res) => requestHandler(req, res));
module.exports = vercelServer;