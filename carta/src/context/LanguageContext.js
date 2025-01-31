import React, { createContext, useState, useEffect } from "react";
import { i18n } from "@lingui/core";
import { messages as enMessages } from "../locales/en/messages";
import { messages as esMessages } from "../locales/es/messages";

export const LanguageContext = createContext();

const locales = {
  en: enMessages,
  es: esMessages,
};

export const LanguageProvider = ({ children }) => {
  const storedLocale = localStorage.getItem("locale") || "es";
  const [locale, setLocale] = useState(storedLocale);

  useEffect(() => {
    i18n.load({ [locale]: locales[locale] });
    i18n.activate(locale);
  }, [locale]);

  const cambiarIdioma = (nuevoIdioma) => {
    i18n.load({ [nuevoIdioma]: locales[nuevoIdioma] });
    i18n.activate(nuevoIdioma);
    setLocale(nuevoIdioma);
    localStorage.setItem("locale", nuevoIdioma);
  };

  return (
    <LanguageContext.Provider value={{ locale, cambiarIdioma }}>
      {children}
    </LanguageContext.Provider>
  );
};
