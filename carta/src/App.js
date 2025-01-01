import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ProductosProvider } from './context/ProductosContext';
import CartaPage from './pages/CartaPage';

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
      </Routes>
    </Router>
  );
}

export default App;
