import React from "react";

const AddHorarioButton = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      style={{
        backgroundColor: "#28a745", // Verde
        color: "#fff",
        border: "none",
        borderRadius: "4px",
        padding: "10px 15px",
        fontSize: "16px",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: "8px",
      }}
    >
      <span style={{ fontSize: "20px", fontWeight: "bold" }}>+</span>
      Adicionar Horário
    </button>
  );
};

export default AddHorarioButton;
