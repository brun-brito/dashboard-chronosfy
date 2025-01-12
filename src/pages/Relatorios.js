import React, { useState, useContext } from "react";
import api from "../services/Api";
import styles from "../assets/Relatorios.module.css";
import { AuthContext } from "../context/AuthContext";
import style from "../assets/Loading.module.css";

const Relatorios = () => {
  const [relatorios, setRelatorios] = useState(null);
  const [clientesOrdenados, setClientesOrdenados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [periodo, setPeriodo] = useState({ inicio: "", fim: "" });
  const [ordenacao, setOrdenacao] = useState({ campo: "visitas", ordem: "desc" });
  const { user } = useContext(AuthContext);

  const fetchRelatorios = async () => {
    try {
      setLoading(true);
      const response = await api.get(
        `/v1/profissional/${user.uid}/relatorios?startDate=${periodo.inicio}&endDate=${periodo.fim}`
      );
      const clientes = Object.values(response.data.clientesVisitados);
      ordenarClientes(clientes, "visitas", "desc"); // Ordenação padrão
      setRelatorios(response.data);
      setError(null);
    } catch (err) {
      setError("Erro ao carregar os relatórios. Tente novamente.");
      console.error("Erro ao buscar relatórios:", err);
    } finally {
      setLoading(false);
    }
  };

  const ordenarClientes = (clientes, campo, ordem) => {
    const sorted = [...clientes].sort((a, b) => {
      if (ordem === "asc") return a[campo] > b[campo] ? 1 : -1;
      return a[campo] < b[campo] ? 1 : -1;
    });
    setClientesOrdenados(sorted);
    setOrdenacao({ campo, ordem });
  };

  const handleOrdenacao = (campo) => {
    const novaOrdem = ordenacao.campo === campo && ordenacao.ordem === "asc" ? "desc" : "asc";
    ordenarClientes(clientesOrdenados, campo, novaOrdem);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPeriodo((prev) => ({ ...prev, [name]: value }));
  };

  const handleGenerateReport = (e) => {
    e.preventDefault();
    if (periodo.inicio && periodo.fim) {
      fetchRelatorios();
    } else {
      setError("Por favor, preencha o período de início e fim.");
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
    return <p className={styles.error}>{error}</p>;
  }

  return (
    <div className={styles.relatoriosContainer}>
      <h1>Relatórios</h1>

      {/* Filtro por Período */}
      <form className={styles.filtroPeriodo} onSubmit={handleGenerateReport}>
        <label>
          Início:
          <input
            type="date"
            name="inicio"
            value={periodo.inicio}
            onChange={handleInputChange}
            required
          />
        </label>
        <label>
          Fim:
          <input
            type="date"
            name="fim"
            value={periodo.fim}
            onChange={handleInputChange}
            required
          />
        </label>
        <button type="submit" className={styles.botaoGerar}>
          Gerar Relatório
        </button>
      </form>

      {/* Relatório */}
      {relatorios && (
        <div className={styles.relatoriosDetalhes}>
          <h2>Resumo do Período</h2>
          <p>
            <strong>Período:</strong> {relatorios.periodo.inicio} a{" "}
            {relatorios.periodo.fim}
          </p>
          <p>
            <strong>Serviço Mais Utilizado:</strong>{" "}
            {relatorios.servicoMaisUtilizado.nomeServico} (
            {relatorios.servicoMaisUtilizado.frequencia} vezes)
          </p>
          <p>
            <strong>Faturamento Total:</strong> R$ {relatorios.faturamentoTotal}
          </p>
          <p>
            <strong>Total de Agendamentos:</strong>{" "}
            {relatorios.totalAgendamentos}
          </p>

          <h2>Clientes Visitados</h2>
          <table className={styles.clientesTable}>
            <thead>
              <tr>
                <th onClick={() => handleOrdenacao("nome")}>
                  Nome{" "}
                  {ordenacao.campo === "nome" ? ordenacao.ordem === "asc" ? "▲" : "▼": "▲▼"}
                </th>

                <th onClick={() => handleOrdenacao("valor")}>
                  Valor Total {" "} {ordenacao.campo === "valor" ? (ordenacao.ordem === "asc" ? "▲" : "▼"): "▲▼"}
                </th>
                <th onClick={() => handleOrdenacao("visitas")}>
                  Visitas ▲▼  {ordenacao.campo === "visitas" && (ordenacao.ordem === "asc" ? "▲" : "▼")}
                </th>
                <th style={{ cursor: "initial", backgroundColor: "#f4f4f4" }}>Serviços</th>
              </tr>
            </thead>
            <tbody>
              {clientesOrdenados.map((cliente, index) => (
                <tr key={index}>
                  <td>{cliente.nome}</td>
                  <td>R$ {cliente.valor.toFixed(2)}</td>
                  <td>{cliente.visitas}</td>
                  <td>{cliente.servicos.join(", ")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Relatorios;
