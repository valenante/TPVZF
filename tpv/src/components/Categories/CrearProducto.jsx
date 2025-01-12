import React, { useState, useContext } from 'react';
import { ProductosContext } from '../../context/ProductosContext';
import api from '../../utils/api';

const CrearProducto = ({ onClose }) => {
  const { cargarProductos } = useContext(ProductosContext);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    categoria: '',
    tipo: '',
    precios: { precioBase: 0, tapa: null, racion: null },
    stock: 0,
    img: '',
    estado: 'habilitado', // Por defecto habilitado
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith('precios.')) {
      const key = name.split('.')[1];
      setFormData((prev) => ({
        ...prev,
        precios: {
          ...prev.precios,
          [key]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(formData); // Verificar los datos que se envían
  
    try {
      // Realizar la solicitud POST con Axios
      const response = await api.post('/productos', formData);
  
      if (response.status === 201) { // Verificar el código de estado
        console.log('Producto creado:', response.data);
        cargarProductos(); // Actualizar la lista de productos
        onClose(); // Cerrar el formulario
      } else {
        console.error('Error al crear el producto:', response.data);
      }
    } catch (error) {
      console.error('Error al crear el producto:', error.response?.data || error.message);
    }
  };
  

  return (
    <div className="crear-producto-modal">
      <h2>Crear Nuevo Producto</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Nombre:
          <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} required />
        </label>
        <label>
          Descripción:
          <textarea name="descripcion" value={formData.descripcion} onChange={handleChange} required />
        </label>
        <label>
          Categoría:
          <input type="text" name="categoria" value={formData.categoria} onChange={handleChange} required />
        </label>
        <label>
          Tipo:
          <input type="text" name="tipo" value={formData.tipo} onChange={handleChange} required />
        </label>
        <fieldset>
          <legend>Precios</legend>
          <label>
            Precio Base:
            <input
              type="number"
              name="precios.precioBase"
              value={formData.precios.precioBase}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Precio Tapa:
            <input
              type="number"
              name="precios.tapa"
              value={formData.precios.tapa || ''}
              onChange={handleChange}
            />
          </label>
          <label>
            Precio Ración:
            <input
              type="number"
              name="precios.racion"
              value={formData.precios.racion || ''}
              onChange={handleChange}
            />
          </label>
        </fieldset>
        <label>
          Stock:
          <input type="number" name="stock" value={formData.stock} onChange={handleChange} required />
        </label>
        <label>
          Imagen URL:
          <input type="text" name="img" value={formData.img} onChange={handleChange} required />
        </label>
        <button type="submit">Guardar</button>
        <button type="button" onClick={onClose}>
          Cancelar
        </button>
      </form>
    </div>
  );
};

export default CrearProducto;