import React, { useContext, useEffect, useState } from "react";
import { Trans } from "@lingui/react";
import { LanguageContext } from "../../context/LanguageContext"; // 👈 Importamos el contexto
import CarritoIcono from "../Cart/CarritoIcono";
import CarritoModal from "../Cart/CarritoModal";
import { ProductosContext } from "../../context/ProductosContext";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api";
import "../../styles/Navbar.css";
import { useSearchParams } from 'react-router-dom';
import socket from "../../utils/socket";

const Navbar = ({ setMostrarSoloBebidas, mostrarSoloBebidas }) => {
  const [searchParams] = useSearchParams();
  const numeroMesa = searchParams.get("mesa");
  const { productos, categoriaSeleccionada, setCategoriaSeleccionada } =
    useContext(ProductosContext);
  const [pantallaPequena, setPantallaPequena] = useState(window.innerWidth <= 768);
  const [mostrarModal, setMostrarModal] = useState(false);
  const { cargarCarrito } = useContext(ProductosContext);
  const [pedidosListos, setPedidosListos] = useState(false);
  const navigate = useNavigate();
  const { locale, cambiarIdioma } = useContext(LanguageContext); // 👈 Obtenemos idioma y función para cambiarlo


  useEffect(() => {
    const handleResize = () => {
      setPantallaPequena(window.innerWidth <= 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    cargarCarrito();
  }, [cargarCarrito]);

  useEffect(() => {
    const verificarPedidosListos = async () => {
      if (!numeroMesa) return; // Si no hay número de mesa, no hacemos la petición
      try {
        const response = await api.get(`/pedidos/pedidos/estado/${numeroMesa}`);
        setPedidosListos(response.data?.todosListos || false);
      } catch (error) {
        console.error("Error al verificar el estado de los pedidos:", error);
        setPedidosListos(false);
      }
    };
    verificarPedidosListos();
  }, [numeroMesa]);

  useEffect(() => {
    if (socket) {
      socket.on("pedidosActualizados", (data) => {
        if (data.numeroMesa === Number(numeroMesa)) {
          setPedidosListos(data.todosListos);
        }
      });
      return () => {
        socket.off("pedidosActualizados");
      };
    }
  }, [socket, numeroMesa]);

  const handleCategoriaChange = (event) => {
    setCategoriaSeleccionada(event.target.value);
    setMostrarSoloBebidas(false);
  };

  const mostrarBebidas = () => {
    setMostrarSoloBebidas((prev) => !prev);
    setCategoriaSeleccionada("");
  };

  const manejarPedirCuenta = async () => {
    try {
      await api.post(`/cuenta/pedir-cuenta/${numeroMesa}`);
      navigate("/valoraciones");
    } catch (error) {
      console.error("Error al pedir la cuenta:", error);
    }
  };

  const categoriasFiltradas = productos
    .filter((producto) => (mostrarSoloBebidas ? producto.tipo === "bebida" : producto.tipo === "plato"))
    .map((producto) => producto.categoria)
    .filter((categoria, index, self) => self.indexOf(categoria) === index);

  return (
    <div className="container">
      <nav className="navbar">
        {/* 📌 PANTALLAS GRANDES: Estructura normal */}
        {!pantallaPequena ? (
          <div className="row w-100 align-items-center">
            <div className="col-12 d-flex justify-content-left align-items-center p-3">
              <select
                value={categoriaSeleccionada}
                onChange={handleCategoriaChange}
                className="navbar-select me-3"
              >
                <option value="">
                  <Trans id="todas-categorias">Todas las Categorías</Trans>
                </option>
                {categoriasFiltradas.map((categoria) => (
                  <option key={categoria} value={categoria}>
                    {categoria}
                  </option>
                ))}
              </select>

              <button className="navbar-btn me-3" onClick={mostrarBebidas}>
                {mostrarSoloBebidas ? <Trans id="platos">Platos</Trans> : <Trans id="bebidas">Bebidas</Trans>}
              </button>

              {pedidosListos && (
                <button className="navbar-check" onClick={manejarPedirCuenta}>
                  <Trans id="cuenta">Cuenta</Trans>
                </button>
              )}

              <div className="idiomas-navbar ms-auto">
                <button
                  className={`btn-idioma ${locale === "es" ? "activo" : ""}`}
                  onClick={() => cambiarIdioma("es")}
                >
                  Español
                </button>
                <button
                  className={`btn-idioma ${locale === "en" ? "activo" : ""}`}
                  onClick={() => cambiarIdioma("en")}
                >
                  English
                </button>
              </div>

              {numeroMesa && (
                <div className="carrito-icono">
                  <CarritoIcono abrirModal={() => setMostrarModal(true)} />
                </div>
              )}
            </div>
          </div>
        ) : (
          /* 📌 PANTALLAS PEQUEÑAS: Dos filas */
          <>
            {/* Contenedor padre para asegurar que las filas se apilen correctamente */}
            <div className="navbar-contenedor">
              {/* Fila 1: Idiomas (centrado) */}
              <div className="navbar-fila navbar-fila-idiomas">
                <div className="idiomas-navbar">
                  <button
                    className={`btn-idioma ${locale === "es" ? "activo" : ""}`}
                    onClick={() => cambiarIdioma("es")}
                  >
                    Español
                  </button>
                  <button
                    className={`btn-idioma ${locale === "en" ? "activo" : ""}`}
                    onClick={() => cambiarIdioma("en")}
                  >
                    English
                  </button>
                </div>
              </div>

              <div className="navbar-fila navbar-fila-opciones">
                <select
                  value={categoriaSeleccionada}
                  onChange={handleCategoriaChange}
                  className="navbar-select"
                >
                  <option value="">
                    <Trans id="todas-categorias">Todas las Categorías</Trans>
                  </option>
                  {categoriasFiltradas.map((categoria) => (
                    <option key={categoria} value={categoria}>
                      {categoria}
                    </option>
                  ))}
                </select>

                <button className="navbar-btn" onClick={mostrarBebidas}>
                  {mostrarSoloBebidas ? <Trans id="platos">Platos</Trans> : <Trans id="bebidas">Bebidas</Trans>}
                </button>

                {numeroMesa && (
                  <div className="carrito-icono">
                    <CarritoIcono abrirModal={() => setMostrarModal(true)} />
                  </div>
                )}
              </div>

              {/* Fila 3: Botón de Cuenta (centrado) */}
              {pedidosListos && (
                <div className="navbar-fila navbar-fila-cuenta">
                  <button className="navbar-check" onClick={manejarPedirCuenta}>
                    <Trans id="cuenta">Cuenta</Trans>
                  </button>
                </div>
              )}
            </div>
          </>
        )}

        {mostrarModal && (
          <CarritoModal cerrarModal={() => setMostrarModal(false)} />
        )}
      </nav>
    </div>
  );
};

export default Navbar;