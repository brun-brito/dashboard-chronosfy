import React, { useContext } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, AuthContext } from "./context/AuthContext";
import Login from "./pages/Login";
import Cadastro from "./pages/Cadastro";
import Dashboard from "./pages/Dashboard";
import Perfil from "./pages/Perfil";
import Horario from "./pages/Horario";
import Clientes from "./pages/Clientes";
import ProtectedRoute from "./routes/ProtectedRoute";
import Layout from "./pages/Layout";
import { PerfilProvider } from "./context/PerfilContext";
import { DashboardProvider } from "./context/DashboardContext";

const RedirectToDashboardOrLogin = () => {
  const { user } = useContext(AuthContext);

  return user ? <Navigate to="/dashboard" /> : <Navigate to="/login" />;
};

const App = () => {
  return (
    <AuthProvider>
      <PerfilProvider>
        <DashboardProvider>
          <Router>
            <Routes>
              {/* Layout principal com Sidebar */}
              <Route path="/" element={<Layout />}>
                {/* Redireciona para Login ou Dashboard */}
                <Route index element={<RedirectToDashboardOrLogin />} />

                {/* Rotas públicas */}
                <Route path="login" element={<Login />} />
                <Route path="cadastro" element={<Cadastro />} />

                {/* Rotas protegidas */}
                <Route
                  path="dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="perfil"
                  element={
                    <ProtectedRoute>
                      <Perfil />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="horario"
                  element={
                    <ProtectedRoute>
                      <Horario />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="clientes"
                  element={
                    <ProtectedRoute>
                      <Clientes />
                    </ProtectedRoute>
                  }
                />
              </Route>
            </Routes>
          </Router>
        </DashboardProvider>          
      </PerfilProvider>
    </AuthProvider>
  );
};

export default App;
