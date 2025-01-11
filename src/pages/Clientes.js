import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../services/Api";
import styles from "../assets/Clientes.module.css";
import style from "../assets/Loading.module.css";

const Clientes = ({ idProfissional }) => {
  const [clientes, setClientes] = useState([]);
  const [selectedCliente, setSelectedCliente] = useState(null);
  const { user } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    nome: "",
    cpf: "",
    email: "",
    telefone: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState("");
  idProfissional = user.uid;

  // Carrega os clientes apenas uma vez
  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const response = await api.get(`/v1/profissional/${idProfissional}/clientes`);
        setClientes(response.data);
      } catch (error) {
        console.error("Erro ao buscar clientes:", error);
        setFeedback("Erro ao carregar clientes. Tente novamente.");
      }
    };
    fetchClientes();
  }, [idProfissional]);

  // Lida com as mudanças nos campos de formulário
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Adiciona um novo cliente
  const handleAddCliente = async () => {
    setLoading(true);
    setFeedback("");
    try {
      const teste = await api.post(`/v1/profissional/${idProfissional}/clientes`, formData);
      console.log(teste);
      setClientes((prev) => [...prev, formData]); // Adiciona o novo cliente na lista
      setFormData({ nome: "", cpf: "", email: "", telefone: "" }); // Limpa o formulário
      setFeedback("Cliente adicionado com sucesso!");
    } catch (error) {
      console.error("Erro ao adicionar cliente:", error);
      setFeedback(`Erro ao adicionar cliente: ${error.response.data.error}`);
    } finally {
      setLoading(false);
    }
  };

  // Edita os dados de um cliente
  const handleEditCliente = async () => {
    setLoading(true);
    setFeedback("");
    try {
      await api.put(
        `/v1/profissional/${idProfissional}/clientes/${selectedCliente.id}`,
        formData
      );
      setClientes((prev) =>
        prev.map((cliente) =>
          cliente.id === selectedCliente.id ? { ...cliente, ...formData } : cliente
        )
      );
      setSelectedCliente(null);
      setIsEditing(false);
      setFeedback("Cliente editado com sucesso!");
    } catch (error) {
      console.error("Erro ao editar cliente:", error);
      setFeedback("Erro ao editar cliente. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  // Exclui um cliente
  const handleDeleteCliente = async (id) => {
    setLoading(true);
    setFeedback("");
    try {
      await api.delete(`/v1/profissional/${idProfissional}/clientes/${id}`);
      setClientes((prev) => prev.filter((cliente) => cliente.id !== id));
      setFeedback("Cliente excluído com sucesso!");
    } catch (error) {
      console.error("Erro ao excluir cliente:", error);
      setFeedback("Erro ao excluir cliente. Tente novamente.");
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

  return (
    <div className={styles.container}>
      <h1>Clientes</h1>
      <div className={styles.addCliente}>
        <h3>Adicionar Cliente</h3>
        <form className="formulario">
          <input
            type="text"
            name="nome"
            placeholder="Nome"
            value={formData.nome}
            onChange={handleInputChange}
            required
          />
          <input
            type="text"
            name="cpf"
            placeholder="CPF"
            value={formData.cpf}
            onChange={handleInputChange}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleInputChange}
            required
          />
          <input
            type="tel"
            name="telefone"
            placeholder="Telefone"
            value={formData.telefone}
            onChange={handleInputChange}
            required
          />
          <button className="buttonCliente" type="button" onClick={handleAddCliente} disabled={loading}>
            {loading ? "Adicionando..." : "Adicionar"}
          </button>
        </form>
      </div>

      <div className={styles.clientesList}>
        <h3>Lista de Clientes</h3>
        {clientes.length === 0 ? (
          <p className={styles.noClientes}>Nenhum cliente encontrado. Adicione um novo cliente acima.</p>
        ) : (
          clientes.map((cliente, index) => (
            <div key={cliente.id || index} className={styles.clienteCard}>
              <p><strong>Nome:</strong> {cliente.nome}</p>
              <p><strong>CPF:</strong> {cliente.cpf}</p>
              <p><strong>Email:</strong> {cliente.email}</p>
              <p><strong>Telefone:</strong> {cliente.telefone}</p>
              <button onClick={() => setSelectedCliente(cliente)}>Ver Detalhes</button>
              <button onClick={() => handleDeleteCliente(cliente.id)}>Excluir</button>
            </div>
          ))
        )}
      </div>

      {selectedCliente && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h3>{isEditing ? "Editar Cliente" : "Detalhes do Cliente"}</h3>
            {isEditing ? (
              <form>
                <input
                  type="text"
                  name="nome"
                  placeholder="Nome"
                  value={formData.nome}
                  onChange={handleInputChange}
                />
                <input
                  type="text"
                  name="cpf"
                  placeholder="CPF"
                  value={formData.cpf}
                  onChange={handleInputChange}
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleInputChange}
                />
                <input
                  type="tel"
                  name="telefone"
                  placeholder="Telefone"
                  value={formData.telefone}
                  onChange={handleInputChange}
                />
                <button className="buttonCliente" type="button" onClick={handleEditCliente} disabled={loading}>
                  {loading ? "Salvando..." : "Salvar"}
                </button>
              </form>
            ) : (
              <>
                <p><strong>Nome:</strong> {selectedCliente.nome}</p>
                <p><strong>CPF:</strong> {selectedCliente.cpf}</p>
                <p><strong>Email:</strong> {selectedCliente.email}</p>
                <p><strong>Telefone:</strong> {selectedCliente.telefone}</p>
                <button className="buttonCliente" onClick={() => setIsEditing(true)}>Editar</button>
              </>
            )}
            <button className="buttonCliente" onClick={() => setSelectedCliente(null)}>Fechar</button>
          </div>
        </div>
      )}

      {feedback && <p className={styles.feedback}>{feedback}</p>}
    </div>
  );
};

export default Clientes;
