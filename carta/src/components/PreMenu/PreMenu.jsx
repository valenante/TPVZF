import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../../utils/api";

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
    <div className="pre-menu">
      <h2>Configuración Inicial</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Nombre:
          <input
            type="text"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
          />
        </label>
        {errors.nombre && <p className="error">{errors.nombre}</p>}

        {esLider && (
          <>
            <label>
              Alergias (opcional):
              <textarea
                name="alergias"
                value={formData.alergias}
                onChange={handleChange}
              />
            </label>
            {errors.alergias && <p className="error">{errors.alergias}</p>}

            <label>
              Número de Comensales:
              <input
                type="number"
                name="comensales"
                value={formData.comensales}
                onChange={handleChange}
              />
            </label>
            {errors.comensales && <p className="error">{errors.comensales}</p>}
          </>
        )}

        <label>
          Contraseña del Día:
          <input
            type="password"
            name="contraseña"
            value={formData.contraseña}
            onChange={handleChange}
          />
        </label>
        {errors.contraseña && <p className="error">{errors.contraseña}</p>}

        <button type="submit" disabled={isLoading}>
          {isLoading ? "Procesando..." : "Continuar"}
        </button>
      </form>
    </div>
  );
};

export default PreMenu;
