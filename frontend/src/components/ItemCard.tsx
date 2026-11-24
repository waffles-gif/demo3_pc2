import { Link } from "react-router-dom";
import type { Workshop } from "../types";

interface ItemCardProps {
  workshop: Workshop;
}

const ItemCard = ({ workshop }: ItemCardProps) => {
  return (
    <Link
      to={`/workshops/${workshop.id}`}
      className="block rounded-lg bg-white p-5 shadow hover:shadow-md transition"
    >
      <h2 className="text-lg font-semibold text-gray-800">{workshop.name}</h2>
      <p className="text-sm text-gray-500">{workshop.discipline}</p>

      <div className="mt-3 flex justify-between text-sm text-gray-700">
        <span>Fecha: {workshop.date}</span>
        <span>Vacantes: {workshop.vacancies}</span>
      </div>
    </Link>
  );
};

export default ItemCard;
