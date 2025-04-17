import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ApolloProvider } from '@apollo/client';
import App from './App';
import client from './ApolloProvider';
import './index.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Root element not found");
}

const MyApolloProvider = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
      const handleVisibilityChange = () => {
          if (document.visibilityState === 'visible') {
              console.log('App is back in focus, resetting Apollo store');
              client.resetStore(); // This will refetch active queries and restart subscriptions
          }
      };

      document.addEventListener('visibilitychange', handleVisibilityChange);

      return () => {
          document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
  }, []);

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
};

const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <MyApolloProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </MyApolloProvider>
  </React.StrictMode>
);