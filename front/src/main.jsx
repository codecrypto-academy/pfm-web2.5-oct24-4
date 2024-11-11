import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Home from './components/Home';
import Nodos from './components/Nodos';
import Faucet from './components/Faucet';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} >
          <Route index element={<Home />} />
          <Route path="nodos" element={<Nodos />} />
          <Route path="faucet" element={<Faucet />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>
)
