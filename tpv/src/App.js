import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import DetalleMesa from './pages/DetallesMesa';
import DetallePedido from './components/DetallesPedido'; // Importar el componente

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/mesas/:id" element={<DetalleMesa />} />
        <Route path="/pedidos/:id" element={<DetallePedido />} /> {/* Nueva ruta */}
      </Routes>
    </Router>
  );
}

export default App;
