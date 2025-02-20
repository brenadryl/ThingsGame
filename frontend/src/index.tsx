import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import MyApolloProvider from './ApolloProvider';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

root.render(
  <React.StrictMode>
    <MyApolloProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </MyApolloProvider>
  </React.StrictMode>
);