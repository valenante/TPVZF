import React, { useContext, useEffect, useState } from "react";
import { ProductosContext } from "../../context/ProductosContext";
import ProductoCard from "./ProductoCard";
import api from "../../utils/api";

const Carta = () => {
  const { productos, categoriaSeleccionada, cargarProductos } = useContext(ProductosContext);
  const [valoraciones, setValoraciones] = useState({});

  useEffect(() => {
    const cargarValoraciones = async () => {
      try {
        const { data } = await api.get("/valoraciones/valoraciones/mas-valorados"); // Obtener valoraciones con estrellas
        console.log(data);
        // Crear un objeto para mapear valoraciones a productos por su ID
        const valoracionesMapeadas = data.reduce((acc, { _id, estrellas }) => {
          acc[_id] = estrellas; // Guardar el promedio de estrellas por ID
          console.log("valoracionesMapeadas", acc);
          return acc;
        }, {});
        setValoraciones(valoracionesMapeadas);
      } catch (error) {
        console.error("Error al cargar valoraciones:", error);
      }
    };

    cargarProductos(); // Cargar productos desde el contexto
    cargarValoraciones(); // Cargar valoraciones desde el backend
  }, [cargarProductos]);

  // Filtrar productos por categoría seleccionada y estado habilitado
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
        <ProductoCard
          key={producto._id}
          producto={producto}
          estrellas={valoraciones[producto._id]} // Pasar directamente las estrellas promedio
        />
      ))}
    </div>
  );
};

export default Carta;
