import React from 'react';
import logo from './logo.svg';
import './App.css';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import TestPage from './pages/TestPage';

function App() {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/test">
            <TestPage />
          </Route>
          {/* Add more routes as needed */}
          <Route path="/">
            {/* TODO: remove this sample code for when developing your app */}
            <div className="App">
              <header className="App-header">
                <img src={logo} className="App-logo" alt="logo" />
                <p>
                  Edit <code>src/App.tsx</code> and save to reload.
                </p>
                <a
                  className="App-link"
                  href="https://reactjs.org"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Learn React
                </a>
              </header>
            </div>
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;