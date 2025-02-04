import { Schema, model } from 'mongoose';

// Subesquema para precios específicos de bebidas
const precioBebidaSchema = new Schema({
  precioBase: { type: Number, required: true }, // Precio general
  copa: { type: Number, default: null }, // Precio para copa
  botella: { type: Number, default: null }, // Precio para botella
}, { _id: false });

// Subesquema para presentaciones y opciones personalizables
const opcionPersonalizableSchema = new Schema({
  tipo: { type: String, required: true }, // Ejemplo: "tipo de hielo", "acompañamiento"
  opcion: { type: [String], default: [] }, // Ejemplo: ["hielo picado", "hielo en cubos"]
}, { _id: false });

const PedidoBebidasSchema = new Schema({
  mesa: { type: Schema.Types.ObjectId, ref: 'Mesa', required: true },
  usuario: { type: Schema.Types.ObjectId, ref: 'User' }, // Opcional
  alergias: { type: String, default: '' }, // Alergias o intolerancias
  comensales: { type: Number },
  estado: { type: String, enum: ['pendiente', 'listo'], default: 'pendiente' },
  fecha: { type: Date, default: Date.now },
  productos: [
    {
      producto: { type: Schema.Types.ObjectId, ref: 'Producto', required: true },
      cantidad: { type: Number, required: true },
      eliminado: { type: Boolean, default: false }, // Indica si se eliminó
      tipo: { type: String, enum: ['bebida'], required: true }, // Solo bebidas
      categoria: { type: String, required: true }, // Ej: "refresco", "licor", "cocktail"
      precioSeleccionado: { type: Number, required: true }, // Precio seleccionado
      opcionesPersonalizables: [opcionPersonalizableSchema], // Opciones personalizables para bebidas
      especificaciones: { type: [String], default: [] }, // Ejemplo: "Sin hielo", "Doble carga"
      estadoPreparacion: { type: String, enum: ['pendiente', 'listo'], default: 'pendiente' },
      tipoPedido: { type: String, enum: ['copa', 'botella']}, // Tipo específico de bebida
      total: { type: Number, required: true },
    },
  ],
  total: { type: Number, required: true },
});

export default model('PedidoBebidas', PedidoBebidasSchema);
