import React, { useState } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "moment/locale/pt-br";
import api from "../services/Api";
import styles from "../assets/Agenda.module.css";
import { FaEdit, FaTrash, FaSave, FaTimes, FaCheck, FaCalendarAlt } from "react-icons/fa";

const localizer = momentLocalizer(moment);

const Agenda = ({ events, horarioFuncionamento, idUser, dadosProfissional }) => {  
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showServicosModal, setShowServicosModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedEvent, setEditedEvent] = useState(null);
  const getDefaultView = () => (window.innerWidth <= 768 ? "day" : "month");
  const [view, setView] = useState(getDefaultView());
  const [currentDate, setCurrentDate] = useState(new Date());
  const [mostrarTodos, setMostrarTodos] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  // const [calendarHeight, setCalendarHeight] = useState(
  //   window.innerWidth <= 768 ? "100vh" : "550px"
  // );
  const [fontSize] = useState(window.innerWidth <= 768 ? "0.8em" : "1em");

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
    // const isPast = moment(date).isBefore(moment(), "day");

    if (!horarioHoje) {
      return {
        style: {
          backgroundColor: "#d3d3d3",
          color: "#721c24",
          border: "1px solid #e0e0e0",
          padding: "5px",
          minHeight: "80px",
        },
      };
    }

    return {
      style: {
        border: "1px solid #e0e0e0",
        padding: "5px",
        minHeight: "80px",
      },
    };
  };

