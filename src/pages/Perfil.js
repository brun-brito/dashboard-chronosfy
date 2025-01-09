import React, { useEffect, useState, useContext } from "react";
import api from "../services/Api";
import styles from "../assets/Perfil.module.css";
import { AuthContext } from "../context/AuthContext";
import { PerfilContext } from "../context/PerfilContext";
import style from "../assets/Loading.module.css";
import { FaEdit, FaSave, FaTimes } from "react-icons/fa";

const Perfil = () => {
  const { user } = useContext(AuthContext);
  const { dadosUsuario, setDadosUsuario } = useContext(PerfilContext);
  const [loading, setLoading] = useState(!dadosUsuario);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState(dadosUsuario || {});
  const [isCpf, setIsCpf] = useState(() => !!dadosUsuario?.cpf);

  useEffect(() => {
    const fetchDadosUsuario = async () => {
      if (dadosUsuario) return;

      try {
        const response = await api.get(`/v1/profissional/${user.uid}`);
        setDadosUsuario(response.data);
        setEditForm(response.data);
        setIsCpf(!!response.data.cpf);
      } catch (err) {
        setError("Erro ao carregar os dados do perfil.");
      } finally {
        setLoading(false);
      }
    };

    fetchDadosUsuario();
  }, [dadosUsuario, setDadosUsuario, user.uid]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveChanges = async () => {
    try {
      const updates = {};

      ["nome", "email", "telefone", "endereco", "cpf", "cnpj"].forEach((key) => {
        if (editForm[key] !== dadosUsuario[key]) {
          updates[key] = editForm[key];
        }
      });

      if (Object.keys(updates).length === 0) {
        setError("Nenhuma alteração foi feita.");
        return;
      }

      await api.put(`/v1/profissional/${user.uid}`, updates);

      setDadosUsuario((prev) => ({
        ...prev,
        ...updates,
      }));
      setEditMode(false);
      setError(null);
      alert("Alterações salvas com sucesso!");
    } catch (err) {
      console.error("Erro ao salvar alterações:", err);
      setError(`Erro ao salvar alterações: ${err.response?.data?.error || "Erro desconhecido."}`);
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
    return <p>{error}</p>;
  }

  return (
    <div className={styles.perfilContainer}>
      <h1>Perfil</h1>
      <div className={styles.actions}>
        {editMode ? (
          <>
            <button className={styles.saveButton} onClick={handleSaveChanges}>
              <FaSave className={styles.icon} /> Salvar Alterações
            </button>
            <button
              className={styles.cancelButton}
              onClick={() => setEditMode(false)}
            >
              <FaTimes className={styles.icon} /> Cancelar
            </button>
          </>
        ) : (
          <button className={styles.editButton} onClick={() => setEditMode(true)}>
            <FaEdit className={styles.icon} /> Editar Perfil
          </button>
        )}
      </div>
      <div className={styles.perfilInfo}>
        <div className={styles.formGroup}>
          <label>Nome:</label>
          {editMode ? (
            <input
              type="text"
              name="nome"
              value={editForm.nome}
              onChange={handleInputChange}
            />
          ) : (
            <p>{dadosUsuario.nome}</p>
          )}
        </div>
        <div className={styles.formGroup}>
          <label>{isCpf ? "CPF:" : "CNPJ:"}</label>
          {editMode ? (
            <input
              type="text"
              name={isCpf ? "cpf" : "cnpj"}
              value={isCpf ? editForm.cpf || "" : editForm.cnpj || ""}
              onChange={handleInputChange}
              placeholder={`Digite o ${isCpf ? "CPF" : "CNPJ"}`}
            />
          ) : (
            <p>{isCpf ? dadosUsuario.cpf : dadosUsuario.cnpj}</p>
          )}
          {editMode && (
            <button
              className={styles.toggleButton}
              onClick={() => {
                setIsCpf(!isCpf);
                setEditForm((prev) => ({
                  ...prev,
                  cnpj: !isCpf ? "" : prev.cnpj,
                  cpf: isCpf ? "" : prev.cpf,
                }));
              }}
            >
              Alternar para {isCpf ? "CNPJ" : "CPF"}
            </button>
          )}
        </div>
        <div className={styles.formGroup}>
          <label>Email:</label>
          {editMode ? (
            <input
              type="email"
              name="email"
              value={editForm.email}
              onChange={handleInputChange}
            />
          ) : (
            <p>{dadosUsuario.email}</p>
          )}
        </div>
        <div className={styles.formGroup}>
          <label>Telefone:</label>
          {editMode ? (
            <input
              type="tel"
              name="telefone"
              value={editForm.telefone}
              onChange={handleInputChange}
            />
          ) : (
            <p>{dadosUsuario.telefone}</p>
          )}
        </div>
        <div className={styles.formGroup}>
          <label>Endereço:</label>
          {editMode ? (
            <input
              type="text"
              name="endereco"
              value={editForm.endereco?.rua || ""}
              onChange={handleInputChange}
            />
          ) : (
            <p>{dadosUsuario.endereco?.rua || "Não informado"}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Perfil;
