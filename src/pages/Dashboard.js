import React from "react";
import Agenda from "../components/Agenda";

const Dashboard = () => {
  const profissionalId = "ID_DO_PROFISSIONAL"; // Substituir com ID real

  return (
    <div>
      <h1>Agenda do Profissional</h1>
      <Agenda profissionalId={profissionalId} />
    </div>
  );
};

export default Dashboard;