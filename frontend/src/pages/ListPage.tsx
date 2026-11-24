import { useEffect, useState } from "react";
import ItemCard from "../components/ItemCard";
import Pagination from "../components/Pagination";
import { getWorkshops } from "../api/services";
import type { Workshop } from "../types";
import { useAxiosForApi } from "../context/AuthContext";

const PAGE_SIZE = 5;

const ListPage = () => {
  const [http] = useAxiosForApi();
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Cada vez que cambia la página se vuelve a consultar al servidor
  useEffect(() => {
    const loadWorkshops = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await getWorkshops(http, page, PAGE_SIZE);
        setWorkshops(data.items);
        setTotalPages(data.totalPages);
      } catch {
        setError("No se pudieron cargar los talleres.");
      } finally {
        setLoading(false);
      }
    };

    loadWorkshops();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-800">Talleres culturales</h1>

      {loading && <p className="text-gray-600">Cargando talleres...</p>}

      {!loading && error && <p className="text-red-600">{error}</p>}

      {!loading && !error && workshops.length === 0 && (
        <p className="text-gray-600">No hay talleres disponibles.</p>
      )}

      {!loading && !error && workshops.length > 0 && (
        <div className="grid gap-4">
          {workshops.map((workshop) => (
            <ItemCard key={workshop.id} workshop={workshop} />
          ))}
        </div>
      )}

      <Pagination
        page={page}
        totalPages={totalPages}
        onPrevious={() => setPage(page - 1)}
        onNext={() => setPage(page + 1)}
      />
    </div>
  );
};

export default ListPage;
