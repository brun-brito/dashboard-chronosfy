import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../services/Firebase";
import { useNavigate, useLocation } from "react-router-dom";
import styles from "../assets/Login.module.css";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState(location.state?.email || "");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/dashboard");
    } catch (err) {
      setError("Credenciais inválidas. Tente novamente.");
    }
  };

  return (
    <div className={styles["page-container"]}>
    <div className={styles["form-container"]}>
      <h1>Login</h1>
      {error && <p className={styles["error-message"]}>{error}</p>}
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Entrar</button>
      </form>
      <p className={styles["register-link"]}>
        Ainda não possui conta?{" "}
        <span onClick={() => navigate("/cadastro")}>Cadastrar</span>
      </p>
    </div>
  </div>
  );
};

export default Login;
