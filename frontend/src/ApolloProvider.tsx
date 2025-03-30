import { ApolloClient, HttpLink, InMemoryCache, split } from "@apollo/client";
import { WebSocketLink } from "@apollo/client/link/ws";
import { getMainDefinition } from "@apollo/client/utilities";

const httpLink = new HttpLink({ uri: "http://localhost:5500/graphql" });

const wsLink = new WebSocketLink({
  uri: "ws://localhost:5500/graphql",
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
