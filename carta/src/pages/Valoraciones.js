import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Trans } from "@lingui/react";
import DOMPurify from "dompurify"; // Para sanitizar entradas de texto
import api from "../utils/api"; // Configuración de Axios
import { useMesas } from "../context/MesasContext"; // ✅ Importar el hook useMesas
import "../styles/Valoraciones.css"; // Archivo de estilos

const Valoraciones = () => {
  const [productos, setProductos] = useState([]);
  const { mesaId } = useMesas(); // ✅ Acceder al ID de la mesa con useMesas
  const [valoraciones, setValoraciones] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  console.log(mesaId)

  useEffect(() => {
    // Cargar productos desde el backend
    const cargarProductos = async () => {
      try {

        const { data } = await api.get("/valoraciones/productos-valoraciones/productos-valoraciones", {
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
      const valoracionesAEnviar = valoraciones.map((valoracion) => ({
        producto: valoracion.productoId,
        puntuacion: valoracion.estrellas,
        comentario: valoracion.comentario,
      }));

      console.log('hola', valoracionesAEnviar, mesaId)

      await api.post(`/valoraciones?mesaId=${mesaId}`, valoracionesAEnviar);

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
      <h1 className="titulo-valoraciones">
        <Trans id="valora-experiencia">Valora tu Experiencia</Trans>
      </h1>
      {productos.length === 0 ? (
        <p className="mensaje-sin-productos-valoraciones">
          <Trans id="no-hay-productos">No hay productos para valorar.</Trans>
        </p>
      ) : (
        <form className="formulario-valoraciones">
          {productos.map((producto) => (
            <div key={producto.productoId._id} className="producto-valoraciones">
              <h3 className="producto-nombre-valoraciones">{producto.nombre}</h3>
              <label className="etiqueta-valoraciones">
                <Trans id="estrellas">Estrellas:</Trans>
              </label>
              <select
                value={valoraciones.find((v) => v.productoId === producto.productoId._id)?.estrellas || 0}
                onChange={(e) =>
                  manejarEstrellas(producto.productoId._id, parseFloat(e.target.value))
                }
                className="select-valoraciones"
              >
                <option value={5}>
                  <Trans id="5-estrellas">5 estrellas</Trans>
                </option>
                {[1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5].map((estrella) => (
                  <option key={estrella} value={estrella}>
                    {estrella} <Trans id="estrella">estrella</Trans>
                    {estrella > 1 ? "s" : ""}
                  </option>
                ))}
              </select>
              <label className="etiqueta-valoraciones">
                <Trans id="comentario">Comentario:</Trans>
              </label>
              <textarea
                value={
                  valoraciones.find((v) => v.productoId === producto.productoId._id)?.comentario || ""
                }
                onChange={(e) => manejarComentario(producto.productoId._id, e.target.value)}
                maxLength={80}
                rows="4"
                cols="50"
                className="textarea-valoraciones"
              />
            </div>
          ))}
          <button type="button" onClick={enviarValoraciones} className="boton-enviar-valoraciones">
            <Trans id="enviar-valoraciones">Enviar Valoraciones</Trans>
          </button>
        </form>
      )}
    </div>
  );
};

export default Valoraciones;
