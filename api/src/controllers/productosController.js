import Producto from '../models/Producto.js';
import Pedido from '../models/Pedido.js';
import jwt from 'jsonwebtoken';
import Eliminacion from '../models/Eliminacion.js';
import Mesa from '../models/Mesa.js';

// Obtener todos los productos
export const getProductos = async (req, res) => {
    try {
        const productos = await Producto.find();
        res.status(200).json(productos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener los productos' });
    }
};

// Obtener un producto por ID
export const getProductoById = async (req, res) => {
    const { id } = req.params;
    try {
        const producto = await Producto.findById(id);
        if (!producto) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }
        res.status(200).json(producto);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener el producto' });
    }
};

export const getCategoriasByType = async (req, res) => {
    const { type } = req.params;

    try {
        const filtroTipo = type === "plato" ? ["plato", "tapaRacion"] : [type];
        const categorias = await Producto.distinct("categoria", { tipo: { $in: filtroTipo } });

        res.status(200).json({ categories: categorias });
    } catch (error) {
        console.error("Error al obtener categorías:", error);
        res.status(500).json({ error: "Error al obtener las categorías" });
    }
};

//Editar producto
export const updateProducto = async (req, res) => {
    const { id } = req.params;
    try {
        const productoActualizado = await Producto.findByIdAndUpdate
        (id, req.body, { new: true });

        if (req.file) {
            productoActualizado.img = `/images/${req.file.filename}`;
        }
        if (!productoActualizado) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }
        res.status(200).json(productoActualizado);
    } catch (error) {
        console.error(error);
        res.status(400).json({ error: 'Error al actualizar el producto. Verifica los datos enviados.' });
    }
}

export const getProductosByCategory = async (req, res) => {
    const { category } = req.params;

    try {
        const productos = await Producto.find({ categoria: category });
        
        res.status(200).json({ products: productos });
    } catch (error) {
        console.error("Error al obtener productos por categoría:", error);
        res.status(500).json({ error: 'Error al obtener los productos' });
    }
}

// Crear un nuevo producto
export const createProducto = async (req, res) => {
    try {
        const nuevoProducto = new Producto(req.body);
        if (req.file) {
            nuevoProducto.img = `/images/${req.file.filename}`; // Asignar la ruta de la imagen
        }
        await nuevoProducto.save();

        // Emitir evento de creación de producto
        req.io.emit('productoCreado', nuevoProducto);

        res.status(201).json(nuevoProducto);
    } catch (error) {
        console.error(error);
        res.status(400).json({ error: 'Error al crear el producto. Verifica los datos enviados.' });
    }
};

export const deleteProducto = async (req, res) => {
    const { pedidoId, id: productoId } = req.params; // IDs del pedido y del producto
    const { motivo } = req.body; // Motivo de eliminación enviado en el cuerpo de la solicitud

  
    try {
      // Obtener el token del encabezado de autorización
      const token = req.headers.authorization?.split(" ")[1]; // "Bearer <token>"
  
      if (!token) {
        return res.status(401).json({ error: "Token no proporcionado." });
      }
  
      // Decodificar el token para obtener el usuarioId
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const usuarioId = decoded.id; // Usuario que realiza la eliminación
  
      // Encontrar el pedido
      const pedido = await Pedido.findById(pedidoId);
      if (!pedido) {
        return res.status(404).json({ error: "Pedido no encontrado." });
      }
  
      // Buscar el producto en el pedido
      const productoEliminado = pedido.productos.find(
        (producto) => producto.producto.toString() === productoId
      );
  
      if (!productoEliminado) {
        return res.status(404).json({ error: "Producto no encontrado en el pedido." });
      }
  
      // Filtrar el producto del pedido y recalcular el total
      pedido.productos = pedido.productos.filter(
        (producto) => producto.producto.toString() !== productoId
      );
  
      pedido.total = pedido.productos.reduce((total, producto) => {
        return total + (producto.total || 0); // Asegurar que cada producto tenga un total válido
      }, 0);
  
      await pedido.save();
  
      // Registrar la eliminación en la colección `Eliminaciones`
      const eliminacion = new Eliminacion({
        producto: productoEliminado.producto,
        pedido: pedidoId,
        cantidad: productoEliminado.cantidad || 1, // Si no tienes cantidad, asume 1 por defecto
        motivo: motivo || "Sin motivo especificado",
        user: usuarioId, // Usuario que eliminó el producto
        mesa: pedido.mesa,
      });
  
      await eliminacion.save();
  

      // Actualizar el total de la mesa
      const mesa = await Mesa.findById(pedido.mesa).populate("pedidos");
      if (!mesa) {
        return res.status(404).json({ error: "Mesa no encontrada." });
      }
  
      // Recalcular el total de la mesa sumando los totales de todos sus pedidos
      mesa.total = mesa.pedidos.reduce((totalMesa, pedido) => {
        return totalMesa + (pedido.total || 0);
      }, 0);
  
      await mesa.save();
  
      res.json({
        message: "Producto eliminado y registrado con éxito.",
        mesa: {
          id: mesa._id,
          total: mesa.total,
        },
        pedido: {
          id: pedido._id,
          total: pedido.total,
          productos: pedido.productos,
        },
      });
    } catch (error) {
      console.error("Error al eliminar producto:", error);
      res.status(500).json({ error: "Error al eliminar producto." });
    }
  };
  