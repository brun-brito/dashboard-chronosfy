import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import Agenda from "../components/Agenda";
import AddHorarioButton from "../components/AddHorarioButton";
import api from "../services/Api";
import style from "../assets/Dashboard.module.css";

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const [events, setEvents] = useState([]);
  const [horarioFuncionamento, setHorarioFuncionamento] = useState({});
  const [nome, setNome] = useState(""); // Nome do profissional
  const [showModal, setShowModal] = useState(false); // Controle do modal
  const [servicosDisponiveis, setServicosDisponiveis] = useState([]); // Serviços disponíveis
  const [selectedServicos, setSelectedServicos] = useState([]); // Serviços selecionados
    const [formData, setFormData] = useState({
    nome: "",
    data: "",
    start: "",
    observacao: "",
  });
  // const [start, setStart] = useState("");
  const [loading, setLoading] = useState(false); // Controle do loading
  const [feedback, setFeedback] = useState(null); // Feedback de sucesso ou falha
  const [mostrarTodos, setMostrarTodos] = useState(false);
  const toggleMostrarTodos = () => setMostrarTodos(!mostrarTodos);
  const [showResumo, setShowResumo] = useState(false);const [valorTotal, setValorTotal] = useState(0);
  const [horarioFinal, setHorarioFinal] = useState("");
  const [formErrors, setFormErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  
    // Limpa o erro ao digitar
    setFormErrors((prevErrors) => ({
      ...prevErrors,
      [name]: value.trim() ? undefined : prevErrors[name],
    }));
  };
  /*

  */
    const calcularResumo = () => {
      const total = selectedServicos.reduce((acc, servicoNome) => {
        const servico = servicosDisponiveis.find((s) => s.nome === servicoNome);
        return acc + (servico ? servico.valor : 0);
      }, 0);
      setValorTotal(total);

      // Total de minutos com base nos serviços selecionados
      const minutosTotais = selectedServicos.reduce((acc, servicoNome) => {
        const servico = servicosDisponiveis.find((s) => s.nome === servicoNome);
        return acc + (servico?.tempo_estimado || 0);
      }, 0);
    
      if (formData.start) {
        const [hours, minutes] = formData.start.split(":").map(Number);
        const inicio = new Date(1970, 0, 1, hours, minutes);
        const final = new Date(inicio.getTime() + minutosTotais * 60000);
    
        const horasFinais = String(final.getHours()).padStart(2, "0");
        const minutosFinais = String(final.getMinutes()).padStart(2, "0");
        setHorarioFinal(`${horasFinais}:${minutosFinais}`);
      } else {
        setHorarioFinal("-");
      }
    };
      
  
  const toggleResumoModal = () => {
    calcularResumo();
    setShowResumo(true);
  };

  const formatarData = (data) => {
    if (!data) return "-";
    const dateObj = new Date(data);
    const dia = String(dateObj.getDate()).padStart(2, "0");
    const mes = String(dateObj.getMonth() + 1).padStart(2, "0");
    const ano = String(dateObj.getFullYear()).padStart(2, "0");
    return `${dia}/${mes}/${ano}`;
  };
  
  const validateForm = () => {
    const errors = {};
    if (!formData.nome.trim()) errors.nome = "O campo Nome é obrigatório.";
    if (!formData.data.trim()) errors.data = "O campo Data é obrigatório.";
    if (!formData.start.trim()) errors.horario = "O campo Horário de Início é obrigatório.";
    if (selectedServicos.length === 0) errors.servicos = "Selecione pelo menos um procedimento.";
  
    setFormErrors(errors);
    return Object.keys(errors).length === 0; // Retorna true se não houver erros
  };
  
  // Buscar dados do profissional e agendamentos
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
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
        const servicosFormatados = (profissionalResponse.data.servicos || []).map((servico) => ({
          id: servico.id || Math.random().toString(36).substring(2, 9),
          nome: servico.nome,
          valor: servico.valor || 0,
          tempo_estimado: servico.tempo_estimado || 0,
        }));
        setServicosDisponiveis(servicosFormatados);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      } finally {
        setLoading(false); // Desativar o loading após as requisições
      }
    };

    fetchData();
  }, [user]);

  if (loading) {
    return (
      <div className={style["loading-container"]}>
        <div className={style["loading-spinner"]}></div>
        <p>Carregando...</p>
      </div>
    );
  }

  const handleServicoChange = (e) => {
    const { value, checked } = e.target;
    setSelectedServicos((prev) =>
      checked ? [...prev, value] : prev.filter((servico) => servico !== value)
    );
  };

  const handleAddHorario = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFeedback(null); // Limpar mensagens de feedback
  
    // Validação básica
    if (!formData.data || !formData.start || selectedServicos.length === 0) {
      setFeedback({
        type: "error",
        message: "Por favor, preencha todos os campos obrigatórios.",
      });
      setLoading(false);
      return;
    }
  
    try {
      const novoHorario = {
        horario: [`${formData.data}T${formData.start}:00`],
        nome: formData.nome,
        servicos: selectedServicos,
        observacao: formData.observacao || "",
      };
  
      await api.post(`/v1/profissional/${user.uid}/agendamentos`, novoHorario);
  
      // Caso de sucesso
      setFeedback({ type: "success", message: "Horário adicionado com sucesso!" });
  
      // Fechar os modais e limpar os estados
      setShowResumo(false);
      setShowModal(false);
      setFormData({
        nome: "",
        data: "",
        start: "",
        observacao: "",
      });
      setSelectedServicos([]);
      setHorarioFinal("");
      setValorTotal(0);
  
      window.location.reload();
    } catch (error) {
      const errorMessage = error.response?.data?.error || "Erro ao adicionar horário.";
      console.error(errorMessage);
      setFeedback({ type: "error", message: errorMessage });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div>
      <h1>Bem-vindo, {nome || "Profissional"}</h1>
      <button onClick={logout} className={style.logout}>Sair</button>

      <AddHorarioButton onClick={() => setShowModal(true)} />

      <Agenda events={events} horarioFuncionamento={horarioFuncionamento} />

      {showModal && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <h3>Adicionar Horário</h3>
            <form onSubmit={handleAddHorario}>

            <div style={styles.inputGroup}>
                <label>Nome do Cliente*:</label>
                <input
                  type="text"
                  name="nome"
                  placeholder="ex: João Carlos Silva"
                  value={formData.nome}
                  onChange={handleInputChange}
                  required
                />
                {formErrors.nome && <p style={styles.errorMessage}>{formErrors.nome}</p>}
              </div>

              <div style={styles.inputGroup}>
                <label>Data*:</label>
                <input
                  type="date"
                  name="data"
                  value={formData.data}
                  onChange={handleInputChange}
                  required
                />
                {formErrors.data && <p style={styles.errorMessage}>{formErrors.data}</p>}
              </div>

              <div style={styles.inputGroup}>
                <label>Horário de Início*:</label>
                <input
                  type="time"
                  name="start"
                  // min="09:00"
                  // max="18:00"      **ajustar pra horario de funcionamento
                  value={formData.start}
                  onChange={handleInputChange}
                  required
                />
                {formErrors.horario && <p style={styles.errorMessage}>{formErrors.horario}</p>}
              </div>

              <div style={styles.inputGroup}>
                <label style={{ marginBottom: "10px", display: "block" }}>
                  Marque o(s) Procedimento(s) desejado(s)*:
                </label>
                <div style={styles.checkboxList}>
                  {(mostrarTodos ? servicosDisponiveis : servicosDisponiveis.slice(0, 5)).map(
                    (servico, index) => (
                      <div key={servico.id || index} style={styles.checkboxItem}>
                        <input
                          type="checkbox"
                          id={`servico-${servico.id || index}`}
                          value={servico.nome}
                          style={styles.checkbox}
                          onChange={(e) => {
                            handleServicoChange(e);
                            setFormErrors((prevErrors) => ({
                              ...prevErrors,
                              servicos:
                                selectedServicos.length > 0 ||
                                e.target.checked
                                  ? undefined
                                  : prevErrors.servicos,
                            }));
                          }}
                        />
                        <label
                          htmlFor={`servico-${servico.id || index}`}
                          style={styles.checkboxLabel}
                        >
                          {servico.nome}
                        </label>
                      </div>
                    )
                  )}
                </div>
                {formErrors.servicos && <p style={styles.errorMessage}>{formErrors.servicos}</p>}
                {servicosDisponiveis.length > 5 && (
                  <button
                    type="button"
                    style={styles.verMaisBtn}
                    onClick={toggleMostrarTodos}
                  >
                    {mostrarTodos ? "▲ Ver menos" : "▼ Ver mais"}
                  </button>
                )}
              </div>

              <div style={styles.inputGroup}>
                <label>Observação:</label>
                <input type="text" name="observacao" placeholder="Campo não obrigatório"/>
              </div>
              <div style={styles.actions}>
              <button
                type="button"
                style={{
                  ...styles.saveButton,
                  opacity: Object.keys(formErrors).length === 0 ? 1 : 0.5,
                  cursor: Object.keys(formErrors).length === 0 ? "pointer" : "not-allowed",
                }}
                onClick={() => {
                  if (validateForm()) {
                    toggleResumoModal();
                  }
                }}
              >
                Avançar »
              </button>
                <button
                  type="button"
                  style={styles.cancelButton}
                  onClick={() => {
                    setShowModal(false);
                    setFeedback(null);
                    setFormData({ nome: "", data: "", start: "", observacao: "" });
                    setSelectedServicos([]);
                    setFormErrors({});
                    setHorarioFinal("");
                    setValorTotal(0);
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

      {showResumo && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <h3>Resumo do Agendamento</h3>
            <p><strong>Nome:</strong> {formData.nome || "-"}</p>
            <p>
              <strong>Horário: </strong> 
              Dia {formatarData(formData.data)}, 
              das {formData.start || "-"} às {horarioFinal || "-"}
            </p>
            <p><strong>Procedimentos:</strong> {selectedServicos.length ? selectedServicos.join(", ") : "Nenhum selecionado"}</p>
            <p><strong>Valor Total:</strong> R$ {valorTotal ? valorTotal.toFixed(2) : "0,00"}</p>
            <p><strong>Observação:</strong> {document.querySelector("input[name='observacao']")?.value || "-"}</p>
            
            <div style={styles.actions}>
              <button
                type="button"
                style={styles.editButton}
                onClick={() => setShowResumo(false)}
              >
                Voltar
              </button>
              <button
                type="button"
                style={styles.saveButton}
                onClick={handleAddHorario}
              >
                Confirmar
              </button>
            </div>
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
    width: "90%", 
    maxWidth: "500px",
    maxHeight: "90vh",
    overflowY: "auto",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
  },
  inputGroup: {
    marginBottom: "10px",
  },
  checkboxList: {
    display: "flex",
    flexDirection: "column", // Alinha os itens em uma coluna
    gap: "10px",
  },
  checkboxItem: {
    display: "flex",
    alignItems: "center", // Alinha o checkbox com o texto
    gap: "10px", // Espaço entre o checkbox e o texto
  },
  checkbox: {
    margin: 0,
    width: "18px", // Tamanho do checkbox semelhante ao padrão
    height: "18px",
  },
  checkboxLabel: {
    fontSize: "16px", // Tamanho do texto
    color: "#333", // Cor do texto
  },
  verMaisBtn: {
    marginTop: "10px",
    backgroundColor: "#2b0548",
    color: "white",
    border: "none",
    padding: "8px 12px",
    borderRadius: "5px",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: "14px",
    transition: "background-color 0.3s ease",
  },
  verMaisBtnHover: {
    backgroundColor: "#1f0439",
  },actions: {
    display: "flex",
    justifyContent: "space-between",
    gap: "10px",
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
  editButton: {
    backgroundColor: "#007BFF", // Azul
    color: "white",
    padding: "10px 15px",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontWeight: "bold",
    marginRight: "10px",
  },  
  errorMessage: {
    color: "#f44336",
    fontSize: "12px",
    marginTop: "5px",
  },
};

export default Dashboard;
