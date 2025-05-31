import api from "../utils/api";

export const fetchMesas = async (setMesas) => {
  try {
    const { data } = await api.get("/mesas");
    setMesas(data);
  } catch (error) {
    console.error("Error al obtener las mesas:", error);
  }
};

export const abrirMesaConModal = (mesa, setAccionModal, setMesaSeleccionada, setMostrarModalConfirmacion, fetchMesas, navigate) => {
  setMesaSeleccionada(mesa);
  setAccionModal({
    titulo: "Abrir Mesa",
    mensaje: `¿Cuántos comensales hay en la mesa ${mesa.numero}?`,
    placeholder: "Número de comensales",
    onConfirm: async (comensalesInput) => {
      
      try {
        await api.put(`/mesas/mesas/${mesa._id}/abrir`, {
          comensales: Number(comensalesInput),
        });
        await fetchMesas();
        setMostrarModalConfirmacion(false);
        navigate(`/mesas/${mesa._id}`);
      } catch (error) {
        console.error("Error al abrir la mesa:", error);
      }
    },
  });
  setMostrarModalConfirmacion(true);
};
