import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { DashboardContext } from "../context/DashboardContext";
import Agenda from "../components/Agenda";
import api from "../services/Api";
import style from "../assets/Dashboard.module.css";
import styles from "../assets/Agenda.module.css";

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const { dadosDashboard, setDadosDashboard } = useContext(DashboardContext);
  const { events, horarioFuncionamento, nome, servicosDisponiveis, dadosProfissional } = dadosDashboard;
  const [showModal, setShowModal] = useState(false); // Controle do modal
  const [selectedServicos, setSelectedServicos] = useState([]); // Serviços selecionados
    const [formData, setFormData] = useState({
    nome: "",
    data: "",
    start: "",
    observacao: "",
  });
  const [loading, setLoading] = useState(false); // Controle do loading
  const [ setError] = useState(null);
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
      if (dadosDashboard?.events?.length) return; // Verifique se o contexto já tem dados
  
      setLoading(true);
      try {
        // Fetch data da API
        const agendamentosResponse = await api.get(`/v1/profissional/${user.uid}/agendamentos`);
        const formattedEvents = agendamentosResponse.data.map((event) => {
          const start = new Date(event.horario.inicio._seconds * 1000);
          const end = new Date(event.horario.fim._seconds * 1000);
          const title = `${event.nome} - ${event.servicos.join(", ")}`;
          return { ...event, title, start, end };
        });
  
        const profissionalResponse = await api.get(`/v1/profissional/${user.uid}`);
        setDadosDashboard({
          events: formattedEvents,
          horarioFuncionamento: profissionalResponse.data.horario_funcionamento || {},
          nome: profissionalResponse.data.nome,
          servicosDisponiveis: profissionalResponse.data.servicos || [],
          dadosProfissional: profissionalResponse.data,
        });
      } catch (error) {
        console.error("Erro ao carregar dados do dashboard:", error);
        setError("Erro ao carregar os dados do dashboard.");
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
  }, [dadosDashboard, setDadosDashboard, setError, user.uid]); 

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
      
      //console.log(`Requisição completa: ${JSON.stringify(novoHorario, null, 2)}`);
      await api.post(`/v1/profissional/${user.uid}/agendamentos`, novoHorario);
  
      setFeedback({ type: "success", message: "Horário adicionado com sucesso!" });
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
      setShowResumo(false);
      setLoading(false);
    }
  };
  
  return (
    <div>
      <h1>Bem-vindo, {nome || "Profissional"}</h1>

      <button
        onClick={() => setShowModal(true)}
        className={styles.addButton}
      >
        <span>+</span>
        Adicionar Horário
      </button>

      <Agenda 
        events={events}
        horarioFuncionamento={horarioFuncionamento} 
        idUser={user.uid} 
        dadosProfissional={dadosProfissional}
      />

      {showModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h3>Adicionar Horário</h3>
            <form onSubmit={handleAddHorario}>

            <div className={styles.inputGroup}>
                <label>Nome do Cliente*:</label>
                <input
                  type="text"
                  name="nome"
                  placeholder="ex: João Carlos Silva"
                  value={formData.nome}
                  onChange={handleInputChange}
                  required
                />
                {formErrors.nome && <p className={styles.errorMessage}>{formErrors.nome}</p>}
              </div>

              <div className={styles.inputGroup}>
                <label>Data*:</label>
                <input
                  type="date"
                  name="data"
                  value={formData.data}
                  onChange={handleInputChange}
                  required
                />
                {formErrors.data && <p className={styles.errorMessage}>{formErrors.data}</p>}
              </div>

              <div className={styles.inputGroup}>
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
                {formErrors.horario && <p className={styles.errorMessage}>{formErrors.horario}</p>}
              </div>

              <div className={styles.inputGroup}>
                <label style={{ marginBottom: "10px", display: "block" }}>
                  Marque o(s) Procedimento(s) desejado(s)*:
                </label>
                <div className={styles.checkboxList}>
                  {(mostrarTodos ? servicosDisponiveis : servicosDisponiveis.slice(0, 4)).map(
                    (servico, index) => (
                      <div key={servico.id || index} className={styles.checkboxItem}>
                        <input
                          type="checkbox"
                          id={`servico-${servico.id || index}`}
                          value={servico.nome}
                          className={styles.checkbox}
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
                          className={styles.checkboxLabel}
                        >
                          {servico.nome +` (R$${servico.valor} - ${servico.tempo_estimado} min)`}
                        </label>
                      </div>
                    )
                  )}
                </div>
                {formErrors.servicos && <p className={styles.errorMessage}>{formErrors.servicos}</p>}
                
                {servicosDisponiveis.length > 5 && (
                  <button
                    type="button"
                    className={styles.verMaisBtn}
                    onClick={toggleMostrarTodos}
                  >
                    {mostrarTodos ? "▲ Ver menos" : "▼ Ver mais"}
                  </button>
                )}
              </div>

              <div style={{ marginTop: "10px" }}>
                <label>Observação:</label>
                <input type="text" name="observacao" placeholder="Campo não obrigatório"/>
              </div>
              <div className={styles.actions}>
              <button
                type="button"
                className={styles.saveButton}
                style={{
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
                  className={styles.cancelButton}
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
                className={styles.feedback}
                style={{
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
        <div className={styles.modal}>
          <div className={styles.modalContent}>
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
            
            <div className={styles.actions}>
              <button
                type="button"
                className={styles.editButton}
                onClick={() => setShowResumo(false)}
              >
                Voltar
              </button>
              <button
                type="button"
                className={styles.saveButton}
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

export default Dashboard;
