import React from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import DetalleMesa from "./pages/DetallesMesa";
import DetallePedido from "./components/DetallesPedido";
import ProductsMenu from "./pages/ProductsMenu";
import { ProductosProvider } from "./context/ProductosContext";
import Cocina from "./components/Cocina/Cocina";
import Barra from "./components/Barra/Barra";
import { CategoriasProvider } from "./context/CategoriasContext";
import EstadisticasPage from "./pages/EstadisticasPage";
import Login from "./pages/Login";
import RutaProtegida from "./components/RutaProtegida/RutaProtegida";
import Usuarios from "./pages/Usuarios";
import Facturas from "./components/Facturas/FacturasPage";
import Eliminacion from "./pages/Eliminaciones/Eliminaciones";
import CajaDiaria from "./components/CajaDiaria/CajaDiaria";
import MesasCerradas from "./components/MesasCerradas/MesasCerradas";
import { SocketProvider } from "./utils/socket";
import CuentaPopup from "./components/CuentaPopUp/CuentaPopUp";
import Navbar from "./components/Navbar/Navbar";
import { AuthProvider } from "./context/AuthContext";
import { ImagesProvider } from "./context/ImagesContext";
import ReservasPage from "./pages/Reservas";

const AppContent = () => {
  const location = useLocation();

  // Define the routes where the Navbar should not appear
  const rutasSinNavbar = ["/barra", "/cocina", "/login", "/register"];
  const mostrarNavbar = !rutasSinNavbar.includes(location.pathname);

  return (
    <>
      <CuentaPopup />
      {mostrarNavbar && <Navbar />}
      <Routes>
      {/* Rutas públicas */}
        <Route
          path="/"
          element={
            <RutaProtegida rolesPermitidos={["admin", "camarero"]}>
              <Dashboard />
            </RutaProtegida>
          }
        />

        {/* Rutas protegidas */}
        <Route
          path="/mesas/:id"
          element={
            <RutaProtegida rolesPermitidos={["admin", "camarero"]}>
              <DetalleMesa />
            </RutaProtegida>
          }
        />
        <Route
          path="/mesas-cerradas"
          element={
            <RutaProtegida rolesPermitidos={["admin"]}>
              <MesasCerradas />
            </RutaProtegida>
          }
        />
        <Route
          path="/facturas"
          element={
            <RutaProtegida rolesPermitidos={["admin"]}>
              <Facturas />
            </RutaProtegida>
          }
        />
        <Route
          path="/cajaDiaria"
          element={
            <RutaProtegida rolesPermitidos={["admin"]}>
              <CajaDiaria />
            </RutaProtegida>
          }
        />
        <Route
          path="/pedidos/:id"
          element={
            <RutaProtegida rolesPermitidos={["admin", "camarero"]}>
              <DetallePedido />
            </RutaProtegida>
          }
        />
        <Route
          path="/products/"
          element={
            <RutaProtegida rolesPermitidos={["admin"]}>
              <ProductsMenu />
            </RutaProtegida>
          }
        />
        <Route
          path="/cocina"
          element={
            <RutaProtegida rolesPermitidos={["admin", "cocinero"]}>
              <Cocina />
            </RutaProtegida>
          }
        />
        <Route
          path="/barra"
          element={
            <RutaProtegida rolesPermitidos={["admin", "bartender"]}>
              <Barra />
            </RutaProtegida>
          }
        />
        <Route
          path="/estadisticas"
          element={
            <RutaProtegida rolesPermitidos={["admin"]}>
              <EstadisticasPage />
            </RutaProtegida>
          }
        />
        <Route
          path="/eliminaciones"
          element={
            <RutaProtegida rolesPermitidos={["admin"]}>
              <Eliminacion />
            </RutaProtegida>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route
          path="*"
          element={
            <RutaProtegida rolesPermitidos={["admin"]}>
              <Usuarios />
            </RutaProtegida>
          }
        />
        <Route path="/reservas" element={<ReservasPage />} />
        </Routes>
      </>
  );
};

const App = () => {
  return (
    <BrowserRouter basename="/tpv">
      <AuthProvider>
        <ImagesProvider>
          <SocketProvider>
            <CategoriasProvider>
              <ProductosProvider>
                <AppContent />
              </ProductosProvider>
            </CategoriasProvider>
          </SocketProvider>
        </ImagesProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
