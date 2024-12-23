import React, { useState } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { modalStyles, modalContentStyles } from "../context/EstilosModais";
import "moment/locale/pt-br";

const localizer = momentLocalizer(moment);

const Agenda = ({ events, horarioFuncionamento }) => {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [view, setView] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());

  const removeAcentos = (str) => {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  };

  // Função para obter os horários min e max com base no dia atual exibido
  const getMinMaxTimes = (date) => {
    const day = removeAcentos(moment(date).format("ddd").toLowerCase());
    const horarioHoje = horarioFuncionamento[day] || null;
    const min = horarioHoje ? moment(horarioHoje[0], "HH:mm").toDate() : moment("08:00", "HH:mm").toDate();
    const max = horarioHoje ? moment(horarioHoje[1], "HH:mm").toDate() : moment("18:00", "HH:mm").toDate();

    return { min, max };
  };

  const { min, max } = getMinMaxTimes(currentDate);

  const dayPropGetter = (date) => {
    const day = removeAcentos(moment(date).format("ddd").toLowerCase());
    const horarioHoje = horarioFuncionamento[day] || null;
    const isPast = moment(date).isBefore(moment(), "day");

    if (!horarioHoje || isPast) {
      return {
        style: {
          backgroundColor: "#d3d3d3",
          color: "#721c24",
        },
      };
    }

    return {
      style: {
        backgroundColor: "#ffffff", // Branco para dias disponíveis
        color: "#000000", // Texto padrão
      },
    };
  };

  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedEvent(null);
  };

  const eventStyleGetter = (event) => {
    const now = new Date();
    const isPast = event.end < now;

    return {
      style: {
        backgroundColor: isPast ? "#f8d7da" : "#3174ad",
        color: isPast ? "#721c24" : "#fff",
        border: isPast ? "1px solid #f5c6cb" : "1px solid #ddd",
        borderRadius: "4px",
        marginLeft: view === "week" ? "5px" : "0px",
      },
    };
  };

  return (
    <div style={{ height: "500px" }}>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 500 }}
        min={min} // Ajusta o horário mínimo dinamicamente
        max={max} // Ajusta o horário máximo dinamicamente
        onSelectEvent={handleEventClick}
        onNavigate={(date) => setCurrentDate(date)} // Atualiza a data ao navegar
        eventPropGetter={eventStyleGetter}
        onView={(newView) => {
          setView(newView);
        }}
        dayPropGetter={dayPropGetter}
        messages={{
          date: "Data",
          time: "Hora",
          event: "Evento",
          allDay: "Dia Inteiro",
          week: "Semana",
          work_week: "Dias Úteis",
          day: "Dia",
          month: "Mês",
          previous: "Anterior",
          next: "Próximo",
          today: "Hoje",
          agenda: "Agenda",
          noEventsInRange: "Nenhum evento neste intervalo.",
        }}
      />

      {showModal && selectedEvent && (
        <div style={modalStyles}>
          <div style={modalContentStyles}>
            <h2>Detalhes do Evento</h2>
            <p className="testeBruno">
              <strong>Cliente:</strong> {selectedEvent.nome || "-"}
            </p>
            <p>
              <strong>Serviço(s):</strong> {selectedEvent.servicos?.join(", ") || "-"}
            </p>
            <p>
              <strong>Valor:</strong> R$ {selectedEvent.valor.toFixed(2) || "-"}
            </p>
            <p>
              <strong>Início:</strong> {moment(selectedEvent.start).format("HH:mm") || "-"}
            </p>
            <p>
              <strong>Fim:</strong> {moment(selectedEvent.end).format("HH:mm") || "-"}
            </p>
            <p>
              <strong>Obs.:</strong> {selectedEvent.observacao || "-"}
            </p>
            <button onClick={closeModal} style={{ marginTop: "10px" }}>
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Agenda;
