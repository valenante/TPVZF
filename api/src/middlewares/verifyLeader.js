import Mesa from "../models/Mesa.js";
import MesaCerrada from "../models/MesaCerrada.js";

const verifyLeader = async (req, res, next) => {
    const { mesa } = req.query; // O req.body si el ID está en el cuerpo
    const tokenHeader = req.headers["x-token-lider"];
  
    try {
      const mesaDoc = await Mesa.findOne({ numero: mesa });
      if (!mesaDoc || mesaDoc.tokenLider !== tokenHeader) {
        return res.status(403).json({ error: "No tienes permisos para esta acción" });
      }
      next();
    } catch (error) {
      console.error("Error al verificar el tokenLider:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  };

  export default verifyLeader;