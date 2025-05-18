import { Schema, model } from 'mongoose';

const PedidoBebidasSchema = new Schema({
  mesa: { type: Schema.Types.ObjectId, ref: 'Mesa', required: true },
  usuario: { type: Schema.Types.ObjectId, ref: 'User' }, // Opcional
  alergias: { type: String, default: '' }, // Alergias o intolerancias
  comensales: { type: Number },
  estado: { type: String, enum: ['pendiente', 'listo'], default: 'pendiente' },
  fecha: { type: Date, default: Date.now },
  sesionId: { type: Schema.Types.ObjectId, ref: 'SesionMesa' }, // ✅ Sesión de la mesa
  productos: [
    {
      producto: {
        type: Schema.Types.ObjectId,
        ref: 'Producto',
        required: true,
      },
      cantidad: { type: Number, required: true },
      eliminado: { type: Boolean, default: false }, // Indica si se eliminó
      tipo: { type: String, enum: ['bebida'], required: true }, // Solo bebidas
      categoria: { type: String, required: true }, // Ej: "refresco", "licor", "cocktail"
      precioSeleccionado: { type: Number, required: true }, // Precio seleccionado
      especificaciones: { type: [String], default: [] }, // Ejemplo: "Sin hielo", "Doble carga"
      estadoPreparacion: {
        type: String,
        enum: ['pendiente', 'listo'],
        default: 'pendiente',
      },
      tipoPrecio: {
        type: String,
        enum: ['tapa', 'racion', 'surtido', 'precioBase', 'copa', 'botella'],
        required: true,
      }, // Tipo de precio seleccionado
      tipoPedido: { type: String, enum: ['copa', 'botella'] }, // Tipo específico de bebida
      acompanante: { type: String, required: false }, // 👈 AÑADIR AQUÍ
      total: { type: Number, required: true },
      mensaje: {
        type: String,
        default: '',
      },
    },
  ],
  total: { type: Number, required: true },
});

export default model('PedidoBebida', PedidoBebidasSchema);
