import React, { useEffect, useState, useContext } from "react";
import api from "../services/Api";
import styles from "../assets/Perfil.module.css";
import { AuthContext } from "../context/AuthContext";
import { PerfilContext } from "../context/PerfilContext";

const Perfil = () => {
  const { user } = useContext(AuthContext);
  const { dadosUsuario, setDadosUsuario } = useContext(PerfilContext);
  const [loading, setLoading] = useState(!dadosUsuario);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDadosUsuario = async () => {
      if (dadosUsuario) return;

      try {
        const response = await api.get(`/v1/profissional/${user.uid}`);
        setDadosUsuario(response.data);
      } catch (err) {
        setError("Erro ao carregar os dados do perfil.");
      } finally {
        setLoading(false);
      }
    };

    fetchDadosUsuario();
  }, [dadosUsuario, setDadosUsuario, user.uid]);

  if (loading) {
    return <p>Carregando...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div className={styles.perfilContainer}>
      <h1>Perfil</h1>
      <div className={styles.perfilInfo}>
        <p><strong>Nome:</strong> {dadosUsuario.nome}</p>
        <p><strong>CNPJ:</strong> {dadosUsuario.cnpj}</p>
        <p><strong>Email:</strong> {dadosUsuario.email}</p>
        <p><strong>Telefone:</strong> {dadosUsuario.telefone}</p>
        <p><strong>Endereço:</strong> {dadosUsuario.endereco?.rua || "Não informado"}</p>
        <h2>Serviços Oferecidos</h2>
        <ul className={styles.servicosList}>
          {dadosUsuario.servicos.map((servico, index) => (
            <li key={index}>
              {servico.nome} - R$ {servico.valor.toFixed(2)}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Perfil;
