import { ApolloClient, InMemoryCache, ApolloProvider, split, HttpLink } from '@apollo/client';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';
import { getMainDefinition } from '@apollo/client/utilities';

const GRAPHQL_HTTP_URL = process.env.REACT_APP_GRAPHQL_ENDPOINT || 'https://api.joaksonyou.com/graphql';
const GRAPHQL_WS_URL = GRAPHQL_HTTP_URL.replace(/^http/, 'ws'); // Converts http to ws automatically

// HTTP link for queries and mutations
const httpLink = new HttpLink({
  uri: GRAPHQL_HTTP_URL,
});

// WebSocket link for subscriptions
const wsLink = new GraphQLWsLink(
  createClient({
    url: GRAPHQL_WS_URL,
    // Note: The 'options' property has been removed
  })
);

// Split link to direct operations to the correct link
const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink,
  httpLink
);

// Apollo Client instance
const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
});

export { client, ApolloProvider };
