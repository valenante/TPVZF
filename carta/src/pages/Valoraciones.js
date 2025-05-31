import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Trans } from "@lingui/react";
import DOMPurify from "dompurify"; // Para sanitizar entradas de texto
import api from "../utils/api"; // Configuración de Axios
import { useMesas } from "../context/MesasContext"; // ✅ Importar el hook useMesas
import AlertaMensaje from "../components/AlertaMensaje/AlertaMensaje"; // Componente para mostrar alertas
import "../styles/Valoraciones.css"; // Archivo de estilos

const Valoraciones = () => {
  const [productos, setProductos] = useState([]);
  const { mesaId } = useMesas(); // ✅ Acceder al ID de la mesa con useMesas
  const [valoraciones, setValoraciones] = useState([]);
  const [error, setError] = useState(null);
  const [mensajeAlerta, setMensajeAlerta] = useState(null);
  const navigate = useNavigate();

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
      setMensajeAlerta({ tipo: "error", mensaje: "El comentario no puede exceder los 80 caracteres" });
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
        puntuacion: valoracion.estrellas || 5,
        comentario: valoracion.comentario,
      }));

      await api.post(`/valoraciones?mesaId=${mesaId}`, valoracionesAEnviar);

      setMensajeAlerta({ tipo: "exito", mensaje: "Gracias por sus valoraciones" });
      localStorage.clear();
      window.location.href = "https://www.google.com/search?client=safari&sca_esv=e6182da575e8b716&rls=en&sxsrf=AHTn8zqqgHqdZwmypsIJqc9la2CMPknULw:1739570436727&si=APYL9bs7Hg2KMLB-4tSoTdxuOx8BdRvHbByC_AuVpNyh0x2KzX5KKmkHLDdoPn7kYismFYbhKPchvUpAro8JFhU7uCggslmn8wuQxGhNj-JBF61qAnaIxihmVEG7vfCsKZRB89gYAR-NY-OZxafcF_nrV8K130Xwf3VoTmwAwoC0TcuNXfCM-tAp1Kt8tr2E_RRGxHp4_0LX&q=ZABOR+FETEN+-+Restaurante,+Bar+y+Tapas+en+Torremolinos+Rese%C3%B1as&sa=X&ved=2ahUKEwjHjMXvlMSLAxUR9LsIHSuEK7IQ0bkNegQILBAE&biw=1470&bih=840&dpr=2";
    } catch (error) {
      console.error("Error al enviar las valoraciones:", error);
      setMensajeAlerta({ tipo: "error", mensaje: "Hubo en error al enviar las valoraciones" });
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
              <select
                value={valoraciones.find((v) => v.productoId === producto.productoId._id)?.estrellas || 5}
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
      {mensajeAlerta && (
        <AlertaMensaje
          tipo={mensajeAlerta.tipo}
          mensaje={mensajeAlerta.mensaje}
          onClose={() => setMensajeAlerta(null)}
        />
      )}
    </div>
  );
};

export default Valoraciones;
