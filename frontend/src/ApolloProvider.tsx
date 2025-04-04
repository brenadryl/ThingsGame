import { ApolloClient, HttpLink, InMemoryCache, split } from "@apollo/client";
import { WebSocketLink } from "@apollo/client/link/ws";
import { getMainDefinition } from "@apollo/client/utilities";

const GRAPHQL_HTTP_URL = process.env.REACT_APP_GRAPHQL_ENDPOINT || 'http://localhost:5500/graphql';
const GRAPHQL_WS_URL = GRAPHQL_HTTP_URL.replace(/^http/, 'ws'); // Converts http to ws automatically

const httpLink = new HttpLink({ uri: "https://api.joaksonyou.com/graphql"});

const wsLink = new WebSocketLink({
  uri: "wss://api.joaksonyou.com/graphql",
  options: {
    reconnect: true,
    lazy: true,
    timeout: 30000,
  },
});

const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === "OperationDefinition" &&
      definition.operation === "subscription"
    );
  },
  wsLink,
  httpLink
);

const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache({
    typePolicies: {
      Player: {
        keyFields: ["_id"],
        fields: {
          icon: {
            merge(existing, incoming) {
              return incoming ?? existing;
            },
          },
        },
      },
    },
  }),
});

export default client;
