import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { MenuBar } from './components/MenuBar.js';
import { FileImport } from './components/FileImport.js';
import { About } from './components/About.js';

import './App.css';

function App() {
  return (
    <Router>
      <div>
        <MenuBar />
        <Routes>
          <Route path="/" element={<FileImport />} />
          <Route path="/about" element={<About />} />
          {/* Add the following line to the App.js file later */}
          {/* <Route path="*" element={<NotFound />} /> */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;