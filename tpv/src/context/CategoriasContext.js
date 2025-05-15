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
      return [];
    }

    try {
      const response = await api.get(`/productos/category/${encodeURIComponent(category)}`);
      const loadedProducts = response.data.products || [];
      setProducts(loadedProducts);
      return loadedProducts;  // ✅ Devuelve los productos
    } catch (error) {
      console.error("Error al obtener productos:", error);
      return [];
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
