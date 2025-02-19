import MesaCerrada from "../models/MesaCerrada.js";
import Password from "../models/Password.js";
import Caja from "../models/Caja.js";
import Pedido from "../models/Pedido.js";
import Cart from "../models/Cart.js";
import Eliminaciones from "../models/Eliminacion.js";
import Mesa from "../models/Mesa.js";
import PDFDocument from "pdfkit";
import nodemailer from "nodemailer";

export const obtenerCaja = async (req, res) => {
    try {
        // Obtener parámetros opcionales de fecha
        const { fechaInicio, fechaFin } = req.query;

        // Calcular el rango de fechas
        const inicio = fechaInicio ? new Date(fechaInicio) : new Date(new Date().setHours(0, 0, 0, 0));
        const fin = fechaFin ? new Date(fechaFin) : new Date(new Date().setHours(23, 59, 59, 999));

        const cajas = await Caja.find({
            fechaApertura: { $gte: inicio, $lte: fin },
        });

        if (!cajas || cajas.length === 0) {
            return res.status(404).json({ message: "No se encontraron cajas abiertas en el rango especificado." });
        }

        // Devolver los datos de las cajas encontradas
        res.json(cajas);
    } catch (error) {
        console.error("Error al obtener las cajas en el rango especificado:", error);
        res.status(500).json({ message: "Error al obtener las cajas en el rango especificado." });
    }
};


export const integrarDinero = async (req, res) => {
    const { monto, razon } = req.body;

    if (!monto || !razon) {
        return res.status(400).json({ error: "Monto y razón son obligatorios." });
    }

    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Establece la hora a 00:00:00 para evitar problemas con la comparación
        
        const caja = await Caja.findOne({
            estado: "abierta" // Filtra solo las cajas con estado "abierto"
        });
        if (!caja) {
            return res.status(404).json({ error: "Caja no encontrada." });
        }

        const montoNumerico = parseFloat(monto);
        if (isNaN(montoNumerico) || montoNumerico <= 0) {
            return res.status(400).json({ error: "El monto debe ser un número mayor a 0." });
        }

        // Actualizar el efectivo y el total en la caja
        caja.detallesMetodoPago.efectivo += montoNumerico;
        caja.total += montoNumerico;

        // Registrar la operación
        caja.operaciones.push({
            tipo: "integrar",
            monto: montoNumerico,
            razon,
        });

        await caja.save();

        res.status(200).json({
            message: "Dinero integrado correctamente.",
            total: caja.total,
            metodoPago: caja.detallesMetodoPago,
        });
    } catch (error) {
        console.error("Error al integrar dinero:", error);
        res.status(500).json({ error: "Error al integrar dinero." });
    }
};

export const retirarDinero = async (req, res) => {
    const { monto, razon } = req.body;

    console.log(monto, razon);

    if (!monto || !razon) {
        return res.status(400).json({ error: "Monto y razón son obligatorios." });
    }

    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Establece la hora a 00:00:00 para evitar problemas con la comparación
        
        const caja = await Caja.findOne({
            estado: "abierta" // Filtra solo las cajas con estado "abierto"
        });
        
        if (!caja) {
            return res.status(404).json({ error: "Caja no encontrada." });
        }

        const montoNumerico = parseFloat(monto);
        if (isNaN(montoNumerico) || montoNumerico <= 0) {
            return res.status(400).json({ error: "El monto debe ser un número mayor a 0." });
        }

        if (caja.detallesMetodoPago.efectivo < montoNumerico) {
            return res.status(400).json({ error: "No hay suficiente efectivo en la caja para retirar este monto." });
        }

        // Actualizar el efectivo y el total en la caja
        caja.detallesMetodoPago.efectivo -= montoNumerico;
        caja.total -= montoNumerico;

        // Registrar la operación
        caja.operaciones.push({
            tipo: "retirar",
            monto: montoNumerico,
            razon,
        });

        await caja.save();

        res.status(200).json({
            message: "Dinero retirado correctamente.",
            total: caja.total,
            metodoPago: caja.detallesMetodoPago,
        });
    } catch (error) {
        console.error("Error al retirar dinero:", error);
        res.status(500).json({ error: "Error al retirar dinero." });
    }
};

