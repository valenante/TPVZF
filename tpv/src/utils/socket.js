import React, { createContext, useEffect, useState } from "react";
import { io } from "socket.io-client";

export const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [cuentaSolicitada, setCuentaSolicitada] = useState(null); // Almacenar la solicitud de cuenta

  useEffect(() => {
    if (!socket) {
      // Solo crear una conexión si no existe
      const socketInstance = io(process.env.REACT_APP_SOCKET_URL, {
        transports: ["websocket"],
        reconnectionAttempts: 5, // Limita los intentos de reconexión
        reconnectionDelay: 1000, // Tiempo entre intentos
      });
      
      setSocket(socketInstance);

      // Escuchar eventos
      socketInstance.on("cuentaSolicitada", (data) => {
        setCuentaSolicitada(data); // Actualizar el estado con la solicitud
      });

      // Desconectar al desmontar
      return () => {
        socketInstance.disconnect();
      };
    }
  }, []);

  return (
    <SocketContext.Provider value={{ socket, cuentaSolicitada, setCuentaSolicitada }}>
      {children}
    </SocketContext.Provider>
  );
};
