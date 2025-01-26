import React, { useState } from "react";
import EstadisticasFinal from "./EstadisticasFinal";

const Products = ({ type, categories }) => {
  const [selectedCategory, setSelectedCategory] = useState(null);

  return (
    <div className="products">
      {!selectedCategory ? (
        <div className="categories">
          <h2>Categorías de {type}</h2>
          {categories.length === 0 ? (
            <p>Cargando categorías...</p>
          ) : (
            categories.map((category, index) => (
              <button key={index} onClick={() => setSelectedCategory(category)}>
                {category}
              </button>
            ))
          )}
        </div>
      ) : (
        <EstadisticasFinal category={selectedCategory} />
      )}
    </div>
  );
};

export default Products;
