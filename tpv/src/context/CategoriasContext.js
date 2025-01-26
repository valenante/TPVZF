import React, { createContext, useState, useContext } from "react";
import api from "../utils/api";

export const CategoriasContext = createContext();

export const CategoriasProvider = ({ children }) => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);

  const fetchCategories = async (type) => {
    if (!type) {
      console.error("Tipo inválido:", type);
      return;
    }
  
    try {
      const response = await api.get(`/productos/categories/${type}`);
      setCategories((prevCategories) => {
        // Si las categorías ya coinciden, no hagas nada
        const newCategories = response.data.categories;
        if (JSON.stringify(prevCategories) !== JSON.stringify(newCategories)) {
          return newCategories;
        }
        return prevCategories; // Mantén las categorías actuales
      });
    } catch (error) {
      console.error("Error al obtener categorías:", error);
    }
  };
  

  const fetchProducts = async (category) => {
    if (!category) {
      console.error("Categoría inválida:", category);
      return;
    }
  
    try {
      setProducts((prevProducts) => {
        // Verifica si ya existen productos para la categoría
        if (prevProducts.some((product) => product.categoria === category)) {
          console.log(`Productos ya cargados para la categoría ${category}`);
          return prevProducts; // Evita recargar productos
        }
        return prevProducts;
      });
  
      // Si no están cargados, realiza la solicitud
      const response = await api.get(`/productos/category/${encodeURIComponent(category)}`);
      setProducts(response.data.products);
    } catch (error) {
      console.error("Error al obtener productos:", error);
    }
  };
  
  const updateProduct = async (product) => {
    try {
      await api.put(`/productos/${product._id}`, product);
      setProducts((prev) =>
        prev.map((p) => (p._id === product._id ? product : p))
      );
    } catch (error) {
      console.error("Error al actualizar producto:", error);
      throw error;
    }
  };

  const deleteProduct = async (id) => {
    try {
      await api.delete(`/productos/${id}`);
      setProducts((prev) => prev.filter((product) => product._id !== id));
    } catch (error) {
      console.error("Error al eliminar producto:", error);
      throw error;
    }
  };

  return (
    <CategoriasContext.Provider
      value={{
        categories,
        fetchCategories,
        products,
        fetchProducts,
        updateProduct,
        deleteProduct,
      }}
    >
      {children}
    </CategoriasContext.Provider>
  );
};

export const useCategorias = () => {
  return useContext(CategoriasContext);
};
