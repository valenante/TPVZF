import { useCallback } from "react";
import api from "../utils/api";

const useAccionesMesa = (mesa, setMensajeAlerta, navigate, datosFactura) => {
  const enviarAFacturaPrinter = useCallback(async (datosImpresion) => {
    try {
      await api.post(`/imprimir/${mesa._id}/imprimir-factura`, datosImpresion);
    } catch (error) {
      console.error("Error al imprimir la factura:", error);
    }
  }, [mesa]);

  const cerrarMesa = useCallback(async (metodoPago, tipoFactura = "simplificada") => {
    try {
      const response = await api.put(`/mesas/${mesa._id}/cerrar`, {
        metodoPago,
        clienteNombre: datosFactura?.nombre,
        clienteNIF: datosFactura?.nif,
      });

      const { datosImpresion } = response.data;

      if (tipoFactura === "nominativa" && datosImpresion) {
        await enviarAFacturaPrinter(datosImpresion);
      }

      navigate("/");
    } catch (error) {
      console.error(error);
      setMensajeAlerta({
        tipo: "error",
        mensaje: "Hubo un error al cerrar la mesa.",
      });
    }
  }, [mesa, datosFactura, navigate, enviarAFacturaPrinter, setMensajeAlerta]);

  const emitirFactura = useCallback(async (metodoPagoFactura) => {
    const pedidosNoFinalizados = mesa.pedidos.filter((p) => p.estado !== "listo");
    if (pedidosNoFinalizados.length > 0) {
      setMensajeAlerta({
        tipo: "error",
        mensaje: "No puedes emitir la factura. Todos los pedidos deben estar finalizados.",
      });
      return;
    }

    await cerrarMesa(metodoPagoFactura, "nominativa");
  }, [mesa, cerrarMesa, setMensajeAlerta]);

  const imprimirCuenta = useCallback(async () => {
    try {
      await api.post(`/cuenta/${mesa._id}/imprimir-cuenta`);
      setMensajeAlerta({
        tipo: "exito",
        mensaje: "Cuenta enviada a impresión.",
      });
    } catch (error) {
      setMensajeAlerta({
        tipo: "error",
        mensaje: error.response?.data?.error || "Hubo un problema.",
      });
    }
  }, [mesa, setMensajeAlerta]);

  return {
    cerrarMesa,
    emitirFactura,
    imprimirCuenta,
  };
};

export default useAccionesMesa;
