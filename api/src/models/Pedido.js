import { Schema, model } from 'mongoose';

// Subesquema para precios específicos
const precioSchema = new Schema({
  precioBase: { type: Number, required: true }, // Precio general
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

const PedidoSchema = new Schema({
  mesa: { type: Schema.Types.ObjectId, ref: 'Mesa', required: true },
  usuario: { type: Schema.Types.ObjectId, ref: 'User' }, // Opcional
  alergias: { type: String, default: '' }, // Alergias o intolerancias
  comensales: { type: Number, required: true },
  estado: { type: String, enum: ['pendiente', 'listo'], default: 'pendiente' },
  fecha: { type: Date, default: Date.now },
  productos: [
    {
      producto: { type: Schema.Types.ObjectId, ref: 'Producto', required: true },
      cantidad: { type: Number, required: true },
      eliminado: { type: Boolean, default: false }, // Indica si se eliminó
      tipo: { type: String, enum: ['plato', 'bebida'], required: true }, // Diferencia entre plato y bebida
      categoria: { type: String, required: true }, // Ej: "entrante", "plato principal", "refresco", "licor"
      precios: { type: precioSchema, required: true },
      ingredientesEliminados: { type: [String], default: [] }, // Ingredientes que el cliente ha solicitado quitar
      puntosDeCoccion: [{ type: String }], // Ej: "Poco hecho", "Bien hecho"
      opcionesPersonalizables: [opcionPersonalizableSchema], // Opciones personalizables para el cliente
      especificaciones: { type: [String], default: [] }, // Ejemplo: "Sin sal", "Extra picante"

      estado: { type: String, enum: ['pendiente', 'listo'], default: 'pendiente' },
      tipoPedido: { type: String, enum: ['copa', 'botella', 'individual', 'compartir'], required: false }, // Tipo general de pedido
      total: { type: Number, required: true },
    },
  ],
total: { type: Number, required: true },

});

export default model('Pedido', PedidoSchema);
