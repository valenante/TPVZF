import MesaCerrada from "../models/MesaCerrada.js";
import Password from "../models/Password.js";
import Caja from "../models/Caja.js";
import Pedido from "../models/Pedido.js";
import Cart from "../models/Cart.js";
import Eliminaciones from "../models/Eliminacion.js";
import Mesa from "../models/Mesa.js";
import PDFDocument from "pdfkit";
import { fileURLToPath } from "url";
import path from "path";
import axios from 'axios';
import FormData from 'form-data';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const MAILGUN_API_KEY = process.env.MAILGUN_API_KEY;
const MAILGUN_DOMAIN = process.env.MAILGUN_DOMAIN;
const MAILGUN_REGION = process.env.MAILGUN_REGION || 'eu';

export const obtenerCajaAbierta = async (req, res) => {
    try {
        // Buscar la caja que esté actualmente abierta
        const caja = await Caja.findOne({ estado: "abierta" });

        if (caja) {
            return res.status(200).json({ abierta: true, cajaId: caja._id });
        } else {
            return res.status(200).json({ abierta: false });
        }
    } catch (error) {
        console.error("[ERROR] Al verificar caja abierta:", error);
        return res.status(500).json({ error: "Error al verificar el estado de la caja." });
    }
};

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

    (monto, razon);

    if (!monto || !razon) {
        return res.status(400).json({ error: "Monto y razón son obligatorios." });
    }

    try {

        ("Retirando dinero...");
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Establece la hora a 00:00:00 para evitar problemas con la comparación

        const caja = await Caja.findOne({
            estado: "abierta" // Filtra solo las cajas con estado "abierto"
        });

        if (!caja) {
            return res.status(404).json({ error: "Caja no encontrada." });
        }

        ("Caja encontrada:", caja);

        const montoNumerico = parseFloat(monto);
        if (isNaN(montoNumerico) || montoNumerico <= 0) {
            return res.status(400).json({ error: "El monto debe ser un número mayor a 0." });
        }

        ("Monto a retirar:", montoNumerico);

        (
            caja.detallesMetodoPago.efectivo,
            caja.detallesMetodoPago.tarjeta,
            caja.detallesMetodoPago.propina
        )

        if (caja.detallesMetodoPago.efectivo < montoNumerico) {
            return res.status(400).json({ error: "No hay suficiente efectivo en la caja para retirar este monto." });
        }
        // Actualizar el efectivo y el total en la caja
        caja.detallesMetodoPago.efectivo -= montoNumerico;
        caja.total -= montoNumerico;

        ("Efectivo después de la operación:", caja.detallesMetodoPago.efectivo);

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

        const mesasCerradas = await MesaCerrada.find()
            .populate({
                path: "pedidos",
                populate: {
                    path: "productos.producto", // Popular los productos dentro de pedidos
                    select: "nombre precio"
                }
            })
            .populate({
                path: "pedidoBebidas",
                populate: {
                    path: "productos.producto", // Popular los productos dentro de pedidoBebidas
                    select: "nombre precio"
                }
            });

        ("Mesas cerradas con pedidos:", JSON.stringify(mesasCerradas, null, 2));


        if (!mesasCerradas || mesasCerradas.length === 0) {
            return res.status(400).json({ message: "No hay mesas cerradas para generar el informe." });
        }

        // 📌 **CALCULAR LOS TOTALES ANTES DE BORRAR LOS DATOS**
        const total = mesasCerradas.reduce((acc, mesa) => {
            return acc + Object.values(mesa.metodoPago).reduce((sum, value) => sum + value, 0);
        }, 0);

        // Calcular el total por método de pago
        const totalesMetodoPago = mesasCerradas.reduce((totales, mesa) => {
            totales.efectivo += mesa.metodoPago.efectivo || 0;
            totales.tarjeta += mesa.metodoPago.tarjeta || 0;
            totales.propina += mesa.metodoPago.propina || 0;
            return totales;
        }, { efectivo: 0, tarjeta: 0, propina: 0 });

        // 📌 **GENERAR EL PDF ANTES DE BORRAR**
        const pdfBuffer = await generarPDF(mesasCerradas, total, totalesMetodoPago);

        // 📌 **GUARDAR EL ESTADO DE LA CAJA**
        const hoy = new Date();
        const inicioDelDia = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate(), 0, 0, 0);
        const finDelDia = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate(), 23, 59, 59);

        const cajaActual = await Caja.findOne({
            fechaApertura: { $gte: inicioDelDia, $lte: finDelDia },
            estado: "abierta"
        });

        if (cajaActual) {
            cajaActual.estado = "cerrada";
            cajaActual.total = total;
            cajaActual.detallesMetodoPago = totalesMetodoPago;
            await cajaActual.save();
        }

        // 📌 **ENVIAR EL EMAIL ANTES DE ELIMINAR LOS DATOS**
        try {
            await enviarEmailConPDF(pdfBuffer);
        } catch (emailError) {
            console.error("Error enviando el email con el informe:", emailError);
        }

        // 📌 **AHORA SÍ, ELIMINAMOS LOS DATOS**
        await Mesa.updateMany({}, { $set: { estado: "cerrada", total: 0, pedidos: [] } });
        await MesaCerrada.deleteMany({});
        await Pedido.deleteMany({});
        await Cart.deleteMany({});
        await Eliminaciones.deleteMany({});

        // Crear una nueva caja para el próximo turno
        const nuevaCaja = new Caja({
            total: 0,
            detallesMetodoPago: { efectivo: 0, tarjeta: 0, propina: 0 },
            operaciones: [],
            estado: "abierta",
            fechaApertura: new Date()
        });
        await nuevaCaja.save();

        res.json({ message: "Caja cerrada y nueva caja creada correctamente." });

    } catch (error) {
        console.error("Error al cerrar la caja:", error);
        res.status(500).json({ message: "Error al cerrar la caja." });
    }
};

