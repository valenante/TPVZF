import React, { useState } from "react";
import Categories from "../Categories/Categories";
import "./Products.css";

const Products = ({ type, categories }) => {
  const [selectedCategory, setSelectedCategory] = useState(null);

  return (
    <div className="products--products">
      {!selectedCategory ? (
        <div className="categories--products">
          {categories.length === 0 ? (
            <p className="cargando-categorias--products">Cargando categorías...</p>
          ) : (
            <div className="buttons--products">
              {categories.map((category, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedCategory(category)}
                  className="button--products"
                >
                  {category}
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <Categories category={selectedCategory} />
      )}
    </div>
  );
};

export default Products;
