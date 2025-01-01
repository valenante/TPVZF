import React, { useContext, useEffect, useState } from 'react';
import CarritoIcono from '../Cart/CarritoIcono';
import CarritoModal from '../Cart/CarritoModal';
import { ProductosContext } from '../../context/ProductosContext';
import '../../styles/Navbar.css';

const Navbar = () => {
  const { categorias, categoriaSeleccionada, setCategoriaSeleccionada } = useContext(ProductosContext);
  const [mostrarModal, setMostrarModal] = useState(false);
  const { cargarCarrito } = useContext(ProductosContext);

  useEffect(() => {
    cargarCarrito(); // Cargar el carrito al montar el componente
  }, [cargarCarrito]);

  // Manejar el cambio de categoría
  const handleCategoriaChange = (event) => {
    setCategoriaSeleccionada(event.target.value); // Actualizar categoría seleccionada en el contexto
  };

  return (
    <div className="container">
      <nav className="navbar">
        <div className="row w-100 align-items-center">
          <div className="col-12 d-flex justify-content-left align-items-center p-3">
            {/* Select para categorías */}
            <select
              value={categoriaSeleccionada}
              onChange={handleCategoriaChange}
              className="navbar-select me-3"
            >
              <option value="">Todas las Categorías</option>
              {categorias.map((categoria) => (
                <option key={categoria} value={categoria}>
                  {categoria}
                </option>
              ))}
            </select>

            {/* Ícono del carrito */}
            <div className="carrito-icono">
              <CarritoIcono abrirModal={() => setMostrarModal(true)} />
            </div>

            {/* Modal del carrito */}
            {mostrarModal && <CarritoModal cerrarModal={() => setMostrarModal(false)} />}
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
