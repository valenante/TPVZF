import React, { useState, useContext } from "react";
import { CategoriasContext } from "../context/CategoriasContext";
import Products from "../components/Estadisticas/Products";

const EstadisticasPage = () => {
  const [selectedType, setSelectedType] = useState(null);
  const { categories, fetchCategories } = useContext(CategoriasContext);

  const handleTypeSelection = (type) => {
    setSelectedType(type);
    fetchCategories(type); // Llamamos a la función del contexto
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

export default EstadisticasPage;
