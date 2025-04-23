import { useState, useEffect } from "react";
import { SideBarProps } from "../../../types";
import { SidebarItem } from "./SidebarItem";

const HEADER_HEIGHT = 64; // altura del header sticky

// Solo‑móvil
const mobileStyles = `
  fixed left-0 top-0
  w-full h-screen
  p-4 pt-[64px]
`;

// Base escritorio (sin top ni height, para que sea dinámico)
const desktopBaseStyles = `
  lg:fixed lg:left-0
  lg:w-64
  lg:p-6
  lg:translate-x-0
`;

export function SideBar({ estructura, isOpen, setIsOpen }: SideBarProps) {
  const [scrolledPastHeader, setScrolledPastHeader] = useState(false);

  useEffect(() => {
    const onScroll = () =>
      setScrolledPastHeader(window.scrollY >= HEADER_HEIGHT);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Top y alto dinámicos SOLO en escritorio
  const desktopPosition = scrolledPastHeader
    ? "lg:top-0 lg:h-screen"
    : `lg:top-[${HEADER_HEIGHT}px] lg:h-[calc(100vh-${HEADER_HEIGHT}px)]`;

  const menuItems = [
    { to: "/conceptos/$estructura/definicion", label: "Definición" },
    { to: "/conceptos/$estructura/operaciones", label: "Operaciones" },
    { to: "/conceptos/$estructura/complejidad", label: "Costo y Complejidad" },
  ];

  return (
    <>
      {/* Botón abrir en móvil */}
      {!isOpen && (
        <button
          className="fixed top-4 left-4 z-[100] text-3xl text-white lg:hidden"
          onClick={() => setIsOpen(true)}
        >
          <i className="pi pi-bars" />
        </button>
      )}

      {/* Sidebar / Drawer */}
      <div
        className={`
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          ${mobileStyles}
          ${desktopBaseStyles}
          ${desktopPosition}
          lg:flex lg:flex-col          /* << llena alto sin mover el título */
          bg-[#1a1a1a] border-r border-red-500
          shadow-xl z-[100] lg:z-[40]
        `}
      >
        {/* Botón cerrar en móvil */}
        <button
          className="absolute top-4 right-4 text-2xl text-gray-400 hover:text-red-500 lg:hidden"
          onClick={() => setIsOpen(false)}
        >
          <i className="pi pi-times" />
        </button>

        <h1 className="text-2xl font-extrabold tracking-wide text-white mb-2 mt-6 lg:mt-12">
          <span className="text-white">Mediador</span>
          <span className="text-red-500"> Pedagógico</span>
        </h1>
        <hr className="border-red-500 mb-6" />

        {/* Contenedor scrollable => ocupa todo el espacio restante */}
        <div className="flex-1 overflow-y-auto">
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
      </div>

      {/* Overlay en móvil */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-[90] lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
