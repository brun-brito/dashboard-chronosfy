import React, { useState, useContext } from "react";
import { Link } from "react-router-dom";
import * as icon from "react-icons/fa";
import styles from "../assets/SideBar.module.css";
import { AuthContext } from "../context/AuthContext";

const SideBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { logout } = useContext(AuthContext);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const handleItemClick = () => {
    setIsOpen(false); // Recolhe a sidebar ao clicar
  };

  return (
    <div
      style={isOpen ? { alignItems: "flex-end" } : { alignItems: "center" }}
      className={`${styles.sidebar} ${isOpen ? styles.open : styles.collapsed}`}
    >
      {/* Botão para expandir/recolher */}
      <div
        className={styles.toggleButton}
        onClick={toggleSidebar}
        style={{ right: isOpen ? "-20px" : "-10px" }}
      >
        {(!isOpen && <icon.FaChevronRight />) || (isOpen && <icon.FaChevronLeft />)}
      </div>

      <nav>
        <ul className={styles.navList}>
          <li className={styles.navItem} onClick={handleItemClick}>
            <Link to="/dashboard">
              <icon.FaCalendarAlt className={styles.icon} />
              {isOpen && <span>Dashboard</span>}
            </Link>
          </li>
          <li className={styles.navItem} onClick={handleItemClick}>
            <Link to="/perfil">
              <icon.FaUser className={styles.icon} />
              {isOpen && <span>Perfil</span>}
            </Link>
          </li>
          <li className={styles.navItem} onClick={handleItemClick}>
            <Link to="/horario">
              <icon.FaClock className={styles.icon} />
              {isOpen && <span>Horários</span>}
            </Link>
          </li>
          <li className={styles.navItem} onClick={handleItemClick}>
            <Link to="/clientes">
              <icon.FaUsers className={styles.icon} />
              {isOpen && <span>Clientes</span>}
            </Link>
          </li>
          <li className={styles.navItem} onClick={handleItemClick}>
            <Link to="/relatorios">
              <icon.FaChartBar className={styles.icon} />
              {isOpen && <span>Relatórios</span>}
            </Link>
          </li>
        </ul>
        {/* Linha separadora */}
        <hr className={styles.separator} />
        {/* Botão de logout */}
        <ul className={styles.logoutSection}>
          <li
            className={styles.navItem}
            onClick={() => {
              handleItemClick();
              logout(); // Também faz logout
            }}
          >
            <icon.FaSignOutAlt className={styles.icon} style={{ color: "red" }} />
            {isOpen && <span>Sair</span>}
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default SideBar;
