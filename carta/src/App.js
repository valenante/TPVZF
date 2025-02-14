import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ProductosProvider } from './context/ProductosContext';
import { LanguageProvider } from "./context/LanguageContext"; // 👈 Importamos el contexto
import { ToastContainer } from "react-toastify";
import CartaPage from './pages/CartaPage';
import PreMenu from './components/PreMenu/PreMenu';
import Valoraciones from './pages/Valoraciones.js';
import { I18nProvider } from "@lingui/react";
import { i18n } from "@lingui/core";
import { messages as enMessages } from "./locales/en/messages";
import { messages as esMessages } from "./locales/es/messages";
import { MesasProvider } from './context/MesasContext';

// Configuración de idiomas
const locales = {
  en: enMessages,
  es: esMessages,
};

function App() {
  // Cargar idioma desde localStorage o usar "es" por defecto
  const storedLocale = localStorage.getItem("locale") || "es";
  const [locale, setLocale] = useState(storedLocale);

  useEffect(() => {
    // Cargar mensajes y activar idioma
    i18n.load({ [locale]: locales[locale] });
    i18n.activate(locale);
  }, [locale]);

  // Cambiar idioma y guardarlo en localStorage
  const cambiarIdioma = (nuevoIdioma) => {
    i18n.load({ [nuevoIdioma]: locales[nuevoIdioma] });
    i18n.activate(nuevoIdioma);
    setLocale(nuevoIdioma);
    localStorage.setItem("locale", nuevoIdioma); // Guardar selección en localStorage
  };

  return (
    <I18nProvider i18n={i18n}>
      <LanguageProvider>
        <Router>
          <MesasProvider>
            <ProductosProvider>
              <Routes>
                <Route path="/:numeroMesa" element={<CartaPage />} />
                <Route path="/preMenu" element={<PreMenu />} />
                <Route path="/valoraciones" element={<Valoraciones />} />
              </Routes>
            </ProductosProvider>
            <ToastContainer />
          </MesasProvider>
        </Router>
      </LanguageProvider>
    </I18nProvider>
  );
}

export default App;
