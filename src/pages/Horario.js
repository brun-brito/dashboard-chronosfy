import React, { useEffect, useState, useContext } from "react";
import api from "../services/Api";
import styles from "../assets/Horario.module.css";
import { AuthContext } from "../context/AuthContext";
import style from "../assets/Loading.module.css";
import { FaSave, FaTimesCircle, FaCheckCircle } from "react-icons/fa";

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
  const [manualChanges, setManualChanges] = useState(false);

  const diasDaSemana = [
    { key: "dom", label: "Domingo" },
    { key: "seg", label: "Segunda-feira" },
    { key: "ter", label: "Terça-feira" },
    { key: "qua", label: "Quarta-feira" },
    { key: "qui", label: "Quinta-feira" },
    { key: "sex", label: "Sexta-feira" },
    { key: "sab", label: "Sábado" },
  ];

  // Carregar os horários do servidor (apenas se não houver no sessionStorage)
  useEffect(() => {
    const fetchHorario = async () => {
      setLoading(true);
      try {
        // Buscar horários do banco
        const response = await api.get(`/v1/profissional/${user.uid}`);
        const horarioData = response.data.horario_funcionamento || {};
  
        // Buscar horários do sessionStorage
        const savedHorario = JSON.parse(sessionStorage.getItem("horarioFuncionamento") || "{}");
  
        // Se os horários do banco diferirem do sessionStorage, atualiza ambos
        if (JSON.stringify(horarioData) !== JSON.stringify(savedHorario)) {
          sessionStorage.setItem("horarioFuncionamento", JSON.stringify(horarioData));
          setHorarioFuncionamento(horarioData); // Atualiza estado local com o banco
        } else {
          setHorarioFuncionamento(savedHorario); // Mantém o estado do sessionStorage
        }
  
        setOriginalHorario(horarioData); // Define o estado original
        setIsAgendaSuspended(Object.values(horarioData).every((dia) => dia === null)); // Verifica se todos os dias estão nulos
      } catch (err) {
        console.error("Erro ao carregar os horários:", err);
        setError("Erro ao carregar os horários de trabalho.");
      } finally {
        setLoading(false);
      }
    };
  
    fetchHorario();
  }, [user.uid]);  

  const isChanged = manualChanges && JSON.stringify(horarioFuncionamento) !== JSON.stringify(originalHorario);
  // console.log(`Horário original: \n\n${JSON.stringify(originalHorario)} \n\nhorario atual:\n\n ${JSON.stringify(horarioFuncionamento)}`)

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
  const handleHorarioChange = (dia, index, valor, inputRef) => {
    setHorarioFuncionamento((prev) => {
      const atualizado = { ...prev };
      atualizado[dia] = atualizado[dia] || [];
      atualizado[dia][index] = valor || null;
      return atualizado;
    });
  
    // Define mudanças manuais
    setManualChanges(true);
  
    // Fecha o menu de seleção, se aplicável
    if (inputRef && inputRef.current) {
      inputRef.current.blur();
    }
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
      setManualChanges(false);
      setError(null);
    } catch (err) {
      console.log(err);
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
        sab: null
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
  
  const handleSalvar = async () => {
    try {
      setLoading(true);
      await updateHorario(horarioFuncionamento);
      sessionStorage.setItem("horarioFuncionamento", JSON.stringify(horarioFuncionamento));
      setManualChanges(false);
      window.location.reload()
    } catch (err) {
      setError(`Erro ao salvar as alterações: ${err.response?.data?.error || "Erro desconhecido."}`);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <div className={style["loading-container"]}>
        <div className={style["loading-spinner"]}></div>
        <p>Carregando...</p>
      </div>
    );
  }

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
        {diasDaSemana.map(({ key, label }) => {
          const inicioRef = React.createRef();
          const terminoRef = React.createRef();
          return (
            <div key={key} className={styles.diaContainer}>
              <h3>{label}</h3>
              <div>
                <label>Início:</label>
                <input
                  ref={inicioRef}
                  type="time"
                  value={horarioFuncionamento[key]?.[0] || ""}
                  onChange={(e) => handleHorarioChange(key, 0, e.target.value, inicioRef)}
                />
              </div>
              <div>
                <label>Término:</label>
                <input
                  ref={terminoRef}
                  type="time"
                  value={horarioFuncionamento[key]?.[1] || ""}
                  onChange={(e) => handleHorarioChange(key, 1, e.target.value, terminoRef)}
                />
              </div>
            </div>
          );
        })}
      </div>
      <div className={styles.actions}>
        <button
          onClick={handleSalvar}
          className={`${styles.saveButton} ${!isChanged ? styles.disabled : ""}`}
          disabled={!isChanged}
        >
          <FaSave className={styles.iconButton} />
          Salvar Alterações
        </button>
        
        <div className={styles.buttonContainer}>
          {isAgendaSuspended ? (
            <>
              <button
                className={styles.reactivateButton}
                onClick={handleReactivateAgenda}
              >
                <FaCheckCircle className={styles.iconButton} />
                Reativar Agenda
              </button>
              <p className={styles.infoMessage}>
                <span className={styles.infoIcon}>
                  <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="13" height="13" viewBox="0 0 50 50">
                  <path d="M 25 2 C 12.309295 2 2 12.309295 2 25 C 2 37.690705 12.309295 48 25 48 C 37.690705 48 48 37.690705 48 25 C 48 12.309295 37.690705 2 25 2 z M 25 4 C 36.609824 4 46 13.390176 46 25 C 46 36.609824 36.609824 46 25 46 C 13.390176 46 4 36.609824 4 25 C 4 13.390176 13.390176 4 25 4 z M 25 11 A 3 3 0 0 0 22 14 A 3 3 0 0 0 25 17 A 3 3 0 0 0 28 14 A 3 3 0 0 0 25 11 z M 21 21 L 21 23 L 22 23 L 23 23 L 23 36 L 22 36 L 21 36 L 21 38 L 22 38 L 23 38 L 27 38 L 28 38 L 29 38 L 29 36 L 28 36 L 27 36 L 27 21 L 26 21 L 22 21 L 21 21 z"></path>
                  </svg>
                </span> 
                  Define todos os dias úteis para um horário padrão (08:00 - 18:00).
              </p>
            </>
          ) : (
            <>
              <button
                className={styles.suspendButton}
                onClick={handleSuspendAgenda}
              >
                <FaTimesCircle className={styles.iconButton} />
                Suspender Agenda
              </button>
              <p className={styles.infoMessage}>
                <span className={styles.infoIcon}>
                  <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="13" height="13" viewBox="0 0 50 50">
                  <path d="M 25 2 C 12.309295 2 2 12.309295 2 25 C 2 37.690705 12.309295 48 25 48 C 37.690705 48 48 37.690705 48 25 C 48 12.309295 37.690705 2 25 2 z M 25 4 C 36.609824 4 46 13.390176 46 25 C 46 36.609824 36.609824 46 25 46 C 13.390176 46 4 36.609824 4 25 C 4 13.390176 13.390176 4 25 4 z M 25 11 A 3 3 0 0 0 22 14 A 3 3 0 0 0 25 17 A 3 3 0 0 0 28 14 A 3 3 0 0 0 25 11 z M 21 21 L 21 23 L 22 23 L 23 23 L 23 36 L 22 36 L 21 36 L 21 38 L 22 38 L 23 38 L 27 38 L 28 38 L 29 38 L 29 36 L 28 36 L 27 36 L 27 21 L 26 21 L 22 21 L 21 21 z"></path>
                  </svg>
                </span> 
                  Remove todos os horários atuais de funcionamento.<br />
                * Seus clientes não poderão agendar horários.<br />
                * Essa ação <strong>NÃO PODE</strong> ser revertida.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Horario;
