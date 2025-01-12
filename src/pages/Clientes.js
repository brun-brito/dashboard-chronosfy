import React, { useEffect, useState, useContext } from "react";
import api from "../services/Api";
import styles from "../assets/Clientes.module.css";
import { AuthContext } from "../context/AuthContext";
import { FaEdit, FaTrash, FaSave, FaTimes, FaPlus } from "react-icons/fa";
import style from "../assets/Loading.module.css";

const Clientes = () => {
  const { user } = useContext(AuthContext);
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newCliente, setNewCliente] = useState({ nome: "", cpf: "", email: "", telefone: "" });
  const [showAddClienteForm, setShowAddClienteForm] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [mostrarTodos, setMostrarTodos] = useState(false);
  const [clientesToShow] = useState(window.innerWidth <= 768 ? 4 : 8);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const response = await api.get(`/v1/profissional/${user.uid}/clientes`);
        setClientes(response.data);
        setError(null);
      } catch (err) {
        setError(`Erro ao carregar os clientes: ${err.response.data.error || "Erro desconhecido"}`);
      } finally {
        setLoading(false);
      }
    };
    fetchClientes();
  }, [user.uid]);

  const handleAddCliente = async () => {
    if (newCliente.nome.trim() && newCliente.cpf.trim() && newCliente.email.trim()) {

      setNewCliente({ nome: "", cpf: "", email: "", telefone: "" });
      setShowAddClienteForm(false);

      try {
        const response = await api.post(`/v1/profissional/${user.uid}/clientes`, newCliente);
        const novoCliente = { ...newCliente, id: response.data.id };
        setClientes((prev) => [...prev, novoCliente]);
        setError(null);
      } catch (err) {
        setError(`Erro ao adicionar o cliente: ${err.response.data.error || "Erro desconhecido"}`);
      }
    }
  };

  const handleEditCliente = (index) => {
    setEditIndex(index);
  };

  const handleSaveEditCliente = async (e, index) => {
    e.preventDefault();
    try {
      await api.put(`/v1/profissional/${user.uid}/clientes/${clientes[index].id}`, clientes[index]);
      setEditIndex(null);
    } catch (err) {
      setError(`Erro ao editar cliente: ${err.response.data.error || "Erro desconhecido"}`);
    }
  };

  const handleRemoveCliente = async (index) => {
    if (window.confirm("Tem certeza de que deseja excluir este cliente?")) {
      const updatedClientes = [...clientes];
      const clienteId = updatedClientes[index].id;
      updatedClientes.splice(index, 1);
      setClientes(updatedClientes);

      try {
        await api.delete(`/v1/profissional/${user.uid}/clientes/${clienteId}`);
      } catch (err) {
        console.error("Erro ao remover cliente:", err.response.data.error);
      }
    }
  };

  const handleClienteChange = (index, field, value) => {
    const updatedClientes = [...clientes];
    updatedClientes[index][field] = value;
    setClientes(updatedClientes);
  };
  
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };
  
  const filteredClientes = clientes.filter((cliente) =>
    cliente.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );  

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
      <div style={{ textAlign: "center", padding: "20px" }}>
        <p style={{ color: "red", marginBottom: "20px" }}>{error}</p>
        <button
          onClick={() => window.location.reload()}
          style={{
            padding: "10px 20px",
            fontSize: "16px",
            backgroundColor: "#4a148c",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Voltar
        </button>
      </div>
    );
  }
  

  return (
    <div className={styles.clientesContainer}>
      <h1>Clientes</h1>
      <div className={styles.searchBar}>
          <label htmlFor="search">Buscar Cliente:</label>
          <input
            type="text"
            id="search"
            placeholder="Digite o nome do cliente"
            value={searchTerm}
            onChange={handleSearchChange}
            className={styles.searchInput}
          />
        </div>

      <div className={styles.clientesGrid}>
          {(clientes.length === 0 || filteredClientes.length === 0)? (
        <p>
          Nenhum cliente encontrado. Adicione clicando no botão abaixo.
        </p>
      ) : (
        (mostrarTodos ? filteredClientes : filteredClientes.slice(0, clientesToShow)).map((cliente, index) => (
          <div key={cliente.id || index} className={styles.clienteCard}>
            {editIndex === index ? (
              <>
              <form onSubmit={(e) => handleSaveEditCliente(e, index)}>
                <label>Nome:</label>
                <input
                  type="text"
                  value={cliente.nome}
                  onChange={(e) => handleClienteChange(index, "nome", e.target.value)}
                  required
                />
                <label>CPF:</label>
                <input
                  type="text"
                  value={cliente.cpf}
                  onChange={(e) =>
                    handleClienteChange(
                      index,
                      "cpf",
                      e.target.value.replace(/\D/g, "").slice(0, 11) // Permite apenas números, limita a 11
                    )
                  }
                  placeholder="Digite o CPF"
                  maxLength="11"
                  minLength="11"                  required
                />
                <label>E-mail:</label>
                <input
                  type="email"
                  value={cliente.email}
                  onChange={(e) => handleClienteChange(index, "email", e.target.value)}
                  required
                />
                <label>Telefone:</label>
                <input
                  type="text"
                  value={cliente.telefone}
                  onChange={(e) =>
                    handleClienteChange(
                      index,
                      "telefone",
                      e.target.value.replace(/\D/g, "").slice(0, 11) // Permite apenas números, limita a 11
                    )
                  }
                  placeholder="Digite o número de telefone"
                  maxLength="11"
                  minLength="11"                  required
                />
                <div className={styles.cardActions}>
                  <button className={styles.saveButton} type="submit">
                    <FaSave />
                  </button>
                  <button className={styles.cancelButton} onClick={() => setEditIndex(null)}>
                    <FaTimes />
                  </button>
                </div>
              </form>        
              </>
            ) : (
              <>
                <p><strong>Nome:</strong> {cliente.nome}</p>
                <p><strong>CPF:</strong> {cliente.cpf}</p>
                <p><strong>E-mail:</strong> {cliente.email}</p>
                <p><strong>Telefone:</strong> {cliente.telefone}</p>
                <div className={styles.cardActions}>
                  <button className={styles.editButton} onClick={() => handleEditCliente(index)}>
                    <FaEdit />
                  </button>
                  <button className={styles.removeButton} onClick={() => handleRemoveCliente(index)}>
                    <FaTrash />
                  </button>
                </div>
              </>
            )}
          </div>
        ))
      )}
      </div>

      <div className={styles.clientesHeader}>
        {clientes.length > clientesToShow && (
          <button className={styles.toggleButton} onClick={() => setMostrarTodos(!mostrarTodos)}>
            {mostrarTodos ? "▲ Ver menos" : "▼ Ver tudo"}
          </button>
        )}

        <button
          onClick={() => setShowAddClienteForm(!showAddClienteForm)}
          className={`${styles.addClienteButton} ${showAddClienteForm ? styles.cancelButton : styles.addButton}`}
        >
          {showAddClienteForm ? (
            <>
              <FaTimes className={styles.icon} /> Cancelar
            </>
          ) : (
            <>
              <FaPlus className={styles.icon} /> Adicionar Cliente
            </>
          )}
        </button>
      </div>

      {showAddClienteForm && (
        <form
          onSubmit={(e) => {
            e.preventDefault(); // Previne o comportamento padrão do formulário
            handleAddCliente();
          }}
          className={styles.newCliente}
        >        
          <h3>Adicionar Cliente</h3>
          <div className={styles.clienteField}>
            <label>Nome:</label>
            <input
              type="text"
              placeholder="Nome do cliente"
              value={newCliente.nome}
              onChange={(e) =>
                setNewCliente((prev) => ({ ...prev, nome: e.target.value }))
              }
              required
            />
          </div>
          <div className={styles.clienteField}>
            <label>CPF:</label>
            <input
              type="text"
              placeholder="CPF"
              value={newCliente.cpf}
              onChange={(e) =>
                setNewCliente((prev) => ({
                  ...prev,
                  cpf: e.target.value.replace(/\D/g, "").slice(0, 11), // Apenas números e máximo de 11 caracteres
                }))
              }
              maxLength="11"
              minLength="11"
              required
            />
          </div>
          <div className={styles.clienteField}>
            <label>E-mail:</label>
            <input
              type="email"
              placeholder="E-mail"
              value={newCliente.email}
              onChange={(e) =>
                setNewCliente((prev) => ({ ...prev, email: e.target.value }))
              }
              required
            />
          </div>
          <div className={styles.clienteField}>
            <label>Telefone:</label>
            <input
              type="text"
              placeholder="Telefone"
              value={newCliente.telefone}
              onChange={(e) =>
                setNewCliente((prev) => ({
                  ...prev,
                  telefone: e.target.value.replace(/\D/g, "").slice(0, 11), // Apenas números e máximo de 11 caracteres
                }))
              }
              maxLength="11"
              minLength="11"
              required
            />
          </div>
          <button type="submit" className={styles.saveButton}>
            <FaSave className={styles.icon} /> Salvar Cliente
          </button>
        </form>
      )}
    </div>
  );
};

export default Clientes;
