import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../../utils/api";
import './PreMenu.css'

const PreMenu = () => {
  const [formData, setFormData] = useState({
    alergias: "",
    comensales: "",
    contraseña: "",
    nombre: "",
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [esLider, setEsLider] = useState(false);

  const mesa = searchParams.get("mesa");

  useEffect(() => {
    const verificarTokenLider = async () => {
      try {
        const response = await api.get(`/mesas/token-lider/token-lider/check?mesa=${mesa}`);
        const tokenLider = response.data.tokenLider;

        setEsLider(!tokenLider); // Si no hay tokenLider, el usuario será el líder
      } catch (error) {
        console.error("Error al verificar el tokenLider:", error);
        alert("No se pudo verificar la mesa.");
        navigate("/");
      }
    };
  
    verificarTokenLider();
  }, [mesa, navigate]);

  const validateField = (name, value) => {
    let error = "";

    switch (name) {
      case "alergias":
        if (value && !/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s,]*$/.test(value)) {
          error = "Las alergias solo pueden contener letras, espacios y comas.";
        }
        break;
      case "comensales":
        if (!value) error = "El número de comensales es obligatorio.";
        else if (isNaN(value) || value < 1 || value > 20) {
          error = "Debe ser un número entre 1 y 20.";
        }
        break;
      case "contraseña":
        if (!value.trim()) error = "La contraseña es obligatoria.";
        break;
      case "nombre":
        if (!value.trim()) error = "El nombre es obligatorio.";
        else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/.test(value)) {
          error = "El nombre solo puede contener letras y espacios.";
        }
        break;
      default:
        break;
    }

    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: validateField(name, value),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const newErrors = {};
    for (const key in formData) {
      if (esLider || key === "contraseña" || key === "nombre") {
        const error = validateField(key, formData[key]);
        if (error) newErrors[key] = error;
      }
    }
  
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
  
    setIsLoading(true);
    try {
      const response = await api.post("/password/validate-password", { password: formData.contraseña });
      if (!response.data.valid) {
        setErrors((prev) => ({
          ...prev,
          contraseña: "La contraseña es incorrecta.",
        }));
        setIsLoading(false);
        return;
      }
  
      if (esLider) {
        // Crear el tokenLider en la base de datos
        const tokenLiderResponse = await api.post(`/mesas/token-lider/token-lider`, { mesa });
        localStorage.setItem("tokenLider", tokenLiderResponse.data.tokenLider);
      }
  
      // Guardar token en localStorage para indicar que se completó el preMenu
      localStorage.setItem("tokenPreMenu", "validated");
  
      // Redirigir con los parámetros en la URL
      const searchParams = new URLSearchParams({
        ...(esLider ? { alergias: formData.alergias, comensales: formData.comensales } : {}),
        nombre: formData.nombre,
      }).toString();
  
      navigate(`/${mesa}?${searchParams}`);
    } catch (error) {
      console.error("Error al procesar la solicitud:", error);
      alert("Hubo un error al procesar tu solicitud. Intenta nuevamente.");
    } finally {
      setIsLoading(false);
    }
  };  

  return (
    <div className="preMenu-father">
    <div className="preMenu--container">
      <h2 className="titulo--preMenu">Configuración Inicial</h2>
      <form onSubmit={handleSubmit} className="formulario--preMenu">
          <input
            type="text"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            className="input--preMenu"
            placeholder="Nombre"
          />
        {errors.nombre && <p className="error--preMenu">{errors.nombre}</p>}
  
        {esLider && (
          <>
              <textarea
                name="alergias"
                value={formData.alergias}
                onChange={handleChange}
                className="input--preMenu"
                placeholder="Alergias"
              />
            {errors.alergias && <p className="error--preMenu">{errors.alergias}</p>}
  
              <input
                type="number"
                name="comensales"
                value={formData.comensales}
                onChange={handleChange}
                className="input--preMenu"
                placeholder="Comensales"
              />
            {errors.comensales && (
              <p className="error--preMenu">{errors.comensales}</p>
            )}
          </>
        )}
  
          <input
            type="password"
            name="contraseña"
            value={formData.contraseña}
            onChange={handleChange}
            className="input--preMenu"
            placeholder="Contraseña"
          />
        {errors.contraseña && (
          <p className="error--preMenu">{errors.contraseña}</p>
        )}
  
        <button type="submit" className="boton--preMenu" disabled={isLoading}>
          {isLoading ? "Procesando..." : "Continuar"}
        </button>
      </form>
    </div>
    </div>
  );  
};

export default PreMenu;
