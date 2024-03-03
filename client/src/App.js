import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { MenuBar } from './components/MenuBar.js';
import { FileImport } from './components/FileImport.js';
import { Example } from './components/Example.js';

import './App.css';
import { Sankey } from './components/Sankey.js';

function App() {
  return (
    <Router>
      <div>
        <MenuBar />
        <Routes>
          <Route path="/" element={<FileImport />} />
          <Route path="/result" element={<Sankey />}/>
          <Route path="/example" element={<Example />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
