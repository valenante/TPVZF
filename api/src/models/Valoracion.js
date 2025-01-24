import { Schema, model } from 'mongoose';

const ValoracionSchema = new Schema({
  producto: { 
    type: Schema.Types.ObjectId, 
    ref: 'Producto', 
    required: [true, "El campo 'producto' es obligatorio."] 
  },
  usuario: { type: Schema.Types.ObjectId, ref: 'User' },
  comentario: {
    type: String,
    maxlength: [80, "El comentario no puede exceder los 80 caracteres."],
  },
  puntuacion: { 
    type: Number, 
    min: [1, "La puntuación mínima es 1."], 
    max: [5, "La puntuación máxima es 5."], 
    required: [true, "El campo 'puntuacion' es obligatorio."] 
  },
  fecha: { type: Date, default: Date.now },
});

export default model('Valoracion', ValoracionSchema);
