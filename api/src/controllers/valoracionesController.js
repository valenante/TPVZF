import Pedido from "../models/Pedido.js";
import Valoracion from "../models/Valoracion.js";
import Mesa from "../models/Mesa.js";
import validator from "validator";
import Producto from "../models/Producto.js";

export const valorarPedido = async (req, res) => {
  const { mesaId } = req.query; // Obtener el `mesaId` desde la consulta

  if (!mesaId) {
    return res.status(400).json({ error: "El ID de la mesa es requerido." });
  }

  try {
    // Buscar los pedidos relacionados con la mesa
    const pedidos = await Pedido.find({ mesa: mesaId }).populate({
      path: "productos.producto", // Popular el campo producto dentro de productos
      select: "nombre precio producto", // Seleccionar solo los campos necesarios
    });

    // Extraer los productos de los pedidos
    const productos = pedidos.flatMap((pedido) =>
      pedido.productos.map((p) => ({
        productoId: p.producto,
        nombre: p.producto?.nombre || "Producto no encontrado",
        cantidad: p.cantidad,
        total: p.total,
      }))
    );

    res.status(200).json(productos);
  } catch (err) {
    console.error("Error al obtener productos para valorar:", err);
    res.status(500).json({ error: "Error al obtener productos para valorar." });
  }
};

export const crearValoraciones = async (req, res) => {
  const valoraciones = req.body; // Array de valoraciones enviado desde el frontend
  const { mesaId } = req.query; // Obtener el `mesaId` desde los parámetros de la consulta

  if (!Array.isArray(valoraciones) || valoraciones.length === 0) {
    return res.status(400).json({ error: "No se enviaron valoraciones válidas." });
  }

  try {
    // Validar y sanitizar cada valoración
    const valoracionesSanitizadas = valoraciones.map((valoracion) => {
      const comentarioLimpio = valoracion.comentario
        ? validator.escape(validator.trim(valoracion.comentario))
        : "";

      return {
        ...valoracion,
        comentario: comentarioLimpio, // Sanitizar el comentario
      };
    });

    // Insertar todas las valoraciones en la base de datos
    const valoracionesGuardadas = await Valoracion.insertMany(valoracionesSanitizadas);

    // Eliminar el campo tokenLider de la mesa
    if (mesaId) {
      const mesa = await Mesa.findByIdAndUpdate(
        mesaId,
        { $unset: { tokenLider: "" } }, // Eliminar el campo tokenLider
        { new: true } // Retornar el documento actualizado
      );

      if (!mesa) {
        return res.status(404).json({ error: "No se encontró la mesa especificada." });
      }

      console.log(`TokenLider eliminado de la mesa: ${mesaId}`);
    } else {
      console.warn("No se proporcionó un ID de mesa para eliminar el tokenLider.");
    }

    res.status(201).json({
      message: "Valoraciones guardadas exitosamente y tokenLider eliminado.",
      valoraciones: valoracionesGuardadas,
    });
  } catch (error) {
    console.error("Error al guardar las valoraciones:", error);
    res.status(500).json({ error: "Error al guardar las valoraciones." });
  }
};

export const obtenerProductosValorados = async (req, res) => {
  try {
    // Obtener el promedio de puntuaciones por producto
    const valoraciones = await Valoracion.aggregate([
      { $group: {
          _id: "$producto", // Agrupar por producto
          promedioEstrellas: { $avg: "$puntuacion" }, // Calcular el promedio
          totalValoraciones: { $sum: 1 } // Contar la cantidad de valoraciones
        }
      }
    ]);

    // Enriquecer datos con detalles de producto
    const productos = await Producto.find().lean(); // Obtener todos los productos
    const productosConValoraciones = productos.map((producto) => {
      const valoracion = valoraciones.find(
        (v) => v._id.toString() === producto._id.toString()
      );
      return {
        ...producto,
        estrellas: valoracion?.promedioEstrellas || 0,
        totalValoraciones: valoracion?.totalValoraciones || 0,
      };
    });

    res.status(200).json(productosConValoraciones);
    console.log(productosConValoraciones);
  } catch (error) {
    console.error("Error al obtener productos valorados:", error);
    res.status(500).json({ error: "Error al obtener productos valorados." });
  }
};