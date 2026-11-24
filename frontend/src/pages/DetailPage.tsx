import { useEffect, useState, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import { enroll, getWorkshop } from "../api/services";
import type { ExperienceLevel, WorkshopDetail } from "../types";
import { useAxiosForApi } from "../context/AuthContext";

const LEVELS = [
  { value: "BEGINNER", label: "Inicial" },
  { value: "INTERMEDIATE", label: "Intermedio" },
  { value: "ADVANCED", label: "Avanzado" },
];

const selectClass = "rounded-md border border-gray-300 px-3 py-2";

const DetailPage = () => {
  const id = Number(useParams().id);
  const [http] = useAxiosForApi();
  const [workshop, setWorkshop] = useState<WorkshopDetail | null>(null);
  const [error, setError] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [level, setLevel] = useState("");
  const [errors, setErrors] = useState<{ session?: string; level?: string }>({});
  const [message, setMessage] = useState("");

  // El 401 lo maneja el interceptor de axios
  const loadWorkshop = () =>
    getWorkshop(http, id).then(setWorkshop).catch(() => setError("No se pudo cargar el taller."));

  useEffect(() => {
    loadWorkshop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const newErrors = {
      session: sessionId ? undefined : "Selecciona una sesión.",
      level: level ? undefined : "Selecciona tu nivel de experiencia.",
    };
    setErrors(newErrors);
    setMessage("");
    if (newErrors.session || newErrors.level) return;

    try {
      await enroll(http, id, { sessionId: Number(sessionId), experienceLevel: level as ExperienceLevel });
      setMessage("¡Inscripción realizada con éxito!");
      loadWorkshop(); // vacantes actualizadas desde el servidor
    } catch (err) {
      const code = axios.isAxiosError(err) ? err.response?.data?.code : undefined;
      setMessage(
        code === "ALREADY_ENROLLED" ? "Ya tienes una inscripción en esta sesión."
        : code === "SESSION_FULL" ? "La sesión está llena."
        : "No se pudo completar la inscripción."
      );
    }
  };

  if (error) return <p className="text-red-600">{error}</p>;
  if (!workshop) return <p className="text-gray-600">Cargando taller...</p>;

  return (
    <div className="flex flex-col gap-6">
      <Link to="/workshops" className="text-sm text-indigo-600 hover:underline">← Volver al listado</Link>

      <section className="rounded-lg bg-white p-6 shadow">
        <h1 className="text-2xl font-bold text-gray-800">{workshop.name}</h1>
        <p className="text-gray-500">{workshop.discipline}</p>
        <p className="mt-2 text-sm text-gray-700">Fecha: {workshop.date} · Vacantes: {workshop.vacancies}</p>

        <h2 className="mt-6 mb-2 font-semibold text-gray-800">Sesiones</h2>
        <ul className="text-sm text-gray-700">
          {workshop.sessions.map((s) => (
            <li key={s.id}>Sesión {s.id} · {s.startsAt} · {s.vacancies} vacantes</li>
          ))}
        </ul>
      </section>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4 rounded-lg bg-white p-6 shadow">
        <h2 className="font-semibold text-gray-800">Inscribirme</h2>

        <label htmlFor="session" className="flex flex-col gap-1 text-sm font-medium text-gray-700">
          Sesión
          <select id="session" value={sessionId} onChange={(e) => setSessionId(e.target.value)} className={selectClass}>
            <option value="">-- Elige una sesión --</option>
            {workshop.sessions.map((s) => (
              <option key={s.id} value={s.id}>Sesión {s.id} · {s.startsAt}</option>
            ))}
          </select>
          {errors.session && <span className="text-red-600">{errors.session}</span>}
        </label>

        <label htmlFor="level" className="flex flex-col gap-1 text-sm font-medium text-gray-700">
          Nivel de experiencia
          <select id="level" value={level} onChange={(e) => setLevel(e.target.value)} className={selectClass}>
            <option value="">-- Elige tu nivel --</option>
            {LEVELS.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
          </select>
          {errors.level && <span className="text-red-600">{errors.level}</span>}
        </label>

        {message && <p role="alert" className="text-sm text-gray-800">{message}</p>}

        <button type="submit" className="self-start rounded-md bg-indigo-600 px-5 py-2 text-white hover:bg-indigo-700">
          Inscribirme
        </button>
      </form>
    </div>
  );
};

export default DetailPage;
