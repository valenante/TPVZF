import { Schema, model } from 'mongoose';

// Subesquema para precios específicos
const precioSchema = new Schema({
  precioBase: { type: Number, default: null}, // Precio general
  tapa: { type: Number, default: null }, // Opcional para platos
  racion: { type: Number, default: null }, // Opcional para platos
  copa: { type: Number, default: null }, // Opcional para bebidas
  botella: { type: Number, default: null }, // Opcional para bebidas
}, { _id: false });

// Subesquema para presentaciones y opciones personalizables
const opcionPersonalizableSchema = new Schema({
  tipo: { type: String, required: true }, // Ejemplo: "queso", "acompañamiento"
  opciones: { type: [String], default: [] }, // Ejemplo: ["cheddar", "mozzarella"]
}, { _id: false });

// Modelo principal
const productoSchema = new Schema({
  // Información general
  nombre: { type: String, required: true },
  tipo: { type: String, enum: ['plato', 'tapaRacion', 'bebida'], required: true }, // Diferencia entre plato y bebida
  categoria: { type: String, required: true }, // Ej: "entrante", "plato principal", "refresco", "licor"
  descripcion: { type: String, default: '' },
  img: { type: String, required: true },

  // Traducciones
  traducciones: {
    en: {
      nombre: { type: String, default: '' },
      descripcion: { type: String, default: '' },
    },
    fr: {
      nombre: { type: String, default: '' },
      descripcion: { type: String, default: '' },
    },
  },

  // Precios y stock
  precios: { type: precioSchema, required: true },
  stock: { type: Number, default: 0 },

  // Específico para bebidas
  conHielo: { type: Boolean, default: false },
  conLimon: { type: Boolean, default: false },
  acompanante: {
    type: String,
    enum: ['refresco', 'agua tónica', 'soda', 'naranja', 'limón'],
    required: function () {
      return this.tipo === 'bebida' && this.tipoPedido === 'copa';
    },
  },

  // Específico para platos
  ingredientes: { type: [String], default: [] }, // Ejemplo: ["pollo", "patatas"]
  ingredientesEliminados: { type: [String], default: [] }, // Ingredientes que el cliente ha solicitado quitar
  puntosDeCoccion: [{ type: String }], // Ej: "Poco hecho", "Bien hecho"
  opcionesPersonalizables: [opcionPersonalizableSchema], // Opciones personalizables para el cliente
  especificaciones: { type: [String], default: [] }, // Ejemplo: "Sin sal", "Extra picante"

  // Estado y tipo de preparación
  estado: { type: String, enum: ['habilitado', 'deshabilitado'], default: 'habilitado' },
  estadoPreparacion: { type: String, enum: ['pendiente', 'listo'], default: 'pendiente' },
  tipoPedido: { type: String, enum: ['copa', 'botella', 'individual', 'compartir'], required: false }, // Tipo general de pedido

  // Relaciones
  ventas: [{ type: Schema.Types.ObjectId, ref: 'Venta' }], // Relación con las ventas
  valoraciones: [{ type: Schema.Types.ObjectId, ref: 'ValoracionPlato' }], // Relación con valoraciones

  // Fechas de creación y actualización
}, { timestamps: true });

export default model('Producto', productoSchema);
