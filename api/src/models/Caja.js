const mongoose = require("mongoose");

const CajaSchema = new mongoose.Schema(
    {
        fechaApertura: {
            type: Date,
            required: true,
            default: Date.now, // Fecha y hora en la que se abre la caja
        },
        fechaCierre: {
            type: Date, // Fecha y hora en la que se cierra la caja
        },
        estado: {
            type: String,
            enum: ["abierta", "cerrada"],
            default: "abierta", // Estado actual de la caja
        },
        total: {
            type: Number,
            required: true,
            default: 0, // Total acumulado en la caja
        },
        detallesMetodoPago: {
            // Desglose por método de pago
            efectivo: {
                type: Number,
                required: true,
                default: 0,
            },
            tarjeta: {
                type: Number,
                required: true,
                default: 0,
            },
            observaciones: {
                type: String, // Notas adicionales o detalles relevantes
            },
        },
        //timestamps: true,
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Caja", CajaSchema);
