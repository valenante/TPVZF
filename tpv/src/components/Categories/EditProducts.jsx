import React, { useState } from "react";
import "./EditProducts.css";

const EditProduct = ({ product, onSave, onCancel, onDelete }) => {
  const [formData, setFormData] = useState({ ...product });
  const [errors, setErrors] = useState({});

  const validateField = (name, value) => {
    let error = "";
    switch (name) {
      case "nombre":
        if (!value.trim()) error = "El nombre es obligatorio.";
        else if (value.length < 3) error = "El nombre debe tener al menos 3 caracteres.";
        break;
      case "descripcion":
        if (!value.trim()) error = "La descripción es obligatoria.";
        else if (value.length < 10) error = "La descripción debe tener al menos 10 caracteres.";
        break;
      case "categoria":
        if (!value.trim()) error = "La categoría es obligatoria.";
        break;
      case "tipo":
        if (!value.trim()) error = "El tipo es obligatorio.";
        break;
      case "precios.tapa":
      case "precios.racion":
        if (value && value <= 0) error = "El precio debe ser mayor a 0 si está definido.";
        break;
      default:
        break;
    }
    return error;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        [name]: checked ? "habilitado" : "deshabilitado",
      }));
    } else if (name.startsWith("precios.")) {
      const key = name.split(".")[1];
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

    setErrors((prev) => ({
      ...prev,
      [name]: validateField(name, value),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newErrors = {};
    for (const key in formData) {
      if (key === "precios") {
        for (const priceKey in formData.precios) {
          const error = validateField(`precios.${priceKey}`, formData.precios[priceKey]);
          if (error) newErrors[`precios.${priceKey}`] = error;
        }
      } else {
        const error = validateField(key, formData[key]);
        if (error) newErrors[key] = error;
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave(formData); // Llama a la función onSave con los datos válidos
  };

  const handleDelete = () => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este producto?")) {
      onDelete(product._id); // Llama a la función onDelete con el ID del producto
    }
  };

  const hasErrors = Object.values(errors).some((error) => error);

  return (
    <div className="edit-product--editar">
      <form onSubmit={handleSubmit} className="form--editar" noValidate>
        {/* Nombre */}
        <label className="label--editar">
          Nombre:
          <input
            type="text"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            className="input--editar"
          />
        </label>
        {errors.nombre && <p className="error--editar">{errors.nombre}</p>}
  
        {/* Descripción */}
        <label className="label--editar">
          Descripción:
          <textarea
            name="descripcion"
            value={formData.descripcion}
            onChange={handleChange}
            className="textarea--editar"
          />
        </label>
        {errors.descripcion && <p className="error--editar">{errors.descripcion}</p>}
  
        {/* Categoría */}
        <label className="label--editar">
          Categoría:
          <input
            type="text"
            name="categoria"
            value={formData.categoria}
            onChange={handleChange}
            className="input--editar"
          />
        </label>
        {errors.categoria && <p className="error--editar">{errors.categoria}</p>}
  
        {/* Tipo */}
        <label className="label--editar">
          Tipo:
          <input
            type="text"
            name="tipo"
            value={formData.tipo}
            onChange={handleChange}
            className="input--editar"
          />
        </label>
        {errors.tipo && <p className="error--editar">{errors.tipo}</p>}
  
        {/* Precios */}
        <fieldset className="fieldset--editar">
          <legend className="legend--editar">Precios</legend>
          <label className="label--editar">
            Precio Base:
            <input
              type="number"
              name="precios.precioBase"
              value={formData.precios.precioBase || ""}
              onChange={handleChange}
              className="input--editar"
            />
          </label>
          {errors["precios.precioBase"] && (
            <p className="error--editar">{errors["precios.precioBase"]}</p>
          )}
  
          <label className="label--editar">
            Precio Tapa:
            <input
              type="number"
              name="precios.tapa"
              value={formData.precios.tapa || ""}
              onChange={handleChange}
              className="input--editar"
            />
          </label>
          {errors["precios.tapa"] && (
            <p className="error--editar">{errors["precios.tapa"]}</p>
          )}
  
          <label className="label--editar">
            Precio Ración:
            <input
              type="number"
              name="precios.racion"
              value={formData.precios.racion || ""}
              onChange={handleChange}
              className="input--editar"
            />
          </label>
          {errors["precios.racion"] && (
            <p className="error--editar">{errors["precios.racion"]}</p>
          )}
        </fieldset>
  
        {/* Estado */}
        <label className="label--editar estado--editar">
          <input
            type="checkbox"
            name="estado"
            checked={formData.estado === "habilitado"}
            onChange={handleChange}
            className="checkbox--editar"
          />
          Habilitado
        </label>
  
        {/* Botones */}
        <div className="botones--editar">
          <button type="submit" disabled={hasErrors} className="boton--editar">
            Guardar
          </button>
          <button type="button" onClick={onCancel} className="boton--editar">
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="delete-button--editar"
          >
            Eliminar
          </button>
        </div>
      </form>
    </div>
  );
};  

export default EditProduct;