export const cerrarCaja = async (req, res) => {
    try {
        // Buscar la contraseña en la base de datos
        const passwordDoc = await Password.findOne();
        if (!passwordDoc || !passwordDoc.valor) {
            return res.status(404).json({ message: "Contraseña no encontrada" });
        }

        // Validar la contraseña ingresada
        const { password } = req.body;
        if (password !== passwordDoc.valor) {
            return res.status(401).json({ message: "Contraseña incorrecta" });
        }

        // Calcular el total de las mesas cerradas
        const mesasCerradas = await MesaCerrada.find();
        const total = mesasCerradas.reduce((acc, mesa) => {
            const totalMesa = Object.values(mesa.metodoPago).reduce((sum, value) => sum + value, 0);
            return acc + totalMesa;
        }, 0);

        // Calcular el rango de fechas para el día actual
        const hoy = new Date();
        const inicioDelDia = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate(), 0, 0, 0);
        const finDelDia = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate(), 23, 59, 59);

        // Buscar la caja con la fecha de hoy y estado 'abierta'
        const cajaActual = await Caja.findOne({
            fechaApertura: { $gte: inicioDelDia, $lte: finDelDia },
            estado: "abierta"
        });

        if (cajaActual) {
            cajaActual.estado = "cerrada";
            await cajaActual.save();
        }

        await cajaActual.save();

        // Crear una nueva caja
        const nuevaCaja = new Caja({
            total: 0,
            detallesMetodoPago: { efectivo: 0, tarjeta: 0, propina: 0 },
            operaciones: [],
            estado: "abierta"
        });
        await nuevaCaja.save();

        await Mesa.updateMany({}, { $set: { estado: "cerrada" } });

        // Restablecer datos después del cierre de caja
        await MesaCerrada.deleteMany({});
        await Pedido.deleteMany({});
        await Cart.deleteMany({});
        await Mesa.updateMany({}, { $set: { total: 0, pedidos: [] } });
        await Eliminaciones.deleteMany({});
        await Mesa.updateMany({}, { $set: { total: 0, pedidos: [] } });

        // Generar el PDF con los datos del cierre
        const pdfBuffer = await generarPDF(mesasCerradas, total);

        // Enviar el PDF por correo
        await enviarEmailConPDF(pdfBuffer);

        res.json({ message: "Caja cerrada y nueva caja creada correctamente." });
    } catch (error) {
        console.error("Error al cerrar la caja:", error);
        res.status(500).json({
            message: "Error al cerrar la caja."
        });
    }
}

const generarPDF = (mesasCerradas, total) => {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument();
        const buffers = [];

        doc.on("data", buffers.push.bind(buffers));
        doc.on("end", () => resolve(Buffer.concat(buffers)));
        doc.on("error", reject);

        // Contenido del PDF
        doc.fontSize(20).text("Informe Diario", { align: "center" });
        doc.fontSize(14).text(`Fecha: ${new Date().toLocaleDateString()}`, { align: "right" });

        doc.moveDown();
        mesasCerradas.forEach((mesa, index) => {
            doc.text(`Mesa ${mesa.numero}:`);
            doc.text(`  Total: ${mesa.total} €`);
            doc.text(`  Método de Pago: Efectivo - ${mesa.metodoPago.efectivo} €, Tarjeta - ${mesa.metodoPago.tarjeta} €`);
            doc.moveDown();
        });

        doc.text(`Total del Día: ${total.toFixed(2)} €`, { align: "right" });
        doc.end();
    });
};

const enviarEmailConPDF = async (pdfBuffer) => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    await transporter.sendMail({
        from: '"Sistema TPV" valentinoantenucci1@gmail.com',
        to: "valentinoantenucci1@gmail.com", // Correo del destinatario
        subject: "Informe Diario - Cierre de Caja",
        text: "Adjunto se encuentra el informe diario del cierre de caja.",
        attachments: [
            {
                filename: `informe-diario-${new Date().toISOString().slice(0, 10)}.pdf`,
                content: pdfBuffer,
                contentType: "application/pdf",
            },
        ],
    });
};