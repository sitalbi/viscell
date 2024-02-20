import './App.css';
import { HomePage } from './pages/HomePage.js';
import { MainPage } from './pages/MainPage.js';
import { FileProvider } from './context/SankeyFile.js';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import React from 'react';
import Box from '@mui/material/Box/Box.js';


function App() {
  return (
    <Box sx={{ flexGrow: 1 }}>
      <FileProvider>
        <Router>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/result" element={<MainPage />} />
          </Routes>
        </Router>
      </FileProvider>
    </Box>
  );
}

export default App;