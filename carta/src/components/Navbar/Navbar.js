import React, { useContext, useEffect, useState } from "react";
import CarritoIcono from "../Cart/CarritoIcono";
import CarritoModal from "../Cart/CarritoModal";
import { ProductosContext } from "../../context/ProductosContext";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api";
import "../../styles/Navbar.css";
import { useParams } from "react-router-dom";
import socket from "../../utils/socket";

const Navbar = () => {
  const { categorias, categoriaSeleccionada, setCategoriaSeleccionada } =
    useContext(ProductosContext);
  const [mostrarModal, setMostrarModal] = useState(false);
  const { cargarCarrito } = useContext(ProductosContext);
  const [pedidosListos, setPedidosListos] = useState(false);
  const navigate = useNavigate();
  const { numeroMesa } = useParams();

  // Cargar carrito al montar
  useEffect(() => {
    cargarCarrito();
  }, [cargarCarrito]);

  useEffect(() => {
    const verificarPedidosListos = async () => {
      try {
        const response = await api.get(`/pedidos/pedidos/estado/${numeroMesa}`);
  
        // Verificar si hay datos en la respuesta y actualizar el estado
        if (response.data && response.data.todosListos !== undefined) {
          setPedidosListos(response.data.todosListos);
        } else {
          setPedidosListos(false); // Si no hay pedidos, no mostrar el botón
        }
      } catch (error) {
        console.error("Error al verificar el estado de los pedidos:", error);
        setPedidosListos(false); // Si hay error, no mostrar el botón
      }
    };
  
    verificarPedidosListos();
  }, [numeroMesa]);

  // Escuchar el evento `pedidosActualizados` para actualizaciones en tiempo real
  useEffect(() => {
    if (socket) {
      socket.on("pedidosActualizados", (data) => {
        if (data.numeroMesa === Number(numeroMesa)) {
          setPedidosListos(data.todosListos);
        }
      });

      return () => {
        socket.off("pedidosActualizados"); // Limpiar el evento al desmontar
      };
    }
  }, [socket, numeroMesa]);

  // Cambiar categoría
  const handleCategoriaChange = (event) => {
    setCategoriaSeleccionada(event.target.value);
  };

  // Pedir cuenta
  const manejarPedirCuenta = async () => {
    try {
      await api.post(`/cuenta/pedir-cuenta/${numeroMesa}`);
      navigate("/valoraciones");
    } catch (error) {
      console.error("Error al pedir la cuenta:", error);
    }
  };

  return (
    <div className="container">
      <nav className="navbar">
        <div className="row w-100 align-items-center">
          <div className="col-12 d-flex justify-content-left align-items-center p-3">
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

            {pedidosListos && (
              <button className="navbar-check" onClick={manejarPedirCuenta}>Cuenta</button>
            )}

            <div className="carrito-icono">
              <CarritoIcono abrirModal={() => setMostrarModal(true)} />
            </div>

            {mostrarModal && (
              <CarritoModal cerrarModal={() => setMostrarModal(false)} />
            )}
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
