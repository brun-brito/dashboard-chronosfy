import React, { createContext, useState } from "react";

export const DashboardContext = createContext();

export const DashboardProvider = ({ children }) => {
  const [dadosDashboard, setDadosDashboard] = useState({
    events: [],
    horarioFuncionamento: {},
    nome: "",
    servicosDisponiveis: [],
    dadosProfissional: [],
  });

  return (
    <DashboardContext.Provider value={{ dadosDashboard, setDadosDashboard }}>
      {children}
    </DashboardContext.Provider>
  );
};
