import React, { createContext, useState } from "react";

export const PerfilContext = createContext();

export const PerfilProvider = ({ children }) => {
  const [dadosUsuario, setDadosUsuario] = useState(null);

  return (
    <PerfilContext.Provider value={{ dadosUsuario, setDadosUsuario }}>
      {children}
    </PerfilContext.Provider>
  );
};
