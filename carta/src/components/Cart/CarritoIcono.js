import React, { useContext } from 'react';
import { ProductosContext } from '../../context/ProductosContext';

const CarritoIcono = ({ abrirModal }) => {
  const { carrito } = useContext(ProductosContext);

  const totalItems = Array.isArray(carrito?.items)
  ? carrito.items.reduce((total, item) => total + (item.cantidad || 0), 0)
  : 0;

  return (
    <div className="carrito-icono" onClick={abrirModal}>
      🛒
      <span className="contador">{totalItems}</span>
    </div>
  );
};

export default CarritoIcono;
