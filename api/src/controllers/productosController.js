import Producto from '../models/Producto.js';
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
    console.log("Tipo de producto:", type); // Esto debería mostrar 'platos' o 'bebidas'

    try {
        const categorias = await Producto.distinct('categoria', { tipo: type });
        console.log("Categorías encontradas en el backend:", categorias); // Esto debería mostrar ['especiales']
        
        res.status(200).json({ categories: categorias });
    } catch (error) {
        console.error("Error al obtener categorías:", error);
        res.status(500).json({ error: 'Error al obtener las categorías' });
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
    console.log("Categoría de producto:", category); // Esto debería mostrar 'especiales'

    try {
        const productos = await Producto.find({ categoria: category });
        console.log("Productos encontrados en el backend:", productos); // Esto debería mostrar los productos de la categoría 'especiales'
        
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

// Eliminar un producto por ID
export const deleteProducto = async (req, res) => {
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
