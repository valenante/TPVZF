import React, { useState, useContext } from 'react';
import { ProductosContext } from '../../context/ProductosContext';
import api from '../../utils/api';
import './CrearProducto.css';

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
    <div className="crear-producto-modal--crear">
      <form onSubmit={handleSubmit} className="form--crear">
        <div className="form-group--crear">
          <label className="label--crear">
            Nombre:
            <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} className="input--crear" required />
          </label>
          <label className="label--crear">
            Descripción:
            <textarea name="descripcion" value={formData.descripcion} onChange={handleChange} className="textarea--crear" required />
          </label>
        </div>

        <div className="form-group--crear">
          <label className="label--crear">
            Categoría:
            <input type="text" name="categoria" value={formData.categoria} onChange={handleChange} className="input--crear" required />
          </label>
          <label className="label--crear">
            Tipo:
            <input type="text" name="tipo" value={formData.tipo} onChange={handleChange} className="input--crear" required />
          </label>
        </div>

        <fieldset className="fieldset--crear">
          <legend className="legend--crear">Precios</legend>
          <div className="form-group--crear">
            <label className="label--crear">
              Precio Base:
              <input
                type="number"
                name="precios.precioBase"
                value={formData.precios.precioBase}
                onChange={handleChange}
                className="input--crear"
                required
              />
            </label>
            <label className="label--crear">
              Precio Tapa:
              <input
                type="number"
                name="precios.tapa"
                value={formData.precios.tapa || ''}
                onChange={handleChange}
                className="input--crear"
              />
            </label>
            <label className="label--crear">
              Precio Ración:
              <input
                type="number"
                name="precios.racion"
                value={formData.precios.racion || ''}
                onChange={handleChange}
                className="input--crear"
              />
            </label>
          </div>
        </fieldset>

        <div className="form-group--crear">
          <label className="label--crear">
            Stock:
            <input type="number" name="stock" value={formData.stock} onChange={handleChange} className="input--crear" required />
          </label>
          <label className="label--crear">
            Imagen URL:
            <input type="text" name="img" value={formData.img} onChange={handleChange} className="input--crear" required />
          </label>
        </div>

        <div className="botones--crear">
          <button type="submit" className="boton--crear">Guardar</button>
          <button type="button" onClick={onClose} className="boton--crear">Cancelar</button>
        </div>
      </form>
    </div>
  );
};

export default CrearProducto;