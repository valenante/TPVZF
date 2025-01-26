import React, { useState, useEffect } from "react";
import { useCategorias } from "../../context/CategoriasContext";
import EditProduct from "./EditProducts";
import CrearProducto from "./CrearProducto"
import "./Categories.css";

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
    <div className="categories--categories">
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
        <p className="sin-productos--categories">No hay productos en esta categoría.</p>
      ) : (
        <div className="productos-grid--categories">
          {products.slice(0, 8).map((product) => (
            <div key={product._id} className="producto-card--categories">
              <p>{product.nombre}</p>
              <div className="producto-botones--categories">
                <button onClick={() => handleEdit(product)} className="boton-editar--categories">
                  Editar
                </button>
                <button
                  onClick={() => handleDeleteProduct(product._id)}
                  className="boton-eliminar--categories"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  )}

  <button
    onClick={() => setMostrarFormulario(true)}
    className="boton-crear--categories"
  >
    Crear Producto
  </button>

  {mostrarFormulario && (
    <>
      <div className="crear-producto-overlay--crear" onClick={() => setMostrarFormulario(false)}></div>
      <CrearProducto onClose={() => setMostrarFormulario(false)} />
    </>
  )}
</div>

  );
};  

export default Categories;
