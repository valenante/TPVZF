import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ProductosProvider } from './context/ProductosContext';
import { ToastContainer } from "react-toastify";
import CartaPage from './pages/CartaPage';
import PreMenu from './components/PreMenu/PreMenu';
import Valoraciones from './pages/Valoraciones.js';

function App() {
  
  return (
    <Router>
      <Routes>
        {/* Pasa `numeroMesa` como prop al `ProductosProvider` */}
        <Route
          path="/:numeroMesa"
          element={
            <ProductosProvider>
              <CartaPage />
            </ProductosProvider>
          }
        />
        <Route path="/preMenu" element={<PreMenu  />} />
        <Route path="/valoraciones" element={<Valoraciones />} />
      </Routes>
    </Router>
  );
}

export default App;
