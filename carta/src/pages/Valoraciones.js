import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DOMPurify from "dompurify"; // Para sanitizar entradas de texto
import api from "../utils/api"; // Configuración de Axios
import "../styles/Valoraciones.css"; // Archivo de estilos

const Valoraciones = () => {
  const [productos, setProductos] = useState([]);
  const [valoraciones, setValoraciones] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Cargar productos desde el backend
    const cargarProductos = async () => {
      try {
        const mesaId = localStorage.getItem("mesaId"); // Obtener mesaId desde localStorage
        if (!mesaId) {
          navigate("/"); // Si no hay mesaId, redirigir fuera de la web
          return;
        }

        const { data } = await api.get("/valoraciones/productos-valoraciones", {
          params: { mesaId },
        });

        // Eliminar productos duplicados basados en su ID
        const productosUnicos = [
          ...new Map(data.map((producto) => [producto.productoId._id, producto])).values(),
        ];

        setProductos(productosUnicos);

        // Configurar valoraciones iniciales
        setValoraciones(
          productosUnicos.map((producto) => ({
            productoId: producto.productoId._id,
            estrellas: 0,
            comentario: "",
          }))
        );
      } catch (err) {
        console.error("Error al cargar productos:", err);
        setError("No se pudieron cargar los productos.");
      }
    };

    cargarProductos();
  }, [navigate]);

  // Manejar cambio de estrellas
  const manejarEstrellas = (productoId, estrellas) => {
    setValoraciones((prev) =>
      prev.map((valoracion) =>
        valoracion.productoId === productoId ? { ...valoracion, estrellas } : valoracion
      )
    );
  };

  // Manejar comentario
  const manejarComentario = (productoId, comentario) => {
    const comentarioSanitizado = DOMPurify.sanitize(comentario);

    if (comentarioSanitizado.length > 80) {
      alert("El comentario no puede exceder los 80 caracteres.");
      return;
    }

    setValoraciones((prev) =>
      prev.map((valoracion) =>
        valoracion.productoId === productoId
          ? { ...valoracion, comentario: comentarioSanitizado }
          : valoracion
      )
    );
  };

  // Enviar valoraciones
  const enviarValoraciones = async () => {
    try {
      const mesaId = localStorage.getItem("mesaId");
      const valoracionesAEnviar = valoraciones.map((valoracion) => ({
        producto: valoracion.productoId,
        puntuacion: valoracion.estrellas,
        comentario: valoracion.comentario,
      }));

      await api.post("/valoraciones", valoracionesAEnviar, { params: { mesaId } });

      alert("¡Gracias por tu valoración!");
      localStorage.clear();
      navigate("/");
    } catch (error) {
      console.error("Error al enviar las valoraciones:", error);
      alert("Hubo un problema al enviar las valoraciones. Intenta nuevamente.");
    }
  };

  if (error) {
    return <div className="error-mensaje-valoraciones">{error}</div>;
  }

  return (
    <div className="contenedor-valoraciones">
      <h1 className="titulo-valoraciones">Valora tu Experiencia</h1>
      {productos.length === 0 ? (
        <p className="mensaje-sin-productos-valoraciones">No hay productos para valorar.</p>
      ) : (
        <form className="formulario-valoraciones">
          {productos.map((producto) => (
            <div key={producto.productoId._id} className="producto-valoraciones">
              <h3 className="producto-nombre-valoraciones">{producto.nombre}</h3>
              <label className="etiqueta-valoraciones">Estrellas:</label>
              <select
                value={valoraciones.find((v) => v.productoId === producto.productoId._id)?.estrellas || 0}
                onChange={(e) =>
                  manejarEstrellas(producto.productoId._id, parseFloat(e.target.value)) // Convertir siempre a número decimal
                }
                className="select-valoraciones"
              >
                <option value={5}>5 estrellas</option>
                {[1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5].map((estrella) => (
                  <option key={estrella} value={estrella}>
                    {estrella} estrella{estrella > 1 ? "s" : ""}
                  </option>
                ))}
              </select>
              <label className="etiqueta-valoraciones">Comentario:</label>
              <textarea
                value={
                  valoraciones.find((v) => v.productoId === producto.productoId._id)?.comentario || ""
                }
                onChange={(e) => manejarComentario(producto.productoId._id, e.target.value)}
                maxLength={80}
                placeholder="Escribe tu comentario (máximo 80 caracteres)"
                rows="4"
                cols="50"
                className="textarea-valoraciones"
              />
            </div>
          ))}
          <button type="button" onClick={enviarValoraciones} className="boton-enviar-valoraciones">
            Enviar Valoraciones
          </button>
        </form>
      )}
    </div>
  );
};

export default Valoraciones;