const handleEventClick = (event) => {
    setSelectedEvent(event);
    setEditedEvent({ ...event }); // Copiar dados para edição
    setShowModal(true);
    setIsEditing(false); // Sempre começar em modo de visualização
  };

  const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

  const getFormattedTitle = () => {
    if (view === "month") {
      return moment(currentDate).format("MMMM YYYY");
    } 
    
    else if (view === "week") {
      const startOfWeek = moment(currentDate).startOf("week").format("DD/MM");
      const endOfWeek = moment(currentDate).endOf("week").format("DD/MM");
      return `${startOfWeek} - ${endOfWeek}`;
    } 
    
    else if (view === "day") {
      return capitalize(moment(currentDate).format("dddd, DD [de] MMM"));
    } 
    
    else if (view === "agenda") {
      const startDate = moment(currentDate).format("DD/MM/YYYY");
      const endDate = moment(currentDate).add(1, "month").subtract(1, "day").format("DD/MM/YYYY");
      return `${startDate} – ${endDate}`;
    } 
    
    else {
      return "Agenda";
    }
  };

  const handleNavigation = (direction) => {
    const unit =
      view === "month"
        ? "months"
        : view === "week"
        ? "weeks"
        : view === "agenda"
        ? "days"
        : "days";
  
    const increment = view === "agenda" ? 30 : 1;
  
    const newDate =
      direction === "prev"
        ? moment(currentDate).subtract(increment, unit).toDate()
        : moment(currentDate).add(increment, unit).toDate();
  
    setCurrentDate(newDate);
  };
  
  const goToToday = () => {
    setCurrentDate(new Date());
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
        id: editedEvent?.id,
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
      console.error("Erro ao salvar as alterações:", error.response.data.error);
      setMessage(`Erro ao salvar as alterações: ${error.response.data.error}`);
    } finally {
      setLoading(false);
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
    // const isPast = event.end < now;

    return {
      style: {
        backgroundColor: event.end < now ? "#f8d7da" : "#3174ad",
        color: event.end < now ? "#721c24" : "#fff",
        borderRadius: "8px",
        padding: "5px",
        margin: "5px 0",
      },
    };
  };

  return (
    <div>
      {/* Toolbar personalizada */}
      <div className={styles.customToolbar}>
      <div className={styles.navButtons}>
        <button aria-label="teste" onClick={() => handleNavigation("prev")} className={styles.iconButton}>
          ◄
        </button>
        <button onClick={goToToday} className={styles.iconButton}>
          <FaCalendarAlt style={{fontSize: "1.4em", color: "#4a148c"}}/>
        </button>
        <button onClick={() => handleNavigation("next")} className={styles.iconButton}>
          ►
        </button>
      </div>

      <div className={styles.viewSelector}>
        <select
          value={view}
          onChange={(e) => setView(e.target.value)}
          className={styles.viewSelect}
        >
          <option value="month">Mês</option>
          <option value="week">Semana</option>
          <option value="day">Dia</option>
          <option value="agenda">Agenda</option>
        </select>
      </div>

      <div className={styles.titleContainer}>
        <h3 className={styles.title}>{getFormattedTitle()}</h3>
      </div>

    </div>

      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        view={view}
        date={currentDate}
        style={{ height: "80vh", fontSize: fontSize, padding: "10px" }}
        onView={(newView) => setView(newView)}
        min={min}
        max={max}
        onSelectEvent={handleEventClick}
        onNavigate={(date) => setCurrentDate(date)}
        eventPropGetter={eventStyleGetter}
        dayPropGetter={dayPropGetter}
        toolbar={false}
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
          <div className={styles.modalStyles}>
            <div className={styles.modalContentStyles}>
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

                  <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                    <div style={{ flex: 1 }}>
                      <label>Data*:</label>
                      <input
                        type="date"
                        name="data"
                        value={
                          editedEvent?.horario?.inicio?._seconds
                            ? moment(editedEvent.horario.inicio._seconds * 1000).format("YYYY-MM-DD")
                            : ""
                        }
                        onChange={(e) => {
                          const newDate = e.target.value;
                          const currentTime =
                            editedEvent?.horario?.inicio?._seconds
                              ? moment(editedEvent.horario.inicio._seconds * 1000).format("HH:mm")
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
                    </div>
                    <div style={{ flex: 1 }}>
                      <label>Horário de Início*:</label>
                      <input
                        type="time"
                        name="start"
                        value={
                          editedEvent?.horario?.inicio?._seconds
                            ? moment(editedEvent.horario.inicio._seconds * 1000).format("HH:mm")
                            : ""
                        }
                        onChange={(e) => {
                          const newTime = e.target.value;
                          const currentDate =
                            editedEvent?.horario?.inicio?._seconds
                              ? moment(editedEvent.horario.inicio._seconds * 1000).format("YYYY-MM-DD")
                              : moment().format("YYYY-MM-DD");

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
                    </div>
                  </div>

                  <label>
                    Serviço(s):
                    <button onClick={openServicosModal} className={styles.buttonSelect}>
                      <FaCheck style={{ marginRight: "5px" }} /> Selecionar Serviços
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
              )}
              <div style={{ marginTop: "10px", display: "flex", gap: "10px", justifyContent: "center" }}>
                {isEditing ? (
                  <button onClick={handleSave} className={styles.buttonPrimary}>
                    <FaSave style={{ marginRight: "5px" }} /> Salvar
                  </button>
                ) : (
                  <button onClick={() => setIsEditing(true)} className={styles.buttonSecondary}>
                    <FaEdit style={{ marginRight: "5px" }} /> Editar
                  </button>
                )}
                <button onClick={closeModal}>
                  <FaTimes style={{ marginRight: "5px" }} /> Cancelar
                </button>
                {!isEditing && (
                  <button onClick={handleDelete} className={styles.buttonDanger}>
                    <FaTrash style={{ marginRight: "5px" }} /> Excluir
                  </button>
                )}
              </div>
            </div>
          </div>
        )}


        {showServicosModal && (
          <div className={styles.modalStyles}>
            <div className={styles.modalContentStyles}>
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
              <div style={{ gap: "10px", display: "flex" }}>
                {dadosProfissional.servicos.length > 4 && (
                  <button
                    type="button"
                    className={styles.verMaisBtn}
                    onClick={() => setMostrarTodos((prev) => !prev)}
                  >
                    {mostrarTodos ? "▲ Ver menos" : "▼ Ver tudo"}
                  </button>
                )}
                <button onClick={closeServicosModal} style={{ marginTop: "10px" }}>
                  <FaCheck style={{ marginRight: "5px" }} /> Ok
                </button>
              </div>
            </div>
          </div>
        )}

        {loading && (
          <div className={styles.loadingOverlay}>
            <div className={styles.spinner}></div>
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