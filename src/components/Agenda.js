import React, { useState } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { modalStyles, modalContentStyles } from "../context/EstilosModais";
import "moment/locale/pt-br";
import api from "../services/Api";
import styles from "../assets/Agenda.module.css";

const localizer = momentLocalizer(moment);

const Agenda = ({ events, horarioFuncionamento, idUser, dadosProfissional }) => {  
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showServicosModal, setShowServicosModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedEvent, setEditedEvent] = useState(null);
  const [view, setView] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [mostrarTodos, setMostrarTodos] = useState(false);
  const [loading, setLoading] = useState(false); // Para mostrar o loading
  const [message, setMessage] = useState(""); // Para mensagens de erro ou sucesso

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
    setEditedEvent({ ...event }); // Copiar dados para edição
    setShowModal(true);
    setIsEditing(false); // Sempre começar em modo de visualização
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedEvent(null);
    setIsEditing(false);
  };

  const toggleServicoSelection = (servico) => {
    setEditedEvent((prev) => {
      const alreadySelected = prev.servicos.includes(servico.nome);
      const updatedServicos = alreadySelected
        ? prev.servicos.filter((s) => s !== servico.nome)
        : [...prev.servicos, servico.nome];
      return { ...prev, servicos: updatedServicos };
    });
  };

  const openServicosModal = () => {
    setShowServicosModal(true);
  };

  const closeServicosModal = () => {
    setShowServicosModal(false);
  };

  const handleSave = async () => {
    setLoading(true); // Iniciar o loading
    setMessage(""); // Limpar mensagens anteriores
    try {
      const inicioDate = new Date(editedEvent.horario.inicio._seconds * 1000);
      const adjustedDate = new Date(inicioDate.getTime() - 3 * 60 * 60 * 1000); // Subtrair 3 horas (UTC-3)
  
      const formattedEvent = {
        nome: editedEvent?.nome,
        servicos: editedEvent?.servicos,
        observacao: editedEvent?.observacao || "-",
        horario: [
          adjustedDate
            .toISOString()
            .replace("Z", ""),
        ],
      };
  
      await api.put(
        `/v1/profissional/${idUser}/agendamentos/${selectedEvent.id}`,
        formattedEvent
      );
  
      setMessage("Alterações salvas com sucesso!");
      window.location.reload()
    } catch (error) {
      console.error("Erro ao salvar as alterações:", error);
      setMessage("Erro ao salvar as alterações. Tente novamente.");
    } finally {
      setLoading(false); // Finalizar o loading
    }
  };  

  const handleInputChange = (field, value) => {
    setEditedEvent((prev) => ({ ...prev, [field]: value }));
  };

  const handleDelete = async () => {
    setLoading(true); // Iniciar o loading
    setMessage(""); // Limpar mensagens anteriores
    try {
      await api.delete(
        `/v1/profissional/${idUser}/agendamentos/${selectedEvent.id}`
      );
      setMessage("Agendamento excluído com sucesso!");
      window.location.reload()
    } catch (error) {
      console.error("Erro ao excluir o agendamento:", error);
      setMessage("Erro ao excluir o agendamento. Tente novamente.");
    } finally {
      setLoading(false); // Finalizar o loading
    }
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
          previous: "◄ Anterior",
          next: "Próximo ►",
          today: "Hoje",
          agenda: "Agenda",
          noEventsInRange: "Nenhum evento neste intervalo.",
        }}
      />

        {showModal && selectedEvent && (
          <div style={modalStyles}>
            <div style={modalContentStyles}>
              <h2>Detalhes do Evento</h2>
              {isEditing ? (
                <>
                  <label>
                    Cliente:
                    <input
                      type="text"
                      value={editedEvent.nome}
                      onChange={(e) => handleInputChange("nome", e.target.value)}
                    />
                  </label>

                  <label>Data*:</label>
                    <input
                      type="date"
                      name="data"
                      value={
                        editedEvent?.horario?.inicio?._seconds
                          ? moment(editedEvent.horario.inicio._seconds * 1000).format("YYYY-MM-DD") // Manter a data atual
                          : ""
                      }
                      onChange={(e) => {
                        const newDate = e.target.value; // Nova data selecionada
                        const currentTime =
                          editedEvent?.horario?.inicio?._seconds
                            ? moment(editedEvent.horario.inicio._seconds * 1000).format("HH:mm") // Preservar a hora existente
                            : "00:00";

                        if (newDate) {
                          const newDateTime = new Date(`${newDate}T${currentTime}`);

                          setEditedEvent((prev) => ({
                            ...prev,
                            horario: {
                              ...prev.horario,
                              inicio: {
                                _seconds: Math.floor(newDateTime.getTime() / 1000),
                                _nanoseconds: 0,
                              },
                            },
                          }));
                        }
                      }}
                      required
                    />

                    <label>Horário de Início*:</label>
                    <input
                      type="time"
                      name="start"
                      value={
                        editedEvent?.horario?.inicio?._seconds
                          ? moment(editedEvent.horario.inicio._seconds * 1000).format("HH:mm") // Manter o horário atual
                          : ""
                      }
                      onChange={(e) => {
                        const newTime = e.target.value; // Novo horário selecionado
                        const currentDate =
                          editedEvent?.horario?.inicio?._seconds
                            ? moment(editedEvent.horario.inicio._seconds * 1000).format("YYYY-MM-DD") // Preservar a data existente
                            : moment().format("YYYY-MM-DD"); // Valor padrão se ausente

                        if (newTime) {
                          const newDateTime = new Date(`${currentDate}T${newTime}`);

                          setEditedEvent((prev) => ({
                            ...prev,
                            horario: {
                              ...prev.horario,
                              inicio: {
                                _seconds: Math.floor(newDateTime.getTime() / 1000),
                                _nanoseconds: 0,
                              },
                            },
                          }));
                        }
                      }}
                      required
                    />

                    <label>
                      Serviço(s):
                      <button onClick={openServicosModal}>
                        Selecionar Serviços
                      </button>
                    </label>
                    <p>Serviços Selecionados: {editedEvent.servicos.join(", ")}</p>
                  </>
                ) : (
                  <>
                    <p>
                      <strong>Cliente:</strong> {selectedEvent.nome || "-"}
                    </p>
                    <p>
                      <strong>Serviço(s):</strong> {selectedEvent.servicos?.join(", ") || "-"}
                    </p>
                    <p>
                      <strong>Valor:</strong> R$ {selectedEvent.valor.toFixed(2) || "-"}
                    </p>
                    <p>
                      <strong>Data:</strong> {moment(selectedEvent.horario.inicio._seconds * 1000).format("DD/MM/YYYY") || "-"}
                    </p>
                    <p>
                      <strong>Início:</strong> {moment(selectedEvent.horario.inicio._seconds * 1000).format("HH:mm") || "-"}
                    </p>
                    <p>
                      <strong>Fim:</strong> {moment(selectedEvent.horario.fim._seconds * 1000).format("HH:mm") || "-"}
                    </p>
                    <p>
                      <strong>Obs.:</strong> {selectedEvent.observacao || "-"}
                    </p>
                  </>
                )}<div style={{ marginTop: "10px" }}>
                {isEditing ? (
                    <button onClick={handleSave} style={{ marginRight: "10px" }}>
                      Salvar
                    </button>
                  ) : (
                    <button onClick={() => setIsEditing(true)} style={{ marginRight: "10px" }}>
                      Editar
                    </button>
                  )}
                <button onClick={closeModal}>Fechar</button>
                {!isEditing && (
                  <button
                    onClick={handleDelete}
                    style={{
                      marginLeft: "10px",
                      backgroundColor: "red",
                      color: "white",
                    }}
                  >
                    Excluir
                  </button>
                )}
                </div>
              </div>
            </div>
          )}

        {showServicosModal && (
          <div style={modalStyles}>
            <div style={modalContentStyles}>
              <h2>Selecionar Serviços</h2>
              <div className={styles.checkboxList}>
                {(mostrarTodos ? dadosProfissional.servicos : dadosProfissional.servicos.slice(0, 4)).map(
                  (servico, index) => (
                    <div key={servico.id || index} className={styles.checkboxItem}>
                      <input
                        type="checkbox"
                        id={`servico-${servico.id || index}`}
                        checked={editedEvent.servicos.includes(servico.nome)}
                        onChange={() => toggleServicoSelection(servico)}
                        className={styles.checkbox}
                      />
                      <label
                        htmlFor={`servico-${servico.id || index}`}
                        className={styles.checkboxLabel}
                      >
                        {servico.nome} (R$ {servico.valor}, {servico.tempo_estimado} min)
                      </label>
                    </div>
                  )
                )}
              </div>
              {dadosProfissional.servicos.length > 4 && (
                <button
                  type="button"
                  className={styles.verMaisBtn}
                  onClick={() => setMostrarTodos((prev) => !prev)}
                >
                  {mostrarTodos ? "▲ Ver menos" : "▼ Ver mais"}
                </button>
              )}
              <button onClick={closeServicosModal} style={{ marginTop: "10px" }}>
                Fechar
              </button>
            </div>
          </div>
        )}

        {loading && (
          <div className={styles.loadingOverlay}>
            <div className={styles.spinner}></div>
            {/* <p>Processando...</p> */}
          </div>
        )}

        {message && (
          <div className={styles.messageOverlay}>
            <p>{message}</p>
          </div>
        )}

    </div>
  );
};

export default Agenda;