import React, { useEffect, useState, useContext } from "react";
import api from "../services/Api";
import styles from "../assets/Horario.module.css";
import { AuthContext } from "../context/AuthContext";

const Horario = () => {
  const { user } = useContext(AuthContext);
  const [horarioFuncionamento, setHorarioFuncionamento] = useState(() => {
    const savedHorario = sessionStorage.getItem("horarioFuncionamento");
    return savedHorario ? JSON.parse(savedHorario) : {
      dom: null,
      seg: null,
      ter: null,
      qua: null,
      qui: null,
      sex: null,
      sab: null,
    };
  });
  const [originalHorario, setOriginalHorario] = useState(null); // Para comparar alterações
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [isAgendaSuspended, setIsAgendaSuspended] = useState(false);

  const diasDaSemana = [
    { key: "dom", label: "Domingo" },
    { key: "seg", label: "Segunda" },
    { key: "ter", label: "Terça" },
    { key: "qua", label: "Quarta" },
    { key: "qui", label: "Quinta" },
    { key: "sex", label: "Sexta" },
    { key: "sab", label: "Sábado" },
  ];

  // Carregar os horários do servidor (apenas se não houver no sessionStorage)
  useEffect(() => {
    const allNull = Object.values(horarioFuncionamento).every((dia) => dia === null);
    setIsAgendaSuspended(allNull);
    const fetchHorario = async () => {
      if (!sessionStorage.getItem("horarioFuncionamento")) {
        setLoading(true);
        try {
          const response = await api.get(`/v1/profissional/${user.uid}`);
          const horarioData = response.data.horario_funcionamento || {};
          setHorarioFuncionamento(horarioData);
          setOriginalHorario(horarioData); // Define o estado original
          sessionStorage.setItem("horarioFuncionamento", JSON.stringify(horarioData));
        } catch (err) {
          setError("Erro ao carregar os horários de trabalho.");
        } finally {
          setLoading(false);
        }
      } else {
        const savedHorario = JSON.parse(sessionStorage.getItem("horarioFuncionamento"));
        setOriginalHorario(savedHorario);
        setLoading(false);
      }
    };

    fetchHorario();
  }, [user.uid]);

  // Verifica se houve alteração
  const isChanged = JSON.stringify(horarioFuncionamento) !== JSON.stringify(originalHorario);

  // Atualizar os horários no servidor
  const updateHorario = async (novoHorario) => {
    try {
      await api.put(`/v1/profissional/${user.uid}`, {
        horario_funcionamento: novoHorario,
      });
      setOriginalHorario(novoHorario); // Atualiza o estado original
      sessionStorage.setItem("horarioFuncionamento", JSON.stringify(novoHorario));
      setFeedback("Horários atualizados com sucesso!");
    } catch (err) {
      setError(`Erro ao atualizar os horários: ${err.response?.data?.error || "Erro desconhecido."}`);
    }    
  };

  // Handler para editar um horário
  const handleHorarioChange = (dia, index, valor) => {
    setHorarioFuncionamento((prev) => {
      const atualizado = { ...prev };
      atualizado[dia] = atualizado[dia] || [];
      atualizado[dia][index] = valor || null;
      sessionStorage.setItem("horarioFuncionamento", JSON.stringify(atualizado));
      return atualizado;
    });
  };

  const handleSuspendAgenda = async () => {
    try {
      setLoading(true);
      const updatedHorarios = {
        dom: null,
        seg: null,
        ter: null,
        qua: null,
        qui: null,
        sex: null,
        sab: null,
      };
      await api.put(`/v1/profissional/${user.uid}`, {
        horario_funcionamento: updatedHorarios,
      });
      setHorarioFuncionamento(updatedHorarios);
      setIsAgendaSuspended(true);
      setError(null);
    } catch (err) {
      setError(`Erro ao suspender a agenda: ${err.response?.data?.error || "Erro desconhecido."}`);
    } finally {
      setLoading(false);
    }
  };
  
  const handleReactivateAgenda = async () => {
    try {
      setLoading(true);
      const defaultHorarios = {
        dom: null,
        seg: ["08:00", "18:00"],
        ter: ["08:00", "18:00"],
        qua: ["08:00", "18:00"],
        qui: ["08:00", "18:00"],
        sex: ["08:00", "18:00"],
        sab: ["08:00", "12:00"],
      };
      await api.put(`/v1/profissional/${user.uid}`, {
        horario_funcionamento: defaultHorarios,
      });
      setHorarioFuncionamento(defaultHorarios);
      setIsAgendaSuspended(false);
      setError(null);
    } catch (err) {
      setError(`Erro ao reativar a agenda: ${err.response?.data?.error || "Erro desconhecido."}`);
    } finally {
      setLoading(false);
    }
  };  
  
  // Handler para salvar alterações
  const handleSalvar = async () => {
    await updateHorario(horarioFuncionamento);
    setOriginalHorario(horarioFuncionamento); // Atualiza o estado original após salvar
  };
  

  if (loading) return <p>Carregando...</p>;
  if (error) {
    return (
      <div className={styles.errorContainer}>
        <p className={styles.errorMessage}>{error}</p>
        <button
          onClick={() => window.location.reload()}
          className={styles.reloadButton}
        >
          Recarregar Página
        </button>
      </div>
    );
  }
  
  return (
    <div className={styles.horarioContainer}>
      <h1>Horários de Trabalho</h1>
      {feedback && <p className={styles.feedback}>{feedback}</p>}
      <div className={styles.horarioGrid}>
        {diasDaSemana.map(({ key, label }) => (
          <div key={key} className={styles.diaContainer}>
            <h3>{label}</h3>
            <div>
              <label>Início:</label>
              <input
                type="time"
                value={horarioFuncionamento[key]?.[0] || ""}
                onChange={(e) => handleHorarioChange(key, 0, e.target.value)}
              />
            </div>
            <div>
              <label>Término:</label>
              <input
                type="time"
                value={horarioFuncionamento[key]?.[1] || ""}
                onChange={(e) => handleHorarioChange(key, 1, e.target.value)}
              />
            </div>
          </div>
        ))}
      </div>
      <div className={styles.actions}>
      <button
        onClick={handleSalvar}
        className={`${styles.saveButton} ${!isChanged ? styles.disabled : ""}`}
        disabled={!isChanged}
      >
        Salvar Alterações
      </button>
        <div className={styles.buttonContainer}>
          {isAgendaSuspended ? (
            <>
              <button
                className={styles.reactivateButton}
                onClick={handleReactivateAgenda}
              >
                Reativar Agenda
              </button>
              <p className={styles.infoMessage}>
                Reativar a agenda retorna os horários padrão (08:00 - 18:00).
              </p>
            </>
          ) : (
            <>
              <button
                className={styles.suspendButton}
                onClick={handleSuspendAgenda}
              >
                Suspender Agenda
              </button>
              <p className={styles.infoMessage}>
                Suspender a agenda remove todos os horários de funcionamento. Essa ação NÃO PODE ser revertida.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Horario;
