import React, { createContext, useState, useCallback, useEffect } from 'react';
import api from '../utils/api';
import socket from '../utils/socket';

export const ProductosContext = createContext();

export const ProductosProvider = ({ children }) => {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('');
  const [carrito, setCarrito] = useState({ items: [] });
  const [mesaId, setMesaId] = useState(null);

  const cargarCarrito = useCallback(async () => {
    try {
      const cartId = localStorage.getItem('carritoMongoId');
      if (!cartId) {
        console.error('No se encontró el identificador del carrito.');
        return;
      }

      const { data } = await api.get(`/cart`, {
        headers: { 'X-Cart-ID': cartId },
      });
      setCarrito(data); // Si se encuentra el carrito, se guarda en el estado
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.warn('No se encontró un carrito. Inicializando vacío...');
        setCarrito({ items: [] });
      } else {
        console.error('Error al cargar el carrito:', error);
      }
    }
  }, []);

  useEffect(() => {
    // Escuchar el evento "carritoActualizado" para actualizar el carrito
    socket.on('carritoActualizado', ({ cartId, totalItems }) => {
      localStorage.setItem('carritoMongoId', cartId);
      cargarCarrito(cartId);
    });

    // Escuchar el evento "nuevoPedido" para actualizar el carrito
    socket.on('nuevoPedido', () => {
      console.log('Evento nuevoPedido recibido. Actualizando carrito...');
      cargarCarrito();
    });

    // Limpiar el listener cuando se desmonte el componente
    return () => {
      socket.off('nuevoPedido');
      socket.off('carritoActualizado');
    };
  }, [cargarCarrito]);

  const cargarProductos = useCallback(async () => {
    try {
      const { data } = await api.get('/productos');
      setProductos(data);

      const categoriasUnicas = [...new Set(data.map((producto) => producto.categoria))];
      setCategorias(categoriasUnicas);
    } catch (error) {
      console.error('Error al cargar productos:', error);
    }
  }, []);

  const obtenerMesaId = useCallback(async (numeroMesa) => {
    try {
      const { data } = await api.get(`/mesas?numero=${numeroMesa}`);
  
      if (data.length > 0) { // Verificar si el array tiene elementos
        const mesa = data[0]; // Acceder al primer elemento
        console.log(mesa._id, 'nashe');
        setMesaId(mesa._id);
        localStorage.setItem('mesaId', mesa._id); // Guardar el ID de la mesa en localStorage
        console.log(`Mesa ${numeroMesa} encontrada con ID: ${mesa._id}`);
      } else {
        console.warn(`No se encontró una mesa con el número ${numeroMesa}`);
      }
    } catch (error) {
      console.error(`Error al obtener el ID de la mesa ${numeroMesa}:`, error);
    }
  }, []);
  
  

  return (
    <ProductosContext.Provider
      value={{
        productos,
        categorias,
        categoriaSeleccionada,
        setCategoriaSeleccionada,
        cargarProductos,
        carrito,
        cargarCarrito,
        mesaId,
        obtenerMesaId,
      }}
    >
      {children}
    </ProductosContext.Provider>
  );
};
