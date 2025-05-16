import { Schema, model } from 'mongoose';

// Subesquema para precios específicos
const precioSchema = new Schema(
  {
    precioBase: { type: Number, default: null }, // Precio general
    tapa: { type: Number, default: null }, // Opcional para platos
    racion: { type: Number, default: null }, // Opcional para platos
    copa: { type: Number, default: null }, // Opcional para bebidas
    botella: { type: Number, default: null }, // Opcional para bebidas
  },
  { _id: false }
);

// Modelo principal
const bebidaSchema = new Schema(
  {
    // Información general
    nombre: { type: String, required: true },
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

    // Estado y tipo de preparación
    estado: {
      type: String,
      enum: ['habilitado', 'deshabilitado'],
      default: 'habilitado',
    },
    estadoPreparacion: {
      type: String,
      enum: ['pendiente', 'listo'],
      default: 'pendiente',
    },
    tipoPedido: {
      type: String,
      enum: ['copa', 'botella', 'individual', 'compartir'],
      required: false,
    }, // Tipo general de pedido

    // Relaciones
    ventas: [{ type: Schema.Types.ObjectId, ref: 'Venta' }], // Relación con las ventas
    valoraciones: [{ type: Schema.Types.ObjectId, ref: 'ValoracionPlato' }], // Relación con valoraciones

    // Fechas de creación y actualización
  },
  { timestamps: true }
);

export default model('Bebida', bebidaSchema);
