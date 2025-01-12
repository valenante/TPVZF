import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import DetalleMesa from './pages/DetallesMesa';
import DetallePedido from './components/DetallesPedido';
import ProductsMenu from './pages/ProductsMenu';
import { ProductosProvider } from './context/ProductosContext';
import Cocina from './components/Cocina/Cocina';
import Barra from './components/Barra/Barra';

function App() {
  return (
    <ProductosProvider> {/* El proveedor envuelve toda la aplicación */}
      <Router>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/mesas/:id" element={<DetalleMesa />} />
          <Route path="/pedidos/:id" element={<DetallePedido />} />
          <Route path="/products/" element={<ProductsMenu />} />
          <Route path="/cocina" element={<Cocina />} />
          <Route path="/barra" element={<Barra />} />
        </Routes>
      </Router>
    </ProductosProvider>
  );
}

export default App;
