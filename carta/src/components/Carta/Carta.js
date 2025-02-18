import React, { useContext, useEffect, useState } from "react";
import { ProductosContext } from "../../context/ProductosContext";
import ProductoCard from "./ProductoCard";
import api from "../../utils/api";
import Navbar from "../Navbar/Navbar";

const Carta = () => {
  const { productos, categoriaSeleccionada, cargarProductos } = useContext(ProductosContext);
  const [valoraciones, setValoraciones] = useState({});
  const [mostrarSoloBebidas, setMostrarSoloBebidas] = useState(false); // 👈 Estado para bebidas

  useEffect(() => {
    const cargarValoraciones = async () => {
      try {
        const { data } = await api.get("/valoraciones/valoraciones/mas-valorados");
        const valoracionesMapeadas = data.reduce((acc, { _id, estrellas }) => {
          // Redondear las estrellas a un decimal
          acc[_id] = parseFloat(estrellas.toFixed(1));
          return acc;
        }, {});
        setValoraciones(valoracionesMapeadas);
      } catch (error) {
        console.error("Error al cargar valoraciones:", error);
      }
    };

    cargarProductos();
    cargarValoraciones();
  }, [cargarProductos]);

  const productosFiltrados = productos.filter((producto) => {
    const esCategoriaValida = categoriaSeleccionada
      ? producto.categoria === categoriaSeleccionada
      : true;
    const estaHabilitado = producto.estado === "habilitado";
    const esBebida = producto.tipo === "bebida";

    if (mostrarSoloBebidas) {
      return esBebida && estaHabilitado;
    }

    return esCategoriaValida && estaHabilitado;
  });

  return (
    <>
      <Navbar setMostrarSoloBebidas={setMostrarSoloBebidas} mostrarSoloBebidas={mostrarSoloBebidas} />  {/* 👈 Pasamos la variable */}
      <div className="productos-grid">
        {productosFiltrados.map((producto) => (
          <ProductoCard
            key={producto._id}
            producto={producto}
            estrellas={valoraciones[producto._id]}
          />
        ))}
      </div>
    </>
  );
};

export default Carta;
