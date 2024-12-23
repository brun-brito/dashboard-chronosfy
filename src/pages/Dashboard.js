import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import Agenda from "../components/Agenda";
import AddHorarioButton from "../components/AddHorarioButton";
import api from "../services/Api";

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const [events, setEvents] = useState([]);
  const [horarioFuncionamento, setHorarioFuncionamento] = useState({});
  const [nome, setNome] = useState(""); // Nome do profissional
  const [showModal, setShowModal] = useState(false); // Controle do modal
  const [servicosDisponiveis, setServicosDisponiveis] = useState([]); // Serviços disponíveis
  const [selectedServicos, setSelectedServicos] = useState([]); // Serviços selecionados
  const [start, setStart] = useState(""); // Horário inicial
  const [loading, setLoading] = useState(false); // Controle do loading
  const [feedback, setFeedback] = useState(null); // Feedback de sucesso ou falha

  // Buscar dados do profissional e agendamentos
  useEffect(() => {
    const fetchData = async () => {
      try {
        const agendamentosResponse = await api.get(`/v1/profissional/${user.uid}/agendamentos`);
        const formattedEvents = agendamentosResponse.data.map((event) => {
          const start = new Date(event.horario.inicio._seconds * 1000);
          const end = new Date(event.horario.fim._seconds * 1000);
          const title = `${event.nome} - ${event.servicos.join(", ")}`;
          return { ...event, title, start, end };
        });
        setEvents(formattedEvents);

        const profissionalResponse = await api.get(`/v1/profissional/${user.uid}`);
        setHorarioFuncionamento(profissionalResponse.data.horario_funcionamento || {});
        setNome(profissionalResponse.data.nome);

        // Serviços disponíveis
        setServicosDisponiveis(profissionalResponse.data.servicos || []);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      }
    };

    fetchData();
  }, [user]);

  const handleServicoChange = (e) => {
    const { value, checked } = e.target;
    setSelectedServicos((prev) =>
      checked ? [...prev, value] : prev.filter((servico) => servico !== value)
    );
  };

  const handleAddHorario = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFeedback(null); // Limpar feedback ao iniciar
  
    // Validação básica
    if (!e.target.data.value || !start) {
      setFeedback({ type: "error", message: "Por favor, preencha a data e o horário de início corretamente." });
      setLoading(false);
      return;
    }
  
    try {
      const novoHorario = {
        horario: [`${e.target.data.value}T${start}:00`],
        nome: e.target.nome.value,
        servicos: selectedServicos,
      };
  
      await api.post(`/v1/profissional/${user.uid}/agendamentos`, novoHorario);
  
      // Caso sucesso
      setFeedback({ type: "success", message: "Horário adicionado com sucesso!" });
      setShowModal(false);
      setSelectedServicos([]); // Limpar seleção
      setStart(""); // Limpar horário inicial
      window.location.reload();
    } catch (error) {
      // Caso falha
      const errorMessage = error.response?.data?.error || "Erro ao adicionar horário.";
      console.log(error.response.data);
      setFeedback({ type: "error", message: errorMessage });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div>
      <h1>Bem-vindo, {nome || "Profissional"}</h1>
      <button onClick={logout}>Sair</button>

      <AddHorarioButton onClick={() => setShowModal(true)} />

      <Agenda events={events} horarioFuncionamento={horarioFuncionamento} />

      {showModal && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <h3>Adicionar Horário</h3>
            <form onSubmit={handleAddHorario}>
              <div style={styles.inputGroup}>
                <label>Data:</label>
                <input type="date" name="data" required />
              </div>
              <div style={styles.inputGroup}>
                <label>Horário de Início:</label>
                <input
                  type="time"
                  name="start"
                  min="09:00"
                  max="18:00"
                  required
                  onChange={(e) => setStart(e.target.value)}
                />
              </div>
              <div style={styles.inputGroup}>
                <label>Serviços:</label>
                <div style={styles.checkboxContainer}>
                {servicosDisponiveis.map((servico, index) => (
                  <div key={servico.id || index} style={styles.checkboxItem}>
                    <input
                      type="checkbox"
                      id={`servico-${servico.id || index}`}
                      value={servico.nome}
                      onChange={handleServicoChange}
                    />
                    <label htmlFor={`servico-${servico.id || index}`}>{servico.nome}</label>
                  </div>
                ))}
                </div>
              </div>
              <div style={styles.inputGroup}>
                <label>Nome do Cliente:</label>
                <input type="text" name="nome" placeholder="Nome do Cliente" required />
              </div>
              <div style={styles.actions}>
                <button
                  type="submit"
                  style={{ ...styles.saveButton, opacity: loading ? 0.7 : 1 }}
                  disabled={loading}
                >
                  {loading ? "Salvando..." : "Salvar"}
                </button>
                <button
                  type="button"
                  style={styles.cancelButton}
                  onClick={() => {
                    setShowModal(false);
                    setFeedback(null);
                  }}
                >
                  Cancelar
                </button>
              </div>
            </form>
            {feedback && (
              <div
                style={{
                  ...styles.feedback,
                  backgroundColor: feedback.type === "success" ? "#4CAF50" : "#f44336",
                }}
              >
                {feedback.message}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  modal: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: "8px",
    padding: "20px",
    width: "400px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
  },
  inputGroup: {
    marginBottom: "15px",
  },
  checkboxContainer: {
    display: "flex",
    flexDirection: "column",
  },
  checkboxItem: {
    marginBottom: "5px",
  },
  actions: {
    display: "flex",
    justifyContent: "space-between",
  },
  saveButton: {
    backgroundColor: "#4CAF50",
    color: "white",
    padding: "10px 15px",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  cancelButton: {
    backgroundColor: "#f44336",
    color: "white",
    padding: "10px 15px",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  feedback: {
    marginTop: "15px",
    padding: "10px",
    borderRadius: "4px",
    color: "white",
    textAlign: "center",
  },
};

export default Dashboard;
