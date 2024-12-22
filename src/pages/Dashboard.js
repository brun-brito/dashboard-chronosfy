import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import Agenda from "../components/Agenda";
import api from "../services/Api";

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const [events, setEvents] = useState([]);
  const [horarioFuncionamento, setHorarioFuncionamento] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Buscar agendamentos
        const agendamentosResponse = await api.get(`/v1/profissional/${user.uid}/agendamentos`);
        const formattedEvents = agendamentosResponse.data.map((event) => {
          const start = new Date(event.horario?.[0]);
          const end = new Date(event.horario?.[1]);
          const title = `${event.nome} - ${event.servicos.join(", ")}`;
          return { ...event, title, start, end };
        });
        setEvents(formattedEvents);

        // Buscar horário de funcionamento
        const profissionalResponse = await api.get(`/v1/profissional/${user.uid}`);
        setHorarioFuncionamento(profissionalResponse.data.horario_funcionamento || {});
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      }
    };

    fetchData();
  }, [user]);

  return (
    <div>
      <h1>Bem-vindo, {user?.displayName || "Profissional"}</h1>
      <button onClick={logout}>Sair</button>
      {/* Passar os dados para o componente Agenda */}
      <Agenda events={events} horarioFuncionamento={horarioFuncionamento} />
    </div>
  );
};

export default Dashboard;