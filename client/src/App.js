import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { MenuBar } from './components/MenuBar.js';
import { FileImport } from './components/FileImport.js';

import './App.css';

function App() {
  return (
    <Router>
      <div>
        <MenuBar />
        <Routes>
          <Route path="/" element={<FileImport />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
