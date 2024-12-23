import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/Api";
import styles from "../assets/Cadastro.module.css";

const Cadastro = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nome: "",
    documentoTipo: "cnpj", // 'cnpj' ou 'cpf'
    documento: "",
    email: "",
    senha: "",
    telefone: "",
  });
  const [loading, setLoading] = useState(false); // Estado para o loading
  const [errorMessage, setErrorMessage] = useState(""); // Estado para mensagens de erro

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { nome, documentoTipo, documento, email, senha, telefone } = formData;

    setLoading(true); // Ativar o loading
    setErrorMessage(""); // Limpar mensagens de erro

    try {
      const payload = {
        nome,
        email,
        senha,
        telefone,
        [documentoTipo]: documento,
        endereco: {}, // Inicializa vazio
        horario_funcionamento: {}, // Inicializa vazio
        servicos: [], // Inicializa vazio
      };

      await api.post(`/v1/profissional`, payload);

      alert("Cadastro realizado com sucesso!");
      navigate("/login", { state: { email } }); // Redireciona para login com email preenchido
    } catch (error) {
      console.error("Erro ao cadastrar:", error);

      // Exibir erro da resposta, se disponível
      if (error.response && error.response.data && error.response.data.error) {
        setErrorMessage(error.response.data.error);
      } else {
        setErrorMessage("Erro ao cadastrar. Verifique os dados e tente novamente.");
      }
    } finally {
      setLoading(false); // Desativar o loading
    }
  };

  return (
    <div className={styles["form-container"]}>
    <h1>Cadastro de Profissional</h1>
    <form onSubmit={handleSubmit}>
        <label>Nome:</label>
        <input
        type="text"
        name="nome"
        value={formData.nome}
        onChange={handleChange}
        required
        />

        <label>Documento:</label>
        <div className={styles["radio-group"]}>
        <label>
            <input
            type="radio"
            name="documentoTipo"
            value="cnpj"
            checked={formData.documentoTipo === "cnpj"}
            onChange={handleChange}
            />
            CNPJ
        </label>
        <label>
            <input
            type="radio"
            name="documentoTipo"
            value="cpf"
            checked={formData.documentoTipo === "cpf"}
            onChange={handleChange}
            />
            CPF
        </label>
        </div>
        <input
        type="text"
        name="documento"
        value={formData.documento}
        onChange={handleChange}
        required
        />

        <label>Telefone:</label>
        <input
        type="text"
        name="telefone"
        value={formData.telefone}
        onChange={handleChange}
        required
        />

        <label>Email:</label>
        <input
        type="email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        required
        />

        <label>Senha:</label>
        <input
        type="password"
        name="senha"
        value={formData.senha}
        onChange={handleChange}
        required
        />

        {errorMessage && <div className={styles["error-message"]}>{errorMessage}</div>}

        <button type="submit" disabled={loading}>
        {loading ? "Cadastrando..." : "Cadastrar"}
        </button>
    </form>
    </div>

  );
};

export default Cadastro;
