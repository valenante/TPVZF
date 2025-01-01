import React, { useContext, useEffect } from 'react';
import { ProductosContext } from '../../context/ProductosContext';
import ProductoCard from './ProductoCard';

const Carta = () => {
  const { productos, categoriaSeleccionada, cargarProductos } = useContext(ProductosContext);

  useEffect(() => {
    cargarProductos(); // Cargar productos al montar el componente
  }, [cargarProductos]);

  // Filtrar productos por categoría seleccionada
  const productosFiltrados = categoriaSeleccionada
    ? productos.filter((producto) => producto.categoria === categoriaSeleccionada)
    : productos;

  return (
    <div className="productos-grid">
      {productosFiltrados.map((producto) => (
        <ProductoCard key={producto._id} producto={producto} />
      ))}
    </div>
  );
};

export default Carta;
