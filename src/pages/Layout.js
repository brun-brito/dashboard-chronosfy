import React from "react";
import { Outlet } from "react-router-dom";
import styles from "../assets/Layout.module.css";

const Layout = () => {
  const anoAtual = new Date().getFullYear();

  return (
    <div className={styles["layout-container"]}>
      <main className={styles["content-container"]}>
        <Outlet /> {/* Renderiza o conteúdo da rota atual */}
      </main>
      <footer className={styles.footer}>
        <p>© {anoAtual} Chronosfy. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
};

export default Layout;