import React, { createContext, useState, useCallback, useEffect } from 'react';
import api from '../utils/api';
import { useSearchParams } from 'react-router-dom';
import socket from '../utils/socket';

export const ProductosContext = createContext();

export const ProductosProvider = ({ children }) => {
  const [searchParams] = useSearchParams();
  const numeroMesa = searchParams.get("mesa");
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('');
  const [carrito, setCarrito] = useState({ items: [] });
  const [mesaId, setMesaId] = useState(null);

  const cargarCarrito = useCallback(async () => {
    try {
      const { data } = await api.get(`/cart?numeroMesa=${numeroMesa}`); // ✅ Enviar número de mesa
      setCarrito(data); 
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.warn(`No se encontró un carrito para la mesa ${numeroMesa}. Inicializando vacío...`);
        setCarrito({ items: [] });
      } else {
        console.error('Error al cargar el carrito:', error);
      }
    }
  }, [numeroMesa]);

  useEffect(() => {
    // Escuchar el evento "carritoActualizado" para actualizar el carrito
    socket.on('carritoActualizado', ({ cartId, totalItems }) => {
      localStorage.setItem('carritoMongoId', cartId);
      cargarCarrito(cartId);
    });

    // Escuchar el evento "nuevoPedido" para actualizar el carrito
    socket.on('nuevoPedido', () => {
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
        // Si numeroMesa no es un número válido, mostramos un warning y detenemos la ejecución
        if (!numeroMesa || isNaN(numeroMesa)) {
            console.warn(`⚠️ El valor de numeroMesa es inválido: ${numeroMesa}`);
            return;
        }

        // Petición a la API
        const { data } = await api.get(`/mesas`);

        // Filtramos la mesa que coincide con el numeroMesa
        const mesa = data.find(mesa => Number(mesa.numero) === Number(numeroMesa));

        if (mesa) {
            setMesaId(mesa._id);
        } else {
            console.warn(`⚠️ No se encontró una mesa con el número ${numeroMesa}`);
        }
    } catch (error) {
        console.error(`❌ Error al obtener el ID de la mesa ${numeroMesa}:`, error);
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
        numeroMesa,
      }}
    >
      {children}
    </ProductosContext.Provider>
  );
};
