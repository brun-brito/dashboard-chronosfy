import React, { useState } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { parse } from "date-fns";
import "moment/locale/pt-br";
import { modalStyles, modalContentStyles } from "../context/EstilosModais";

const localizer = momentLocalizer(moment);

const messages = {
  date: "Data",
  time: "Hora",
  event: "Evento",
  allDay: "Dia Inteiro",
  week: "Semana",
  work_week: "Dias Úteis",
  day: "Dia",
  month: "Mês",
  previous: "◄ Anterior",
  next: "Próximo ►",
  today: "Hoje",
  agenda: "Agenda",
  noEventsInRange: "Nenhum evento neste intervalo.",
};

const Agenda = () => {
  const [events, setEvents] = useState([
    {
      cliente: "Joanna Ferreira",
      servicos: ["corte", "barba", "sobrancelha"],
      start: new Date("2024-12-19T10:00:00"),
      end: new Date("2024-12-19T11:00:00"),
      desc: "Corte masculino simples com finalização",
      valor: 30.0,
      title: "Joanna Ferreira - corte, barba, sobrancelha", // Gerado manualmente
    },
    {
      cliente: "Joanna Ferreira",
      servicos: ["corte", "barba", "sobrancelha"],
      start: new Date("2024-12-18T10:00:00"),
      end: new Date("2024-12-18T11:00:00"),
      desc: "Corte masculino simples com finalização",
      valor: 30.0,
      title: "Joanna Ferreira - corte, barba, sobrancelha", // Gerado manualmente
    },
    {
      cliente: "Maria Silva",
      servicos: ["manicure", "esmaltação"],
      start: new Date("2024-12-19T17:00:00"),
      end: new Date("2024-12-19T17:45:00"),
      desc: "Manicure completa com esmaltação",
      valor: 50.0,
      title: "Maria Silva - manicure, esmaltação", // Gerado manualmente
    },
    {
      cliente: "Carlos Souza",
      servicos: ["massagem relaxante"],
      start: new Date("2024-12-20T09:00:00"),
      end: new Date("2024-12-20T10:30:00"),
      desc: "Sessão de massagem relaxante com aromaterapia",
      valor: 120.0,
      title: "Carlos Souza - massagem relaxante", // Gerado manualmente
    },
    {
      cliente: "Fernanda Santos",
      servicos: ["limpeza de pele", "hidratação facial"],
      start: new Date("2024-12-20T13:00:00"),
      end: new Date("2024-12-20T14:30:00"),
      desc: "Procedimento de limpeza e hidratação profunda",
      valor: 80.0,
      title: "Fernanda Santos - limpeza de pele, hidratação facial", // Gerado manualmente
    },
    {
      cliente: "João Almeida",
      servicos: ["corte", "lavagem"],
      start: new Date("2024-12-23T08:00:00"),
      end: new Date("2024-12-23T08:30:00"),
      desc: "Corte masculino com lavagem e finalização",
      valor: 40.0,
      title: "João Almeida - corte, lavagem", // Gerado manualmente
    },
    {
      cliente: "João Almeida",
      servicos: ["corte", "lavagem"],
      start: new Date("2024-12-23T09:00:00"),
      end: new Date("2024-12-23T09:30:00"),
      desc: "Corte masculino com lavagem e finalização",
      valor: 40.0,
      title: "João Almeida - corte, lavagem", // Gerado manualmente
    },
    {
      cliente: "João Almeida",
      servicos: ["corte", "lavagem"],
      start: new Date("2024-12-23T10:00:00"),
      end: new Date("2024-12-23T10:30:00"),
      desc: "Corte masculino com lavagem e finalização",
      valor: 40.0,
      title: "João Almeida - corte, lavagem", // Gerado manualmente
    },
    {
      cliente: "João Almeida",
      servicos: ["corte", "lavagem"],
      start: new Date("2024-12-23T11:00:00"),
      end: new Date("2024-12-23T11:30:00"),
      desc: "Corte masculino com lavagem e finalização",
      valor: 40.0,
      title: "João Almeida - corte, lavagem", // Gerado manualmente
    },
    {
      cliente: "João Almeida",
      servicos: ["corte", "lavagem"],
      start: new Date("2024-12-23T12:00:00"),
      end: new Date("2024-12-23T12:30:00"),
      desc: "Corte masculino com lavagem e finalização",
      valor: 40.0,
      title: "João Almeida - corte, lavagem", // Gerado manualmente
    },
    {
      cliente: "João Almeida",
      servicos: ["corte", "lavagem"],
      start: new Date("2024-12-23T13:00:00"),
      end: new Date("2024-12-23T13:30:00"),
      desc: "Corte masculino com lavagem e finalização",
      valor: 40.0,
      title: "João Almeida - corte, lavagem", // Gerado manualmente
    },
    {
      cliente: "João Almeida",
      servicos: ["corte", "lavagem"],
      start: new Date("2024-12-23T14:00:00"),
      end: new Date("2024-12-23T14:30:00"),
      desc: "Corte masculino com lavagem e finalização",
      valor: 40.0,
      title: "João Almeida - corte, lavagem", // Gerado manualmente
    },
  ]);  

  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [view, setView] = useState(null);

  const dayPropGetter = (date) => {
    const isPast = moment(date).isBefore(moment(), "day");
    if (isPast) {
      return {
        style: {
          backgroundColor: "#f0f0f0",
          color: "#9e9e9e",
        },
      };
    }
    return {};
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

  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedEvent(null);
  };

  return (
    <div style={{ height: "500px" }}>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 500 }}
        min={parse("08:00", "HH:mm", new Date())}
        max={parse("18:00", "HH:mm", new Date())}
        dayPropGetter={dayPropGetter}
        onSelectEvent={handleEventClick}
        eventPropGetter={eventStyleGetter}
        onView={(newView) => {setView(newView)}}
        messages={messages}
        
      />

      {showModal && selectedEvent && (
        <div style={modalStyles}>
          <div style={modalContentStyles}>
            <h2>Detalhes do Evento</h2>
            <p><strong>Cliente:</strong> {selectedEvent.cliente || "-"}</p>
            <p><strong>Serviço(s):</strong> {selectedEvent.servicos?.join(", ") || "-"}</p>
            <p><strong>Valor:</strong> R$ {selectedEvent.valor.toFixed(2) || "-"}</p>
            <p><strong>Início:</strong> {moment(selectedEvent.start).format("HH:mm") || "-"}</p>
            <p><strong>Fim:</strong> {moment(selectedEvent.end).format("HH:mm") || "-"}</p>
            <p><strong>Obs.:</strong> {selectedEvent.desc || "-"}</p>
            <button onClick={closeModal} style={{ marginTop: "10px" }}>Fechar</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Agenda;
