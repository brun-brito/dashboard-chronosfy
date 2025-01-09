import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import SideBar from "../components/SideBar";
import styles from "../assets/Layout.module.css";

const Layout = () => {
  const anoAtual = new Date().getFullYear();
  const routesWithSidebar = ["/dashboard", "/perfil", "/horario", "/servicos","/clientes", "/relatorios"];
  const routesWithFooter = ["/login", "/cadastro"];
  const location = useLocation();

  return (
    <div className={styles["layout-container"]}>
      {routesWithSidebar.includes(location.pathname) && <SideBar />}
      <div className={styles["main-layout"]}>
        <div className={styles["content-container"]}>
          <Outlet /> {/* Renderiza o conteúdo da rota */}
        </div>
        {routesWithFooter.includes(location.pathname) && (
          <footer className={styles.footer}>
            <p>© {anoAtual} Chronosfy. Todos os direitos reservados.</p>
          </footer>
        )}
      </div>
    </div>
  );
};

export default Layout;
