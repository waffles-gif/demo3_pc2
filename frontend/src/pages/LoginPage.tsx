import { useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import axios from "axios";
import FormField from "../components/FormField";
import { useAuth } from "../context/AuthContext";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) return <Navigate to="/workshops" replace />;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password) {
      setError("Ingresa tu correo y contraseña.");
      return;
    }

    setLoading(true);
    try {
      await login({ email: email.trim(), password });
      navigate("/workshops", { replace: true });
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        setError("Correo o contraseña incorrectos.");
      } else {
        setError("No se pudo iniciar sesión. Inténtalo de nuevo.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md rounded-lg bg-white p-8 shadow">
      <h1 className="mb-6 text-2xl font-bold text-gray-800">Iniciar sesión</h1>
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <FormField
          id="email"
          label="Correo"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <FormField
          id="password"
          label="Contraseña"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && (
          <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? "Ingresando..." : "Ingresar"}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-gray-600">
        ¿No tienes cuenta?{" "}
        <Link to="/register" className="font-medium text-indigo-600 hover:underline">
          Regístrate
        </Link>
      </p>
    </div>
  );
};

export default LoginPage;
