import { Schema as _Schema, model } from 'mongoose';
const Schema = _Schema;

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
},  nombre: { type: String, required: true },
  precioSeleccionado: { type: Number, required: true }, // Precio seleccionado por el usuario
  tipoPrecio: { 
    type: String, 
    enum: ['tapa', 'racion', 'surtido', 'precioBase'], 
    required: true 
  },
  
  tipoPlato: { type: String, enum: ['compartir', 'individual'], default: 'compartir' }, // Tipo de plato
  tipoCroqueta: { type: String,default: 'normal' },
  nombre: { type: String, required: false },    // Nombre del comensal
  alergias: { type: String, required: false },  // Alergias del comensal
});

const CartSchema = new Schema({
  items: [CartItemSchema],
  mesa: { type: String, required: true },
}, { timestamps: true });

export default model('Cart', CartSchema);
 