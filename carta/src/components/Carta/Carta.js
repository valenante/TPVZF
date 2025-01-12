import React, { useContext, useEffect } from 'react';
import { ProductosContext } from '../../context/ProductosContext';
import ProductoCard from './ProductoCard';

const Carta = () => {
  const { productos, categoriaSeleccionada, cargarProductos } = useContext(ProductosContext);

  useEffect(() => {
    cargarProductos(); // Cargar productos al montar el componente
  }, [cargarProductos]);

  // Filtrar productos por categoría seleccionada y por estado habilitado
  const productosFiltrados = productos.filter((producto) => {
    const esCategoriaValida = categoriaSeleccionada
      ? producto.categoria === categoriaSeleccionada
      : true; // Si no hay categoría seleccionada, incluir todos
    const estaHabilitado = producto.estado === "habilitado";
    return esCategoriaValida && estaHabilitado;
  });

  return (
    <div className="productos-grid">
      {productosFiltrados.map((producto) => (
        <ProductoCard key={producto._id} producto={producto} />
      ))}
    </div>
  );
};

export default Carta;
