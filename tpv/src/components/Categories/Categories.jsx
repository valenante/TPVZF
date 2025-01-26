import React, { useState, useEffect } from "react";
import { useCategorias } from "../../context/CategoriasContext";
import EditProduct from "./EditProducts";
import CrearProducto from "./CrearProducto";

const Categories = ({ category }) => {
  const [editingProduct, setEditingProduct] = useState(null); // Producto en edición
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  const { products, fetchProducts, updateProduct, deleteProduct } = useCategorias();

  useEffect(() => {
    // Evita hacer solicitudes si no hay una categoría válida
    if (category) {
      fetchProducts(category); // Cargar productos desde el contexto
    }
  }, [category]); // Llama a fetchProducts solo cuando la categoría cambia

  const handleEdit = (product) => {
    setEditingProduct(product); // Selecciona el producto para editar
  };

  const handleSave = async (updatedProduct) => {
    try {
      await updateProduct(updatedProduct); // Usa el método del contexto
      setEditingProduct(null); // Cierra el editor
    } catch (error) {
      console.error("Error al guardar producto:", error);
    }
  };

  const handleDeleteProduct = async (id) => {
    try {
      await deleteProduct(id); // Usa el método del contexto
      await fetchProducts(category); // Refresca los productos después de eliminar
      alert("Producto eliminado con éxito.");
    } catch (error) {
      console.error("Error al eliminar producto:", error);
    }
  };

  const handleCancel = () => {
    setEditingProduct(null); // Cancela la edición
  };

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
            <p>No hay productos en esta categoría.</p>
          ) : (
            <ul>
              {products.map((product) => (
                <li key={product._id}>
                  {product.nombre} - {product.descripcion}
                  <button onClick={() => handleEdit(product)}>Editar</button>
                  <button onClick={() => handleDeleteProduct(product._id)}>Eliminar</button>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
      <button onClick={() => setMostrarFormulario(true)}>Crear Producto</button>
      {mostrarFormulario && (
        <CrearProducto onClose={() => setMostrarFormulario(false)} />
      )}
    </div>
  );
};

export default Categories;
