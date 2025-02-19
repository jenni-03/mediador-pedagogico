import { Link, useMatchRoute } from "@tanstack/react-router";

  const Sidebar = ({ estructura, isOpen, setIsOpen }: { estructura: string, isOpen: boolean, setIsOpen: (open: boolean) => void }) => {
  const matchRoute = useMatchRoute();

  const isActive = (path: string) => !!matchRoute({ to: path });

  return (
    <>
      {/* Botón de menú en pantallas pequeñas */}
      {!isOpen && (
        <button
          className="fixed top-4 left-4 z-50 text-3xl md:hidden"
          onClick={() => setIsOpen(true)}
        >
          <i className="pi pi-bars"></i>
        </button>
      )}

      {/* Sidebar */}
      <div
        className={`fixed md:relative top-0 left-0 w-60 h-screen bg-gray-100 p-4 transition-transform duration-300 z-40 
          ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        {/* Botón de cerrar en pantallas pequeñas */}
        <button
          className="absolute top-4 right-4 text-3xl md:hidden"
          onClick={() => setIsOpen(false)}
        >
          <i className="pi pi-times"></i>
        </button>

        <h2 className="text-lg font-bold mb-4">SEED</h2>
        <hr className="mt-1 mb-4" />
        <ul className="space-y-2">
          <li>
            <Link
              to="/conceptos/$estructura/definicion"
              params={{ estructura }}
              className={`block p-2 rounded-lg transition-colors duration-200 ${
                isActive("/conceptos/$estructura/definicion")
                  ? "bg-gray-300 font-medium"
                  : "bg-white text-gray-500 hover:bg-gray-200"
              }`}
            >
              <i
                className={`pi ${isActive("/conceptos/$estructura/definicion") ? "pi-star-fill" : "pi-star"} mr-3`}
              ></i>
              Definición
            </Link>
          </li>
          <li>
            <Link
              to="/conceptos/$estructura/operaciones"
              params={{ estructura }}
              className={`block p-2 rounded-lg transition-colors duration-200 ${
                isActive("/conceptos/$estructura/operaciones")
                  ? "bg-gray-300 font-medium"
                  : "bg-white text-gray-500 hover:bg-gray-200"
              }`}
            >
              <i
                className={`pi ${isActive("/conceptos/$estructura/operaciones") ? "pi-star-fill" : "pi-star"} mr-3`}
              ></i>
              Operaciones
            </Link>
          </li>
          <li>
            <Link
              to="/conceptos/$estructura/complejidad"
              params={{ estructura }}
              className={`block p-2 rounded-lg transition-colors duration-200 ${
                isActive("/conceptos/$estructura/complejidad")
                  ? "bg-gray-300 font-medium"
                  : "bg-white text-gray-500 hover:bg-gray-200"
              }`}
            >
              <i
                className={`pi ${isActive("/conceptos/$estructura/complejidad") ? "pi-star-fill" : "pi-star"} mr-3`}
              ></i>
              Costo y Complejidad
            </Link>
          </li>
        </ul>
      </div>

      {/* Fondo oscuro cuando el menú está abierto */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </>
  );
};

export default Sidebar;
