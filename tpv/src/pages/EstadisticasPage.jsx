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
    <div className="estadisticas-page">
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

export default EstadisticasPage;
