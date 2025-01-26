import React, { useState, useContext, useEffect } from "react";
import Products from "../components/Products/Products";
import { CategoriasContext } from "../context/CategoriasContext";
import "../styles/ProductsMenu.css";

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
      <div className="products-page--productos">
        {!selectedType ? (
          <div className="buttons--productos">
            <button onClick={() => handleTypeSelection("bebida")} className="button--productos">
              Bebidas
            </button>
            <button onClick={() => handleTypeSelection("plato")} className="button--productos">
              Platos
            </button>
          </div>
        ) : (
          <Products type={selectedType} categories={categories} />
        )}
      </div>    
  );
};

export default ProductsPage;
