import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navigate } from 'react-router-dom';

import { MenuBar } from './components/MenuBar.js';
import { FileImport } from './components/FileImport.js';
import { About } from './components/About.js';
import { Input } from './components/Input.js';
import { Footer } from './components/Footer.js';

import './App.css';

/**
 * App component
 * 
 * @returns App component with Router, MenuBar, Routes, Route, Navigate, FileImport, About, Input, and Footer components
 */
function App() {
  return (
    <Router>
      <div>
        <MenuBar />
        <Routes>
          <Route path="/" element={<FileImport />} />
          <Route path="/about" element={<About />} />
          <Route path="/input" element={<Input />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      <Footer />
    </Router>
  );
}

export default App;