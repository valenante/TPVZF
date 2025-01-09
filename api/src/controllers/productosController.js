const Producto = require('../models/Producto'); // Importar el modelo

// Obtener todos los productos
exports.getProductos = async (req, res) => {
    try {
        const productos = await Producto.find();
        res.status(200).json(productos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener los productos' });
    }
};

exports.getCategorias = async (req, res) => {
    const { type } = req.params;
    try {
        const categorias = await Producto.distinct('categoria', { tipo: type });
        res.status(200).json({ categorias });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener las categorías' });
    }
};

exports.getProductosByCategoria = async (req, res) => {
    const { type, categoria } = req.params;
    try {
        const productos = await Producto.find({ tipo: type, categoria });
        res.status(200).json(productos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener los productos' });
    }
}

// Obtener un producto por ID
exports.getProductoById = async (req, res) => {
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

// Crear un nuevo producto
exports.createProducto = async (req, res) => {
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

// Actualizar un producto por ID
exports.updateProducto = async (req, res) => {
    const { id } = req.params;
    try {
        const productoActualizado = await Producto.findByIdAndUpdate(id, req.body, { new: true });
        if (req.file) {
            productoActualizado.img = `/images/${req.file.filename}`;
        }
        if (!productoActualizado) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        // Emitir evento de actualización de producto
        req.io.emit('productoActualizado', productoActualizado);

        res.status(200).json(productoActualizado);
    } catch (error) {
        console.error(error);
        res.status(400).json({ error: 'Error al actualizar el producto. Verifica los datos enviados.' });
    }
};

// Eliminar un producto por ID
exports.deleteProducto = async (req, res) => {
    const { id } = req.params;
    try {
        const productoEliminado = await Producto.findByIdAndDelete(id);
        if (!productoEliminado) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        // Emitir evento de eliminación de producto
        req.io.emit('productoEliminado', { id });

        res.status(200).json({ message: 'Producto eliminado correctamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al eliminar el producto' });
    }
};
