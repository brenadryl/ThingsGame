import { ApolloClient, InMemoryCache, ApolloProvider, split, HttpLink } from '@apollo/client';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';
import { getMainDefinition } from '@apollo/client/utilities';
import { useEffect, useState } from 'react';

const GRAPHQL_HTTP_URL = process.env.REACT_APP_GRAPHQL_ENDPOINT || 'http://localhost:5500/graphql';
const GRAPHQL_WS_URL = GRAPHQL_HTTP_URL.replace(/^http/, 'ws'); // Converts http to ws automatically

// Create a function to initialize a new WebSocket connection
const createWsLink = () => {
  return new GraphQLWsLink(
    createClient({
      url: GRAPHQL_WS_URL,
      retryAttempts: Infinity,
      shouldRetry: () => true,
    })
  );
};

// Apollo Client instance (needs to be re-created when WebSocket reconnects)
const createApolloClient = (wsLink: GraphQLWsLink) => {
  const httpLink = new HttpLink({ uri: GRAPHQL_HTTP_URL });

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

  return new ApolloClient({
    link: splitLink,
    cache: new InMemoryCache(),
  });
};

const MyApolloProvider = ({ children }: { children: React.ReactNode }) => {
  const [wsLink, setWsLink] = useState(createWsLink);
  const [client, setClient] = useState(() => createApolloClient(wsLink));

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log("App is back in focus. Resetting Apollo store and WebSocket connection.");
        
        // Close the existing WebSocket connection
        wsLink.client.dispose();

        // Create a new WebSocket link
        const newWsLink = createWsLink();
        setWsLink(newWsLink);

        // Create a new Apollo Client with the updated WebSocket link
        setClient(createApolloClient(newWsLink));
      }
    };

    const handleOnline = () => {
      console.log("Network reconnected. Resetting Apollo store and WebSocket connection.");

      // Close and re-create WebSocket connection
      wsLink.client.dispose();
      const newWsLink = createWsLink();
      setWsLink(newWsLink);
      setClient(createApolloClient(newWsLink));
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('online', handleOnline);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('online', handleOnline);
    };
  }, [wsLink]); // Re-run effect when WebSocket link changes

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
};

export default MyApolloProvider;