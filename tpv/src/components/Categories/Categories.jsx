import React, { useState, useEffect } from "react";
import api from "../../utils/api";
import EditProduct from "./EditProducts";
import CrearProducto from "./CrearProducto";

const Categories = ({ category }) => {
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null); // Producto en edición
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  const fetchProducts = async (category) => {
    if (!category) {
      console.error("Categoría inválida:", category);
      return;
    }

    try {
      const response = await api.get(`/productos/category/${encodeURIComponent(category)}`);
      setProducts(response.data.products);
    } catch (error) {
      console.error("Error al obtener productos:", error);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product); // Selecciona el producto para editar
  };

  const handleSave = async (updatedProduct) => {
    try {
      await api.put(`/productos/${updatedProduct._id}`, updatedProduct); // Actualiza en el backend
      setProducts((prev) =>
        prev.map((prod) =>
          prod._id === updatedProduct._id ? updatedProduct : prod
        )
      );
      setEditingProduct(null); // Cierra el editor
    } catch (error) {
      console.error("Error al guardar producto:", error);
    }
  };

  const handleDeleteProduct = async (id) => {
    try {
      await api.delete(`/productos/${id}`);
      fetchProducts(); // Refresca la lista de productos
      alert("Producto eliminado con éxito.");
    } catch (error) {
      console.error("Error al eliminar producto:", error.response?.data || error.message);
    }
  };
  

  const handleCancel = () => {
    setEditingProduct(null); // Cancela la edición
  };

  useEffect(() => {
    fetchProducts(category);
  }, [category]);

  return (
    <div className="categories">
      <h2>Productos en la categoría: {category}</h2>
      {editingProduct ? (
        <EditProduct
          product={editingProduct}
          onSave={handleSave}
          onCancel={handleCancel}
          onDelete={handleDeleteProduct}
        />
      ) : (
        <>
          {products.length === 0 ? (
            <p>Cargando productos...</p>
          ) : (
            <ul>
              {products.map((product) => (
                <li key={product._id}>
                  {product.nombre} - {product.descripcion}
                  <button onClick={() => handleEdit(product)}>Editar</button>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
      <CrearProducto onClose={() => setMostrarFormulario(false)}/>

    </div>
  );
};

export default Categories;
