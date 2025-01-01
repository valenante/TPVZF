import React, { useContext, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ProductosContext } from '../context/ProductosContext';
import Carta from '../components/Carta/Carta';
import Navbar from '../components/Navbar/Navbar';
import TopBar from '../components/Navbar/Topbar';

const CartaPage = () => {

  const { numeroMesa } = useParams();
  const { obtenerMesaId } = useContext(ProductosContext);

  useEffect(() => {
    if (numeroMesa) {
      obtenerMesaId(numeroMesa);
    }
  }, [numeroMesa, obtenerMesaId]);

  return (
    <div className="container">
      <TopBar />
      <Navbar />
      {/* Carta completa */}
      <main>
        <Carta />
      </main>
    </div>
  );
};

export default CartaPage;
