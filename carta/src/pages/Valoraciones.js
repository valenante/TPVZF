import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api"; // Configuración de Axios

const Valoraciones = () => {
  const [productos, setProductos] = useState([]);
  const [valoraciones, setValoraciones] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  console.log("productos", productos);

  useEffect(() => {
    // Cargar productos desde el backend
    const cargarProductos = async () => {
      try {
        const mesaId = localStorage.getItem("mesaId"); // Obtener mesaId desde localStorage
        if (!mesaId) {
          navigate("/"); // Si no hay token, redirigir fuera de la web
          return;
        }

        const { data } = await api.get("/valoraciones/productos-valoraciones", {
          params: { mesaId }, // Enviar mesaId como parámetro de consulta
        });

        setProductos(data);
        setValoraciones(
          data.map((producto) => ({
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
        valoracion.productoId === productoId
          ? { ...valoracion, estrellas }
          : valoracion
      )
    );
  };

  const manejarComentario = (productoId, comentario) => {
    if (comentario.length > 80) {
      alert("El comentario no puede exceder los 80 caracteres.");
      return;
    }

    setValoraciones((prev) =>
      prev.map((valoracion) =>
        valoracion.productoId === productoId
          ? { ...valoracion, comentario }
          : valoracion
      )
    );
  };


  const enviarValoraciones = async () => {
    console.log(valoraciones);
    try {
      const mesaId = localStorage.getItem("mesaId"); // Obtener mesaId desde localStorage
      const valoracionesAEnviar = valoraciones.map((valoracion) => ({
        producto: valoracion.productoId, // Cambia "productoId" a "producto"
        puntuacion: valoracion.estrellas, // Cambia "estrellas" a "puntuacion"
        comentario: valoracion.comentario, // No necesita cambios
      }));

      console.log("Datos a enviar:", valoracionesAEnviar); // Depuración

      const response = await api.post("/valoraciones", valoracionesAEnviar, {
        params: { mesaId }, // Enviar mesaId como parámetro de consulta
      });

      alert("¡Gracias por tu valoración!");
      localStorage.removeItem("mesaId");
      localStorage.removeItem("tokenLider");
      localStorage.removeItem("tokenPreMenu");
      navigate("/");
    } catch (error) {
      console.error("Error al enviar las valoraciones:", error);
      alert("Hubo un problema al enviar las valoraciones. Intenta nuevamente.");
    }
  };

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      <h1>Valora tu Experiencia</h1>
      {productos.length === 0 ? (
        <p>No hay productos para valorar.</p>
      ) : (
        <form>
          {productos.map((producto) => (
            <div key={producto._id}>
              <h3>{producto.nombre}</h3>
              <label>Estrellas:</label>
              <select
                value={
                  valoraciones.find((v) => v.productoId === producto.productoId._id)?.estrellas || 0
                }
                onChange={(e) =>
                  manejarEstrellas(producto.productoId._id, parseInt(e.target.value, 10))
                }
              >
                <option value={0}>Sin valorar</option>
                {[1, 2, 3, 4, 5].map((estrella) => (
                  <option key={estrella} value={estrella}>
                    {estrella} estrella{estrella > 1 ? "s" : ""}
                  </option>
                ))}
              </select>
              <br />
              <label>Comentario:</label>
              <textarea
                value={
                  valoraciones.find((v) => v.productoId === producto._id)?.comentario || ""
                }
                onChange={(e) => manejarComentario(producto._id, e.target.value)}
                maxLength={80} // Máximo de 80 caracteres
                placeholder="Escribe tu comentario (máximo 80 caracteres)"
                rows="4"
                cols="50"
              />
            </div>
          ))}
          <button type="button" onClick={enviarValoraciones}>
            Enviar Valoraciones
          </button>
        </form>
      )}
    </div>
  );
};

export default Valoraciones;
