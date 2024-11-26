import React from 'react';
import logo from './logo.svg';
import './App.css';
import { Route, Routes } from 'react-router-dom';
import TestPage from './pages/TestPage';

function App() {
  return (
    <div>
      <Routes>
        {/* Define the /test route */}
        <Route path="/test" element={<TestPage />} />

        {/* Define the root route */}
        <Route
          path="/"
          element={
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
          }
        />
      </Routes>
    </div>
  );
}

export default App;