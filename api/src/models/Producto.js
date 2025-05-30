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

// Subesquema para presentaciones y opciones personalizables
const opcionPersonalizableSchema = new Schema(
  {
    tipo: { type: String, required: true }, // Ejemplo: "queso", "acompañamiento"
    opciones: { type: [String], default: [] }, // Ejemplo: ["cheddar", "mozzarella"]
  },
  { _id: false }
);

const adicionalSchema = new Schema(
  {
    nombre: { type: String, required: true }, // Ejemplo: "Unidad adicional"
    precio: { type: Number, required: true }, // Ejemplo: 2.1
  },
  { _id: false }
);

// Modelo principal
const productoSchema = new Schema(
  {
    // Información general
    nombre: { type: String, required: true },
    aliases: [{ type: String}], // Nombres alternativos o abreviaciones
    tipo: {
      type: String,
      enum: ['plato', 'tapaRacion', 'bebida', 'extra', 'postre'],
      required: true,
    }, // Diferencia entre plato y bebida
    categoria: { type: String, required: true }, // Ej: "entrante", "plato principal", "refresco", "licor"
    descripcion: { type: String, default: '' },
    img: { type: String},

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

    // Específico para platos
    ingredientes: { type: [String], default: [] }, // Ejemplo: ["pollo", "patatas"]
    ingredientesEliminados: { type: [String], default: [] }, // Ingredientes que el cliente ha solicitado quitar
    puntosDeCoccion: [{ type: String }], // Ej: "Poco hecho", "Bien hecho"
    opcionesPersonalizables: [opcionPersonalizableSchema], // Opciones personalizables para el cliente
    adicionales: [adicionalSchema],

    especificaciones: [
      {
        nombre: { type: String },
        valor: { type: String },
      },
    ],
    sabor: {
      type: [
        {
          ingrediente: String,
          cantidad: Number,
        },
      ],
      default: [],
      tipoCroqueta: { type: String, default: 'normal' }, // Tipo de croqueta,
      mensaje: {
        type: String,
        default: '',
      },
    },

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
    tipoPlato: {
      type: String,
      enum: ['compartir', 'individual'],
      default: 'compartir',
    }, // Tipo específico de plato

    // Relaciones
    ventas: [{ type: Schema.Types.ObjectId, ref: 'Venta' }], // Relación con las ventas
    valoraciones: [{ type: Schema.Types.ObjectId, ref: 'ValoracionPlato' }], // Relación con valoraciones

    // Fechas de creación y actualización
  },
  { timestamps: true }
);

export default model('Producto', productoSchema);
