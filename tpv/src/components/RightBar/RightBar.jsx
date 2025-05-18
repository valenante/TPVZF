import React, { useState, useEffect } from "react";
import axios from "axios";
import ProductoDetalle from "./ProductoDetalle.jsx";
import { useCategorias } from "../../context/CategoriasContext";
import api from "../../utils/api";
import AlertaMensaje from "../AlertaMensaje/AlertaMensaje"; // ✅ Asegúrate de tenerlo creado
import ModalProductosCategoria from "../ModalProductosCategoria/ModalProductosCategoria";
import CarritoOrganizable from "../CarritoOrganizable/CarritoOrganizable";
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
  const [mensajePedido, setMensajePedido] = useState("");
  const [carritoBebidas, setCarritoBebidas] = useState([]);
  const [productosYaPedidos, setProductosYaPedidos] = useState([]);
  const [carritoSecciones, setCarritoSecciones] = useState({

    entrante: [],
    medio: [],
    final: [],
  });

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
    if (productoPersonalizado.tipo === "bebida") {
      setCarritoBebidas((prev) => [...prev, productoPersonalizado]);
    } else {
      setCarritoSecciones((prev) => ({
        ...prev,
        medio: [...prev.medio, { ...productoPersonalizado, seccion: 'medio' }],
      }));
    }
    cerrarModal();
  };

  const enviarPedido = async () => {
    try {
      setIsLoading(true);

      const pedidoOrdenado = [...carritoSecciones.entrante, ...carritoSecciones.medio, ...carritoSecciones.final];

      if (pedidoOrdenado.length > 0) {
        const payloadPlatos = pedidoOrdenado.map(p => ({
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
          opcionesPersonalizables: p.opciones ? Object.entries(p.opciones).map(([tipo, opcion]) => ({ tipo, opcion })) : [],
          mensaje: p.mensaje || "",
          adicionales: p.adicionales || [],
          seccion: p.seccion || null,
        }));

        const { data } = await api.post(`/pedidos/${mesaId}/agregar-producto`, { productos: payloadPlatos });
        await enviarAImpresora(data, 'platos');
      }

      if (carritoBebidas.length > 0) {
        const payloadBebidas = carritoBebidas.map(p => ({
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

        const { data } = await api.post(`/pedidosBebidas/${mesaId}/agregar-producto`, { productos: payloadBebidas });
        await enviarAImpresora(data, 'bebidas');
      }

      setCarritoSecciones({ entrante: [], medio: [], final: [] });
      setCarritoBebidas([]);
      setMensajeAlerta({ tipo: "exito", mensaje: "Pedido enviado correctamente." });
    } catch (error) {
      console.error("Error al enviar el pedido:", error);
      setMensajeAlerta({ tipo: "error", mensaje: "Error al enviar el pedido." });
    } finally {
      setIsLoading(false);
    }
  };

  // Función para enviar a la impresora
  const enviarAImpresora = async (datos, tipo = 'platos') => {
    const rutaImpresion =
      tipo === 'bebidas'
        ? 'http://192.168.1.150:4000/imprimir-bebidas'
        : 'http://192.168.1.150:4000/imprimir';

    try {
      await axios.post(rutaImpresion, datos);
    } catch (error) {
      console.error(`Error al imprimir el pedido de ${tipo}:`, error.message);
    }
  };

  const handleClickCategoria = async (categoria) => {
    setCategoriaSeleccionada(categoria);

    // Cargar productos de la categoría
    const productosCargados = await fetchProducts(categoria);
    setProductosCategoriaActual(productosCargados);

    // Obtener productos ya pedidos de la mesa
    try {
      const { data } = await api.get(`/pedidos/mesa/${mesaId}`);

      // Combina productos de todos los pedidos
      const productosMesa = data || [];
      setProductosYaPedidos(productosMesa);

    } catch (error) {
      console.error("Error al obtener el pedido de la mesa:", error);
      setProductosYaPedidos([]);
    }
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
          productosPedidoMesa={productosYaPedidos} // ✅ Aqu
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
          <CarritoOrganizable
            carritoSecciones={carritoSecciones}
            setCarritoSecciones={setCarritoSecciones}
            enviarPedido={enviarPedido}
            isLoading={isLoading}
          />
          {carritoBebidas.length > 0 && (
            <div style={{ marginTop: "10px" }}>
              <h4>Bebidas</h4>
              <ul>
                {carritoBebidas.map((bebida, index) => (
                  <li key={index}>
                    {bebida.nombre} x{bebida.cantidad}
                  </li>
                ))}
              </ul>
            </div>
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
