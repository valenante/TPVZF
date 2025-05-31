import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { i18n } from "@lingui/core";  // Importa i18n
import { useComensal } from "../../context/ComensalesContext"; // Contexto para manejar comensales
import { LanguageContext } from "../../context/LanguageContext"; // Contexto para cambiar el idioma
import AlertaMensaje from "../../components/AlertaMensaje/AlertaMensaje"; // Componente para mostrar alertas
import api from "../../utils/api";
import './PreMenu.css'

const PreMenu = () => {
  const [formData, setFormData] = useState({
    alergias: "",
    comensales: "",
    contraseña: "",
    nombre: "",
  });
  const { setComensal } = useComensal();
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [esLider, setEsLider] = useState(false);
  const [mensajeAlerta, setMensajeAlerta] = useState(null);

  const { locale, cambiarIdioma } = useContext(LanguageContext); // Obtén el contexto de idioma
  const mesa = searchParams.get("mesa");

  useEffect(() => {
    const verificarTokenLider = async () => {
      try {
        const response = await api.get(`/mesas/token-lider/token-lider/check?mesa=${mesa}`);
        const tokenLider = response.data.tokenLider;
        setEsLider(!tokenLider); // Si no hay tokenLider, el usuario será el líder
      } catch (error) {
        console.error("Error al verificar el tokenLider:", error);
      setMensajeAlerta({ tipo: "error", mensaje: "No se pudo verificar la mesa" });
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
      if (
        key === "nombre" ||
        key === "contraseña" ||
        (esLider && (key === "alergias" || key === "comensales")) ||
        (!esLider && key === "alergias")
      ) {
        const error = validateField(key, formData[key]);
        if (error) {
          newErrors[key] = error;
        }
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post("/password/validate-password", {
        password: formData.contraseña, // 🛑 Verifica si `contraseña` está en español
      });

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

      await api.post("/mesas/comensal", {
        mesa,
        nombre: formData.nombre,
        alergias: formData.alergias,
        esLider,
        comensales: esLider ? parseInt(formData.comensales, 10) : null,
      });

      setComensal({
        nombre: formData.nombre,
        alergias: formData.alergias,
        esLider,
        comensales: esLider ? parseInt(formData.comensales, 10) : null,
      });

      // Guardar token en localStorage para indicar que se completó el preMenu
      localStorage.setItem("tokenPreMenu", "validated");
      localStorage.setItem("nombreComensal", formData.nombre);
      localStorage.setItem("alergiasComensal", formData.alergias);
      localStorage.setItem("comensales", formData.comensales);

      navigate(`/carta?mesa=${mesa}`);
    } catch (error) {
      console.error("❌ Error al procesar la solicitud:", error);
      setMensajeAlerta({ tipo: "error", mensaje: "Hubo un error al procesar la solicitud." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="preMenu-father">
      <div className="preMenu--container">
        <h2 className="titulo--preMenu">
          {i18n._("Configuración Inicial")}
        </h2>

        {/* Botones para cambiar idioma */}
        <div className="idiomas-preMenu">
          <button
            className={`btn-idioma ${locale === "es" ? "activo" : ""}`}
            onClick={() => cambiarIdioma("es")}
          >
            Español
          </button>
          <button
            className={`btn-idioma ${locale === "en" ? "activo" : ""}`}
            onClick={() => cambiarIdioma("en")}
          >
            English
          </button>
        </div>

        <form onSubmit={handleSubmit} className="formulario--preMenu">
          <input
            type="text"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            className="input--preMenu"
            placeholder={i18n._("Nombre")} // Usamos i18n._() para los placeholder
          />
          {errors.nombre && (
            <p className="error--preMenu">
              {errors.nombre}
            </p>
          )}

          <textarea
            name="alergias"
            value={formData.alergias}
            onChange={handleChange}
            className="input--preMenu"
            placeholder={i18n._("Alergias")}
            rows={2}
          />
          {errors.alergias && (
            <p className="error--preMenu">{errors.alergias}</p>
          )}

          {esLider && (
            <input
              type="number"
              name="comensales"
              value={formData.comensales}
              onChange={handleChange}
              className="input--preMenu"
              placeholder={i18n._("Número de comensales")}
            />
          )}

          <input
            type="password"
            name="contraseña"
            value={formData.contraseña}
            onChange={handleChange}
            className="input--preMenu"
            placeholder={i18n._("Contraseña")} // Usamos i18n._() para los placeholder
          />
          {errors.contraseña && (
            <p className="error--preMenu">
              {errors.contraseña}
            </p>
          )}

          <button type="submit" className="boton--preMenu" disabled={isLoading}>
            {isLoading ? (
              i18n._("Procesando...")
            ) : (
              i18n._("Continuar")
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PreMenu;
