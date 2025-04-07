import { SideBarProps } from "../../../types";
import { SidebarItem } from "./SidebarItem";

export function SideBar({ estructura, isOpen, setIsOpen }: SideBarProps) {
  const menuItems = [
    { to: "/conceptos/$estructura/definicion", label: "Definición" },
    { to: "/conceptos/$estructura/operaciones", label: "Operaciones" },
    { to: "/conceptos/$estructura/complejidad", label: "Costo y Complejidad" },
  ];

  return (
    <>
      {/* Botón abrir menú en móviles */}
      {!isOpen && (
        <button
          className="fixed top-4 left-4 z-[100] text-3xl text-white md:hidden"
          onClick={() => setIsOpen(true)}
        >
          <i className="pi pi-bars"></i>
        </button>
      )}

      {/* Sidebar */}
      <div
        className={`
          ${isOpen ? "fixed" : "hidden"} 
          md:block md:relative 
          top-0 left-0 w-64 h-full md:h-screen 
          bg-[#1a1a1a] border-r border-red-500 p-6
          transition-transform duration-300 z-[90] shadow-xl
        `}
      >
        {/* Botón cerrar en móviles */}
        <button
          className="absolute top-4 right-4 text-2xl text-gray-400 hover:text-red-500 md:hidden"
          onClick={() => setIsOpen(false)}
        >
          <i className="pi pi-times"></i>
        </button>

        {/* Título */}
        <h1 className="text-2xl font-extrabold tracking-wide text-white mb-2">
          <span className="text-white">Mediador</span>
          <span className="text-red-500"> Pedagógico</span>
        </h1>
        <hr className="border-red-500 mb-6" />

        {/* Menú */}
        <ul className="space-y-5">
          {menuItems.map((item) => (
            <SidebarItem
              key={item.to}
              to={item.to}
              params={estructura}
              label={item.label}
            />
          ))}
        </ul>
      </div>

      {/* Fondo oscuro solo en móvil cuando está abierto */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-50 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
