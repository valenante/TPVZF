import React, { useState, useEffect } from "react";
import Products from "../components/Products/Products";
import api from '../utils/api'; // Configuración de Axios

const ProductsPage = () => {
  const [selectedType, setSelectedType] = useState(null);
  const [categories, setCategories] = useState([]);

  const fetchCategories = async (type) => {
    try {
      const response = await api.get(`/productos/categories/${type}`);
      console.log("Categorías recibidas en el frontend:", response.data.categories);
      setCategories(response.data.categories); // Usa los datos directamente
    } catch (error) {
      console.error("Error al obtener categorías:", error);
    }
  };  
  // Cuando el usuario selecciona un tipo, obtenemos las categorías
  useEffect(() => {
    if (selectedType) {
      fetchCategories(selectedType);
    }
  }, [selectedType]);

  return (
    <div className="products-page">
      {!selectedType ? (
        <div className="buttons">
          <h1>Selecciona un tipo de producto:</h1>
          <button onClick={() => setSelectedType("bebida")}>Bebidas</button>
          <button onClick={() => setSelectedType("plato")}>Platos</button>
        </div>
      ) : (
        <Products type={selectedType} categories={categories} />
      )}
    </div>
  );
};

export default ProductsPage;
