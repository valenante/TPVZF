import React, { useEffect, useState } from "react";
import api from "../../utils/api";
import Papa from "papaparse";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import AlertaMensaje from "../AlertaMensaje/AlertaMensaje";
import ModalConfirmacion from "../Modal/ModalConfirmacion";
import "./FacturasPage.css";

const FacturasPage = () => {
    const [facturas, setFacturas] = useState([]);
    const [filtroAnio, setFiltroAnio] = useState("");
    const [busqueda, setBusqueda] = useState("");
    const [mostrarModalConfirmacion, setMostrarModalConfirmacion] = useState(false);
    const [accionModal, setAccionModal] = useState(null);
    const [mensajeAlerta, setMensajeAlerta] = useState(null);
    const [paginaActual, setPaginaActual] = useState(1);
    const [totalPaginas, setTotalPaginas] = useState(1);

    const cargarFacturas = async (pagina = 1) => {
        try {
            const { data } = await api.get(`/facturas/facturas-encadenadas?page=${pagina}`);
            setFacturas(data.facturas);
            setTotalPaginas(data.totalPaginas);
            setPaginaActual(pagina);
        } catch (error) {
            console.error("Error al cargar facturas:", error);
        }
    };

    useEffect(() => {
        cargarFacturas();
    }, []);

    const iniciarRectificacion = (facturaId) => {
        setAccionModal({
            facturaId,
            paso: 1,
            datos: {},
            onConfirm: (valor) => manejarRectificacionPaso1(facturaId, valor)
        });
        setMostrarModalConfirmacion(true);
    };

    const manejarRectificacionPaso1 = (facturaId, nombre) => {
        setAccionModal({
            facturaId,
            paso: 2,
            datos: { clienteNombre: nombre },
            onConfirm: (valor) => manejarRectificacionPaso2(facturaId, nombre, valor)
        });
    };

    const manejarRectificacionPaso2 = (facturaId, nombre, nif) => {
        setAccionModal({
            facturaId,
            paso: 3,
            datos: { clienteNombre: nombre, clienteNIF: nif },
            onConfirm: (valor) => manejarRectificacionPaso3(facturaId, nombre, nif, valor)
        });
    };

    const manejarRectificacionPaso3 = (facturaId, nombre, nif, importe) => {
        setAccionModal({
            facturaId,
            paso: 4,
            datos: { clienteNombre: nombre, clienteNIF: nif, importeTotal: parseFloat(importe) },
            onConfirm: (motivo) => confirmarRectificacion(facturaId, nombre, nif, importe, motivo)
        });
    };

    const confirmarRectificacion = async (facturaId, nombre, nif, importe, motivo) => {
        try {
            const { data } = await api.post(`/facturas/rectificar/${facturaId}`, {
                clienteNombre: nombre,
                clienteNIF: nif,
                importeTotal: parseFloat(importe),
                motivo
            });

            setMensajeAlerta({
                tipo: "exito",
                mensaje: `Factura rectificativa emitida correctamente: Nº ${data.facturaRectificativa.numeroFactura}`
            });
            cargarFacturas();
        } catch (error) {
            console.error("Error al rectificar la factura:", error);
            setMensajeAlerta({
                tipo: "error",
                mensaje: error.response?.data?.error || "Hubo un problema al rectificar la factura."
            });
        } finally {
            setMostrarModalConfirmacion(false);
        }
    };

    const getMensajePaso = (paso) => {
        switch (paso) {
            case 1: return "Introduce el nuevo nombre o razón social:";
            case 2: return "Introduce el nuevo NIF o CIF:";
            case 3: return "Introduce el nuevo importe total (número):";
            case 4: return "Describe el motivo de la rectificación:";
            default: return "";
        }
    };

    const getPlaceholderPaso = (paso) => getMensajePaso(paso);

    const facturasFiltradas = facturas.filter(f =>
        (!filtroAnio || new Date(f.fechaExpedicion).getFullYear().toString() === filtroAnio) &&
        (
            f.numeroFactura.toLowerCase().includes(busqueda.toLowerCase()) ||
            (f.clienteNIF && f.clienteNIF.toLowerCase().includes(busqueda.toLowerCase())) ||
            (f.hash && f.hash.toLowerCase().includes(busqueda.toLowerCase())) ||
            (f.hashAnterior && f.hashAnterior.toLowerCase().includes(busqueda.toLowerCase()))
        )
    );

    const exportarCSV = () => {
        const csv = Papa.unparse(
            facturasFiltradas.map(f => ({
                numeroFactura: f.numeroFactura,
                fechaExpedicion: new Date(f.fechaExpedicion).toLocaleString(),
                clienteNombre: f.clienteNombre,
                clienteNIF: f.clienteNIF,
                importeTotal: f.importeTotal,
                hash: f.hash,
                hashAnterior: f.hashAnterior,
            }))
        );

        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "facturas.csv";
        link.click();
    };

    const exportarPDF = () => {
        const doc = new jsPDF({ orientation: "landscape" });
        doc.text("Facturas Encadenadas", 14, 20);

        autoTable(doc, {
            startY: 30,
            head: [["Número", "Fecha", "Cliente", "NIF", "Importe", "Hash", "Hash Anterior"]],
            body: facturasFiltradas.map(f => [
                f.numeroFactura,
                new Date(f.fechaExpedicion).toLocaleString(),
                f.clienteNombre || "-",
                f.clienteNIF || "-",
                `${f.importeTotal} €`,
                f.hash,
                f.hashAnterior
            ]),
            styles: {
                fontSize: 7,
                cellWidth: 'wrap',
                overflow: 'linebreak',
                halign: 'left',
                valign: 'middle'
            },
            columnStyles: {
                5: { cellWidth: 70 },
                6: { cellWidth: 70 }
            },
            headStyles: { fillColor: [41, 128, 185], textColor: 255 },
            theme: 'grid',
        });

        doc.save("facturas.pdf");
    };

    return (
        <div className="facturas-page">
            <h1>Visor de Facturas Encadenadas</h1>

            <div className="filtros-facturas">
                <label>Año:&nbsp;</label>
                <input
                    type="number"
                    value={filtroAnio}
                    onChange={(e) => setFiltroAnio(e.target.value)}
                    placeholder="Ej: 2025"
                />

                <label>Buscar:&nbsp;</label>
                <input
                    type="text"
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    placeholder="Buscar número, NIF o hash..."
                />

                <button onClick={exportarCSV}>Exportar CSV</button>
                <button onClick={exportarPDF}>Exportar PDF</button>
            </div>

            <table className="facturas-table">
                <thead>
                    <tr>
                        <th>Número</th>
                        <th>Fecha</th>
                        <th>Cliente</th>
                        <th>NIF</th>
                        <th>Importe</th>
                        <th>Hash</th>
                        <th>Hash Anterior</th>
                        <th>Acción</th>
                    </tr>
                </thead>
                <tbody>
                    {facturasFiltradas.map((f) => (
                        <tr key={f._id}>
                            <td>{f.numeroFactura}</td>
                            <td>{new Date(f.fechaExpedicion).toLocaleString()}</td>
                            <td>{f.clienteNombre || "-"}</td>
                            <td>{f.clienteNIF || "-"}</td>
                            <td>{f.importeTotal} €</td>
                            <td style={{ wordBreak: "break-word" }}>{f.hash}</td>
                            <td style={{ wordBreak: "break-word" }}>{f.hashAnterior}</td>
                            <td>
                                <button onClick={() => iniciarRectificacion(f._id)}>Rectificar</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="paginacion-facturas">
                <button
                    onClick={() => cargarFacturas(paginaActual - 1)}
                    disabled={paginaActual <= 1}
                >
                    Anterior
                </button>
                <span>Página {paginaActual} de {totalPaginas}</span>
                <button
                    onClick={() => cargarFacturas(paginaActual + 1)}
                    disabled={paginaActual >= totalPaginas}
                >
                    Siguiente
                </button>
            </div>

            {mostrarModalConfirmacion && (
                <ModalConfirmacion
                    titulo={`Paso ${accionModal.paso}`}
                    mensaje={getMensajePaso(accionModal.paso)}
                    placeholder={getPlaceholderPaso(accionModal.paso)}
                    onConfirm={(valor) => accionModal.onConfirm(valor)}
                    onClose={() => setMostrarModalConfirmacion(false)}
                />
            )}

            {mensajeAlerta && (
                <AlertaMensaje
                    tipo={mensajeAlerta.tipo}
                    mensaje={mensajeAlerta.mensaje}
                    onClose={() => setMensajeAlerta(null)}
                />
            )}
        </div>
    );
};

export default FacturasPage;
