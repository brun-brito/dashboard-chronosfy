import React, { useEffect, useState, useContext } from "react";
import api from "../services/Api";
import styles from "../assets/Servicos.module.css";
import { AuthContext } from "../context/AuthContext";
import { PerfilContext } from "../context/PerfilContext";
import { FaEdit, FaTrash, FaSave, FaTimes, FaPlus } from "react-icons/fa";
import style from "../assets/Loading.module.css";

const Servicos = () => {
  const { user } = useContext(AuthContext);
  const { dadosUsuario, setDadosUsuario } = useContext(PerfilContext);
  const [loading, setLoading] = useState(!dadosUsuario?.servicos);
  const [error, setError] = useState(null);
  const [editForm, setEditForm] = useState(dadosUsuario?.servicos || []);
  const [newService, setNewService] = useState({ nome: "", valor: "", tempo_estimado: "" });
  const [showAddServiceForm, setShowAddServiceForm] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [mostrarTodos, setMostrarTodos] = useState(false);
  const [servicesToShow, setServicesToShow] = useState(4); 

  useEffect(() => {
    const updateServicesToShow = () => {
      if (window.innerWidth > 768) {
        setServicesToShow(8);
      } else {
        setServicesToShow(4);
      }
    };

    updateServicesToShow();
    window.addEventListener("resize", updateServicesToShow);

    return () => {
      window.removeEventListener("resize", updateServicesToShow);
    };
  }, []);

  useEffect(() => {
    const fetchServicos = async () => {
      if (dadosUsuario?.servicos) {
        setEditForm(dadosUsuario.servicos);
        setLoading(false);
        return;
      }

      try {
        const response = await api.get(`/v1/profissional/${user.uid}`);
        const servicos = response.data.servicos || [];
        setDadosUsuario((prev) => ({ ...prev, servicos }));
        setEditForm(servicos);
      } catch (err) {
        console.error("Erro ao carregar os serviços:", err);
        setError("Erro ao carregar os serviços.");
      } finally {
        setLoading(false);
      }
    };

    fetchServicos();
  }, [dadosUsuario?.servicos, setDadosUsuario, user.uid]);

  const handleAddService = async () => {
    if (newService.nome.trim() && newService.valor.trim()) {
      const updatedServices = [
        ...editForm,
        {
          nome: newService.nome,
          valor: parseFloat(newService.valor),
          tempo_estimado: parseInt(newService.tempo_estimado, 10) || null,
        },
      ];

      setEditForm(updatedServices);
      setNewService({ nome: "", valor: "", tempo_estimado: "" });
      setShowAddServiceForm(false);

      try {
        await api.put(`/v1/profissional/${user.uid}`, { servicos: updatedServices });
        setDadosUsuario((prev) => ({ ...prev, servicos: updatedServices }));
        setError(null);
      } catch (err) {
        console.error("Erro ao salvar serviço:", err);
        setError("Erro ao adicionar o serviço. Tente novamente.");
      }
    }
  };

  const handleEditService = (index) => {
    setEditIndex(index);
  };

  const handleSaveEditService = async (index) => {
    try {
      await api.put(`/v1/profissional/${user.uid}`, { servicos: editForm });
      setDadosUsuario((prev) => ({ ...prev, servicos: editForm }));
      setEditIndex(null);
    } catch (err) {
      console.error("Erro ao salvar alterações:", err);
    }
  };

  const handleRemoveService = async (index) => {
    if (window.confirm("Tem certeza de que deseja excluir este serviço?")) {
      const updatedServices = [...editForm];
      updatedServices.splice(index, 1);
      setEditForm(updatedServices);

      try {
        await api.put(`/v1/profissional/${user.uid}`, { servicos: updatedServices });
        setDadosUsuario((prev) => ({ ...prev, servicos: updatedServices }));
      } catch (err) {
        console.error("Erro ao remover serviço:", err);
      }
    }
  };

  const handleServiceChange = (index, field, value) => {
    const updatedServices = [...editForm];
    updatedServices[index][field] = value;
    setEditForm(updatedServices);
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
    return <p>{error}</p>;
  }

  return (
    <div className={styles.servicosContainer}>
        <h1>Serviços Oferecidos</h1>
        <div className={styles.servicosGrid}>
        {(mostrarTodos ? editForm : editForm.slice(0, servicesToShow)).map((servico, index) => (
          <div key={index} className={styles.servicoCard}>
            {editIndex === index ? (
              <>
                <label>Nome:</label>
                <input
                  type="text"
                  value={servico.nome}
                  onChange={(e) => handleServiceChange(index, "nome", e.target.value)}
                />
                <label>Valor (R$):</label>
                <input
                  type="number"
                  value={servico.valor}
                  onChange={(e) => handleServiceChange(index, "valor", e.target.value)}
                />
                <label>Tempo Estimado (min):</label>
                <input
                  type="number"
                  value={servico.tempo_estimado || ""}
                  onChange={(e) =>
                    handleServiceChange(index, "tempo_estimado", e.target.value)
                  }
                />
                <div className={styles.cardActions}>
                    <button
                    className={styles.saveButton}
                    onClick={() => handleSaveEditService(index)}
                    >
                    <FaSave />
                    </button>
                    <button
                    className={styles.cancelButton}
                    onClick={() => setEditIndex(null)}
                    >
                    <FaTimes />
                    </button>
                </div>
              </>
            ) : (
              <>
                <p>
                  <strong>Nome:</strong> {servico.nome}
                </p>
                <p>
                  <strong>Valor:</strong> R$ {servico.valor.toFixed(2)}
                </p>
                <p>
                  <strong>Tempo Estimado:</strong>{" "}
                  {servico.tempo_estimado ? `${servico.tempo_estimado} min` : "Não especificado"}
                </p>
                <div className={styles.cardActions}>
                  <button
                    className={styles.editButton}
                    onClick={() => handleEditService(index)}
                  >
                    <FaEdit />
                  </button>
                  <button
                    className={styles.removeButton}
                    onClick={() => handleRemoveService(index)}
                  >
                    <FaTrash />
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      <div className={styles.servicosHeader}>
        {editForm.length > servicesToShow && (
            <button
            className={styles.toggleButton}
            onClick={() => setMostrarTodos(!mostrarTodos)}
            >
            {mostrarTodos ? "▲ Ver menos" : "▼ Ver tudo"}        
            </button>
        )}

        <button
        onClick={() => setShowAddServiceForm(!showAddServiceForm)}
        className={`${styles.addServiceButton} ${showAddServiceForm ? styles.cancelButton : styles.addButton}`}
        >
        {showAddServiceForm ? (
            <>
            <FaTimes className={styles.icon} /> Cancelar
            </>
        ) : (
            <>
            <FaPlus className={styles.icon} /> Adicionar Serviço
            </>
        )}
        </button>
    </div>
    {showAddServiceForm && (
        <div className={styles.newService}>
          <div className={styles.serviceField}>
            <label>Nome:</label>
            <input
              type="text"
              placeholder="Nome do serviço"
              value={newService.nome}
              onChange={(e) =>
                setNewService((prev) => ({ ...prev, nome: e.target.value }))
              }
            />
          </div>
          <div className={styles.serviceField}>
            <label>Valor (R$):</label>
            <input
              type="number"
              placeholder="Valor do serviço"
              value={newService.valor}
              onChange={(e) =>
                setNewService((prev) => ({ ...prev, valor: e.target.value }))
              }
            />
          </div>
          <div className={styles.serviceField}>
            <label>Tempo Estimado (min):</label>
            <input
                type="number"
                placeholder="Tempo em minutos"
                value={newService.tempo_estimado}
                onChange={(e) =>
                setNewService((prev) => ({
                    ...prev,
                    tempo_estimado: e.target.value,
                }))
                }
            />
            </div>
          <button onClick={handleAddService} className={styles.saveButton}>
            <FaSave className={styles.icon} /> Salvar Serviço
          </button>
        </div>
      )}
</div>
  );
};

export default Servicos;

/**
 * 
 * 
 * 
 *  ADICIONAR ERROS EM CASO DE ATT ERRADA
 */