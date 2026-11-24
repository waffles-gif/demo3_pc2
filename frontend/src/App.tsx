import { useEffect } from "react";
import { Navigate, Outlet, Route, Routes, useNavigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./context/AuthContext";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ListPage from "./pages/ListPage";
import DetailPage from "./pages/DetailPage";

// Layout de las páginas públicas (login y registro)
const LayoutLogin = () => (
  <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
    <Outlet />
  </div>
);

// Layout de las páginas con sesión
const Layout = () => (
  <div className="min-h-screen bg-gray-100">
    <Navbar />
    <main className="mx-auto max-w-5xl px-6 py-8">
      <Outlet />
    </main>
  </div>
);

// Cierra la sesión y manda al login
const Logout = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    logout();
    navigate("/login", { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
};

function App() {
  return (
    <Routes>
      <Route element={<LayoutLogin />}>
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
      </Route>

      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/workshops" element={<ListPage />} />
        <Route path="/workshops/:id" element={<DetailPage />} />
        <Route path="/logout" element={<Logout />} />
      </Route>

      <Route path="*" element={<Navigate to="/workshops" replace />} />
    </Routes>
  );
}

export default App;