const generarPDF = (mesasCerradas, total, totalesMetodoPago) => {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ margin: 50 });
        const buffers = [];

        doc.on("data", buffers.push.bind(buffers));
        doc.on("end", () => resolve(Buffer.concat(buffers)));
        doc.on("error", reject);


        // 📌 Ruta de la imagen (asegúrate de que la ruta es correcta)
        const logoPath = path.join(__dirname, "../../public/images/logoZf.jpg");

        try {
            // 📌 **LOGO COMO ENCABEZADO (parte superior)**
            doc.image(logoPath, 50, 30, { width: 100 }); // Posición (x, y) y tamaño
        } catch (error) {
            console.error("⚠️ Error cargando la imagen del logo:", error);
        }

        // Encabezado
        doc
            .fontSize(22)
            .font("Helvetica-Bold")
            .text("Informe Diario de Ventas", { align: "center" })
            .moveDown(0.5);

        doc
            .fontSize(14)
            .font("Helvetica")
            .text(`Fecha de cierre: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, { align: "right" })
            .moveDown(0.5);

        // Línea separadora
        doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke().moveDown(1);

        // Sección de mesas cerradas
        doc.fontSize(16).font("Helvetica-Bold").text("Detalles de las mesas:", { underline: true }).moveDown(0.5);

        mesasCerradas.forEach((mesa) => {
            doc.fontSize(14).font("Helvetica-Bold").text(`Mesa ${mesa.numero}`, { continued: true })
                .font("Helvetica").text(` (Total: ${mesa.total?.toFixed(2)} €)`);
            doc.moveDown(0.3);

            // 📌 **Iterar sobre los pedidos y mostrar productos**
            if (Array.isArray(mesa.pedidos) && mesa.pedidos.length > 0) {
                doc.fontSize(12).font("Helvetica-Bold").text("Pedidos:");
                mesa.pedidos.forEach((pedido) => {
                    pedido.productos.forEach((producto) => {
                        doc.fontSize(12).font("Helvetica")
                            .text(`  - ${producto.producto?.nombre || "Producto desconocido"} x${producto.cantidad || 0} - ${producto.precioSeleccionado?.toFixed(2) || 0}€`, { indent: 20 });
                    });
                });
                doc.moveDown(0.3);
            } else {
                doc.fontSize(12).text("No hay pedidos registrados.").moveDown(0.3);
            }

            // 📌 **Iterar sobre las bebidas**
            if (Array.isArray(mesa.pedidoBebidas) && mesa.pedidoBebidas.length > 0) {
                doc.fontSize(12).font("Helvetica-Bold").text("Bebidas:");
                mesa.pedidoBebidas.forEach((pedido) => {
                    pedido.productos.forEach((producto) => {
                        doc.fontSize(12).font("Helvetica")
                            .text(`  - ${producto.producto?.nombre || "Bebida desconocida"} x${producto.cantidad || 0} - ${producto.precioSeleccionado?.toFixed(2) || 0}€`, { indent: 20 });
                    });
                });
                doc.moveDown(0.3);
            } else {
                doc.fontSize(12).text("No hay bebidas registradas.").moveDown(0.3);
            }

            // Métodos de pago
            doc.fontSize(12).font("Helvetica-Bold").text("Método de Pago:");
            doc.font("Helvetica").text(`  - Efectivo: ${mesa.metodoPago.efectivo?.toFixed(2) || 0} €`, { indent: 20 });
            doc.text(`  - Tarjeta: ${mesa.metodoPago.tarjeta?.toFixed(2) || 0} €`, { indent: 20 });
            if (mesa.metodoPago.propina) {
                doc.text(`  - Propina: ${mesa.metodoPago.propina?.toFixed(2) || 0} €`, { indent: 20 });
            }

            doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke().moveDown(1);
        });

        // Resumen de pagos
        doc.moveDown(1);
        doc.fontSize(16).font("Helvetica-Bold").text("Resumen de Métodos de Pago", { underline: true }).moveDown(0.5);
        doc.fontSize(14).text(`Efectivo: ${totalesMetodoPago.efectivo.toFixed(2)} €`);
        doc.text(`Tarjeta: ${totalesMetodoPago.tarjeta.toFixed(2)} €`);
        doc.text(`Propina: ${totalesMetodoPago.propina.toFixed(2)} €`).moveDown(1);

        // Total del día
        doc.fontSize(16).font("Helvetica-Bold").text(`TOTAL DEL DÍA: ${total.toFixed(2)} €`, { align: "right" });

        doc.end();
    });
};


export const enviarEmailConPDF = async (pdfBuffer) => {
  const form = new FormData();

  form.append('from', `Zabor Féten <no-reply@${MAILGUN_DOMAIN}>`);
  form.append('to', 'valentinoantenucci1@gmail.com');
  form.append('subject', 'Informe Diario - Cierre de Caja');
  form.append('text', 'Adjunto se encuentra el informe diario del cierre de caja.');

  form.append('attachment', pdfBuffer, {
    filename: `informe-diario-${new Date().toISOString().slice(0, 10)}.pdf`,
    contentType: 'application/pdf',
  });

  const apiUrl = `https://api.${MAILGUN_REGION}.mailgun.net/v3/${MAILGUN_DOMAIN}/messages`;

  try {
    await axios.post(apiUrl, form, {
      auth: {
        username: 'api',
        password: MAILGUN_API_KEY,
      },
      headers: form.getHeaders(),
    });
  } catch (err) {
    console.error('❌ Error al enviar correo con Mailgun:', err.response?.data || err);
  }
};