interface PaginationProps {
  page: number;
  totalPages: number;
  onPrevious: () => void;
  onNext: () => void;
}

const Pagination = ({ page, totalPages, onPrevious, onNext }: PaginationProps) => {
  const isEmpty = totalPages === 0;
  const disablePrevious = isEmpty || page <= 1;
  const disableNext = isEmpty || page >= totalPages;

  return (
    <div role="group" aria-label="Paginación" className="mt-6 flex items-center justify-center gap-4">
      <button
        type="button"
        onClick={onPrevious}
        disabled={disablePrevious}
        className="rounded-md bg-indigo-600 px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-40"
      >
        Anterior
      </button>

      <span className="text-sm text-gray-700">
        Página {isEmpty ? 0 : page} de {totalPages}
      </span>

      <button
        type="button"
        onClick={onNext}
        disabled={disableNext}
        className="rounded-md bg-indigo-600 px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-40"
      >
        Siguiente
      </button>
    </div>
  );
};

export default Pagination;
