import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { FileProvider } from './context/SankeyFile.js';
import { HomePage } from './pages/HomePage.js';
import { MainPage } from './pages/MainPage.js';
import { MenuBar } from './components/MenuBar.js';

import './App.css';

function App() {
  return (
    <FileProvider>
      <Router>
        <div>
          <MenuBar />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/result" element={<MainPage />} />
          </Routes>
        </div>
      </Router>
    </FileProvider>
  );
}

export default App;
