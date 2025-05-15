import React, { useState, useEffect } from "react";
import ProductoDetalle from "./ProductoDetalle.jsx";
import { useCategorias } from "../../context/CategoriasContext";
import api from "../../utils/api";
import AlertaMensaje from "../AlertaMensaje/AlertaMensaje"; // ✅ Asegúrate de tenerlo creado
import ModalProductosCategoria from "../ModalProductosCategoria/ModalProductosCategoria";
import "./RightBar.css";

const RightBar = ({ mesaId }) => {
  const [tipo, setTipo] = useState("plato");
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [preciosSeleccionados, setPreciosSeleccionados] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [carrito, setCarrito] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [mensajeAlerta, setMensajeAlerta] = useState(null);
  const [mostrarModalCategoria, setMostrarModalCategoria] = useState(false);
  const [productosCategoriaActual, setProductosCategoriaActual] = useState([]);
  const { categories, fetchCategories, products, fetchProducts } = useCategorias();
  const [mostrarResumen, setMostrarResumen] = useState(false);
  const [resumen, setResumen] = useState({});
  const [mensajeProducto, setMensajeProducto] = useState("");
  const [mensajePedido, setMensajePedido] = useState("");


  useEffect(() => { fetchCategories(tipo); }, [tipo]);
  useEffect(() => { if (categoriaSeleccionada) fetchProducts(categoriaSeleccionada); }, [categoriaSeleccionada]);

  const abrirModal = (producto) => {
    const precioSeleccionado = preciosSeleccionados[producto._id] !== undefined
      ? preciosSeleccionados[producto._id]
      : producto.tipo === "tapaRacion"
        ? producto.precios.tapa || producto.precios.racion
        : producto.precios.precioBase;

    setProductoSeleccionado({ ...producto, precioSeleccionado });
    setShowModal(true);
  };

  const cerrarModal = () => {
    setProductoSeleccionado(null);
    setShowModal(false);
  };

  const agregarAlCarrito = (productoPersonalizado) => {
    setCarrito((prev) => [...prev, productoPersonalizado]);
    cerrarModal();
  };

  const quitarDelCarrito = (index) => {
    setCarrito((prev) => prev.filter((_, i) => i !== index));
  };

  const enviarPedido = async () => {
    try {
      setIsLoading(true);

      const platos = carrito.filter(p => p.tipo !== "bebida");
      const bebidas = carrito.filter(p => p.tipo === "bebida");

      if (platos.length > 0) {
        const payloadPlatos = platos.map((p) => ({
          producto: p._id,
          cantidad: p.cantidad,
          total: p.precioSeleccionado * p.cantidad,
          precioSeleccionado: p.precioSeleccionado,
          tipoPrecio: p.tipoPrecio,
          tipoPlato: p.tipoPlato || null,
          acompanante: p.acompanante || null,
          tipo: p.tipo,
          categoria: p.categoria,
          ingredientes: p.ingredientes || [],
          opcionesPersonalizables: p.opciones
            ? Object.entries(p.opciones).map(([tipo, opcion]) => ({ tipo, opcion }))
            : [],
          mensaje: p.mensaje || "",
          adicionales: p.adicionales || [],
        }));
        await api.post(`/pedidos/${mesaId}/agregar-producto`, { productos: payloadPlatos });
      }

      if (bebidas.length > 0) {
        const payloadBebidas = bebidas.map((p) => ({
          producto: p._id,
          cantidad: p.cantidad,
          total: p.precioSeleccionado * p.cantidad,
          precioSeleccionado: p.precioSeleccionado,
          tipoPrecio: p.tipoPrecio,
          acompanante: p.acompanante || null,
          tipo: p.tipo,
          categoria: p.categoria,
          mensaje: p.mensaje || "",
        }));
        await api.post(`/pedidosBebidas/${mesaId}/agregar-producto`, { productos: payloadBebidas });
      }

      setMensajePedido("");
      setCarrito([]);
      setMensajeAlerta({ tipo: "exito", mensaje: "Pedido enviado correctamente." });
    } catch (error) {
      console.error("Error al enviar el pedido:", error);
      setMensajeAlerta({ tipo: "error", mensaje: "Error al enviar el pedido." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClickCategoria = async (categoria) => {
    setCategoriaSeleccionada(categoria);
    const productosCargados = await fetchProducts(categoria); // ✅ Asegúrate que fetchProducts devuelva los productos cargados
    setProductosCategoriaActual(productosCargados);
    setMostrarModalCategoria(true);
  };

  return (
    <div className="right-bar--rightbar">
      <div className="filtros-tipo--rightbar">
        <button onClick={() => setTipo("plato")} className={`boton-tipo--rightbar ${tipo === "plato" ? "activo--rightbar" : ""}`}>Platos</button>
        <button onClick={() => setTipo("bebida")} className={`boton-tipo--rightbar ${tipo === "bebida" ? "activo--rightbar" : ""}`}>Bebidas</button>
      </div>

      <div className="categorias--rightbar">
        <ul className="lista-categorias--rightbar">
          {categories.map((categoria) => (
            <li key={categoria}
              className={`categoria--rightbar ${categoria === categoriaSeleccionada ? "seleccionada--rightbar" : ""}`}
              onClick={() => handleClickCategoria(categoria)}>
              {categoria}
            </li>
          ))}
        </ul>
      </div>

      <button
        className="boton-toggle-resumen"
        onClick={() => setMostrarResumen(!mostrarResumen)}
      >
        📋
      </button>

      {showModal && productoSeleccionado && (
        <ProductoDetalle
          producto={productoSeleccionado}
          cerrarModal={cerrarModal}
          seleccionPrecio={productoSeleccionado.precioSeleccionado}
          onConfirm={agregarAlCarrito}
        />
      )}

      {mostrarModalCategoria && (
        <ModalProductosCategoria
          categoria={categoriaSeleccionada}
          productos={productosCategoriaActual}
          onClose={() => setMostrarModalCategoria(false)}
          onProductoClick={(producto) => {
            setMostrarModalCategoria(false);
            abrirModal(producto); // Reutiliza el modal detalle como antes
          }}
        />
      )}

      {mostrarResumen && (
        <div className="resumen-pedido-panel">
          <h4>Pedido Actual</h4>
          <ul className="lista-resumen-pedido">
            {carrito.map((item, index) => (
              <li key={index} className="item-resumen-pedido">
                <span>{item.nombre} x{item.cantidad}</span>
                <button
                  className="boton-eliminar-item"
                  onClick={() => quitarDelCarrito(index)}
                >
                  ✖
                </button>
              </li>
            ))}
          </ul>
          {carrito.length > 0 && (
            <button
              onClick={enviarPedido}
              disabled={isLoading}
              className="boton-enviar-pedido"
            >
              {isLoading ? "Enviando..." : "Enviar Pedido"}
            </button>
          )}
        </div>
      )}

      {mensajeAlerta && (
        <AlertaMensaje
          tipo={mensajeAlerta.tipo}
          mensaje={mensajeAlerta.mensaje}
          onClose={() => setMensajeAlerta(null)}
        />
      )}
    </div>
  );
};

export default RightBar;
