import { SideBarProps } from "../types";
import { SidebarItem } from "./SidebarItem";

export function SideBar({ estructura, isOpen, setIsOpen }: SideBarProps) {
    const menuItems = [
        { to: "/conceptos/$estructura/definicion", label: "Definición" },
        { to: "/conceptos/$estructura/operaciones", label: "Operaciones" },
        {
            to: "/conceptos/$estructura/complejidad",
            label: "Costo y Complejidad",
        },
    ];

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
                    {/* Muestra los elementos del menú */}
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

            {/* Fondo oscuro cuando el menú está abierto */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
                    onClick={() => setIsOpen(false)}
                ></div>
            )}
        </>
    );
}
