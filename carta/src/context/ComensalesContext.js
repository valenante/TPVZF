import { createContext, useContext, useState } from "react";

const ComensalContext = createContext();

export const ComensalProvider = ({ children }) => {
  const [comensal, setComensal] = useState(() => {
    const nombre = localStorage.getItem("nombreComensal") || "";
    const alergias = localStorage.getItem("alergiasComensal") || "";
    const esLider = localStorage.getItem("esLider") === "true";
    const comensales = localStorage.getItem("comensales");
    return {
      nombre,
      alergias,
      esLider,
      comensales: comensales ? Number(comensales) : null,
    };
  });

  const actualizarComensal = (nuevoComensal) => {
    setComensal(nuevoComensal);
    localStorage.setItem("nombreComensal", nuevoComensal.nombre || "");
    localStorage.setItem("alergiasComensal", nuevoComensal.alergias || "");
    localStorage.setItem("esLider", nuevoComensal.esLider ? "true" : "false");
    localStorage.setItem("comensales", nuevoComensal.comensales?.toString() || "");
  };

  return (
    <ComensalContext.Provider value={{ comensal, setComensal, actualizarComensal }}>
      {children}
    </ComensalContext.Provider>
  );
};

export const useComensal = () => useContext(ComensalContext);
