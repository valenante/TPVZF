import React, { createContext, useEffect, useState } from "react";
import { io } from "socket.io-client";

export const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [cuentaSolicitada, setCuentaSolicitada] = useState(null); // Almacenar la solicitud de cuenta

  useEffect(() => {
    // Conectar al servidor de WebSocket
    const socket = io(process.env.REACT_APP_SOCKET_URL);
    setSocket(socket);

    // Escuchar el evento de cuenta solicitada
    socket.on("cuentaSolicitada", (data) => {
      console.log(`Evento recibido: Mesa ${data.numeroMesa} quiere la cuenta`);
      setCuentaSolicitada(data); // Actualizar el estado con la solicitud
    });

    // Limpiar la conexión al desmontar
    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, cuentaSolicitada, setCuentaSolicitada }}>
      {children}
    </SocketContext.Provider>
  );
};

