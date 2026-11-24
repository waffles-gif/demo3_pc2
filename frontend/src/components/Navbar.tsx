import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="bg-indigo-600 text-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
        <Link to="/workshops" className="text-lg font-semibold">
          Talleres culturales
        </Link>
        <Link
          to="/logout"
          className="rounded-md bg-white/10 px-4 py-2 text-sm font-medium hover:bg-white/20"
        >
          Cerrar sesión
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
