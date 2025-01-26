import React, { useState, useContext, useEffect } from "react";
import Products from "../components/Products/Products";
import { CategoriasContext } from "../context/CategoriasContext";

const ProductsPage = () => {
  const [selectedType, setSelectedType] = useState(null);
  const { categories, fetchCategories } = useContext(CategoriasContext);

  useEffect(() => {
    if (selectedType) {
      fetchCategories(selectedType); // Llama solo cuando `selectedType` cambia
    }
  }, [selectedType, fetchCategories]);

  const handleTypeSelection = (type) => {
    setSelectedType(type);
  };

  return (
    <div className="products-page">
      {!selectedType ? (
        <div className="buttons">
          <h1>Selecciona un tipo de producto:</h1>
          <button onClick={() => handleTypeSelection("bebida")}>Bebidas</button>
          <button onClick={() => handleTypeSelection("plato")}>Platos</button>
        </div>
      ) : (
        <Products type={selectedType} categories={categories} />
      )}
    </div>
  );
};

export default ProductsPage;
