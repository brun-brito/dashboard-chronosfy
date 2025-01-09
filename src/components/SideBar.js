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
    <div>
      {/* Botão flutuante sempre visível */}
      <div
        className={`${styles.toggleButton} ${!isOpen ? styles.toggleButtonClose : styles.toggleButtonOpen} ${
          isOpen ? styles.openButton : styles.closedButton
        }`}
        onClick={toggleSidebar}
      >
        {isOpen ? <icon.FaChevronLeft /> : <icon.FaChevronRight />}
      </div>

      {/* Sidebar visível apenas se `isOpen` for true */}
      <div
        className={`${styles.sidebar} ${
          isOpen ? styles.openSidebar : styles.hiddenSidebar
        }`}
      >
        <nav>
        <ul className={`${styles.navList} ${isOpen ? styles.navListVisible : styles.navListHidden}`}>
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
            <Link to="/servicos">
              <icon.FaTools className={styles.icon} />
              {isOpen && <span>Serviços</span>}
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
          <hr className={styles.separator} />
          <ul className={`${styles.logoutSection} ${isOpen ? styles.navListVisible : styles.navListHidden}`}>
          {/* <ul className={styles.logoutSection}> */}
            <li
              className={styles.navItem}
              onClick={() => {
                handleItemClick();
                logout();
              }}
            >
              <icon.FaSignOutAlt className={styles.icon} style={{ color: "red" }} />
              {isOpen && <span>Sair</span>}
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default SideBar;
