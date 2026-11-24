import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import FormField from "../components/FormField";
import { register } from "../api/services";
import type { ApiError } from "../types";

interface Errors {
  name?: string;
  email?: string;
  password?: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Caracteres ASCII imprimibles (espacio a ~)
const ASCII_PRINTABLE = /^[\x20-\x7E]*$/;

const validate = (name: string, email: string, password: string): Errors => {
  const errors: Errors = {};
  if (!name.trim()) errors.name = "El nombre es obligatorio.";
  else if (name.length > 100) errors.name = "El nombre no puede superar los 100 caracteres.";

  if (!email.trim()) errors.email = "El correo es obligatorio.";
  else if (email.length > 254 || !EMAIL_REGEX.test(email)) errors.email = "Ingresa un correo válido.";

  if (password.length < 8 || password.length > 72)
    errors.password = "La contraseña debe tener entre 8 y 72 caracteres.";
  else if (!ASCII_PRINTABLE.test(password))
    errors.password = "La contraseña solo puede contener caracteres ASCII.";

  return errors;
};

const RegisterPage = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setServerError("");
    const validation = validate(name, email, password);
    setErrors(validation);
    if (Object.keys(validation).length > 0) return;

    setLoading(true);
    try {
      await register({ name: name.trim(), email: email.trim(), password });
      navigate("/login", { replace: true });
    } catch (err) {
      if (axios.isAxiosError<ApiError>(err) && err.response?.data?.message) {
        setServerError(
          err.response.data.code === "EMAIL_EXISTS"
            ? "El correo ya está registrado."
            : err.response.data.message
        );
      } else {
        setServerError("No se pudo completar el registro. Inténtalo de nuevo.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md rounded-lg bg-white p-8 shadow">
      <h1 className="mb-6 text-2xl font-bold text-gray-800">Crear cuenta</h1>
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <FormField
          id="name"
          label="Nombre"
          type="text"
          value={name}
          maxLength={100}
          onChange={(e) => setName(e.target.value)}
          error={errors.name}
        />
        <FormField
          id="email"
          label="Correo"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
        />
        <FormField
          id="password"
          label="Contraseña"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
        />
        {serverError && (
          <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {serverError}
          </p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? "Registrando..." : "Registrarse"}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-gray-600">
        ¿Ya tienes cuenta?{" "}
        <Link to="/login" className="font-medium text-indigo-600 hover:underline">
          Inicia sesión
        </Link>
      </p>
    </div>
  );
};

export default RegisterPage;
