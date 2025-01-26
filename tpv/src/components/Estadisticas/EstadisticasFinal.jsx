import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useCategorias } from "../../context/CategoriasContext";
import api from "../../utils/api";

const EstadisticasFinal = ({ category }) => {
  const { products, fetchProducts } = useCategorias();
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [ventasDetalles, setVentasDetalles] = useState({}); // Almacenará los detalles de ventas
  const [estadisticas, setEstadisticas] = useState({}); // Acumuladores por producto
  const [selectedDate, setSelectedDate] = useState(null); // Fecha seleccionada para el filtro

  useEffect(() => {
    const cargarProductosYVentas = async () => {
      if (products.length === 0) {
        await fetchProducts(category);
      }

      const productosFiltrados = products.filter(
        (product) => product.categoria === category
      );
      setFilteredProducts(productosFiltrados);

      // Obtener detalles de ventas para cada producto y calcular estadísticas
      const detallesVentas = {};
      const acumuladores = {};

      for (const product of productosFiltrados) {
        const ventasDetalles = await Promise.all(
          product.ventas.map(async (ventaId) => {
            try {
              const response = await api.get(`/ventas/${ventaId}`);
              return response.data; // Datos de la venta
            } catch (error) {
              console.error(`Error al obtener la venta ${ventaId}:`, error);
              return null; // Maneja errores para ventas individuales
            }
          })
        );

        const ventasFiltradas = ventasDetalles.filter((venta) => {
          if (!venta) return false;
          if (!selectedDate) return true; // Si no hay fecha seleccionada, incluir todas las ventas
          const ventaFecha = new Date(venta.fecha);
          return (
            ventaFecha.toDateString() === selectedDate.toDateString() // Comparar fechas
          );
        });

        detallesVentas[product._id] = ventasFiltradas;

        // Calcular estadísticas
        const totalCantidad = ventasFiltradas.reduce(
          (acumulado, venta) => acumulado + venta.cantidad,
          0
        );
        const totalIngresos = ventasFiltradas.reduce(
          (acumulado, venta) => acumulado + venta.total,
          0
        );

        acumuladores[product._id] = {
          totalCantidad,
          totalIngresos,
        };
      }

      setVentasDetalles(detallesVentas);
      setEstadisticas(acumuladores);
    };

    cargarProductosYVentas();
  }, [category, products, fetchProducts, selectedDate]);

  return (
    <div className="estadisticas-final">
      <h2>Estadísticas de la categoría: {category}</h2>

      {/* Selector de fecha */}
      <div className="filtro-fecha">
        <h4>Filtrar por fecha:</h4>
        <DatePicker
          selected={selectedDate}
          onChange={(date) => setSelectedDate(date)}
          dateFormat="yyyy-MM-dd"
          isClearable
          placeholderText="Selecciona una fecha"
        />
      </div>

      {filteredProducts.length === 0 ? (
        <p>Cargando productos...</p>
      ) : (
        <ul>
          {filteredProducts.map((product) => (
            <li key={product._id}>
              <strong>Producto:</strong> {product.nombre} <br />
              <strong>Total Vendido:</strong>{" "}
              {estadisticas[product._id]?.totalCantidad || 0} unidades <br />
              <strong>Total Ingresos:</strong>{" "}
              {estadisticas[product._id]?.totalIngresos?.toFixed(2) || 0} € <br />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default EstadisticasFinal;
