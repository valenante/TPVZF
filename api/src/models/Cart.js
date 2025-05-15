import { Schema as _Schema, model } from 'mongoose';
const Schema = _Schema;

const adicionalSchema = new Schema({
  nombre: { type: String, required: true },  // Ejemplo: "Unidad adicional"
  precio: { type: Number, required: true }   // Ejemplo: 2.1
}, { _id: false });

const CartItemSchema = new Schema({
  productId: { type: _Schema.Types.ObjectId, ref: 'Producto', required: true },
  cantidad: { type: Number, required: true, default: 1 },
  mesa: { type: String, required: true },
  opciones: { type: Object, default: {} }, // Opciones personalizables
  ingredientes: { type: [String], default: [] }, // Ingredientes personalizados
  sabor: {
    type: [{
      ingrediente: String,
      cantidad: Number
    }],
    default: []
  }, nombre: { type: String, required: true },
  precioSeleccionado: { type: Number, required: true }, // Precio seleccionado por el usuario
  tipoPrecio: {
    type: String,
    enum: ['tapa', 'racion', 'surtido', 'precioBase', 'copa', 'botella'],
    required: true
  },

  tipoPlato: { type: String, enum: ['compartir', 'individual'], default: 'compartir' }, // Tipo de plato
  tipoCroqueta: { type: String, default: 'normal' },
  nombre: { type: String, required: false },    // Nombre del comensal
  alergias: { type: String, required: false },  // Alergias del comensal
  acompanante: { type: String, required: false }, // 👈 AÑADIDO AQUÍ
  adicionales: [adicionalSchema],
});

const CartSchema = new Schema({
  items: [CartItemSchema],
  mesa: { type: String, required: true },
}, { timestamps: true });

export default model('Cart', CartSchema);
