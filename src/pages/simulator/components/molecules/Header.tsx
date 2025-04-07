import { Link } from "@tanstack/react-router";
import { data } from "../../../../shared/constants/data-cards";
import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, Home, X } from "lucide-react";

export function Header() {
    const [menuType, setMenuType] = useState<"sim" | "concepts" | null>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    const simuladores = data.map((d) => ({
        title: d.title,
        to: d.toPracticar.replace("$estructura", String(d.id)),
    }));

    const conceptos = data.map((d) => ({
        title: d.title,
        to: d.toConceptos.replace("$estructura", String(d.id)),
    }));

    const closeMenu = () => setMenuType(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                menuRef.current &&
                !menuRef.current.contains(event.target as Node)
            ) {
                closeMenu();
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <header className="sticky top-0 left-0 w-full z-50 bg-[#1a1a1a] border-b border-[#2a2a2a] shadow-lg">
            <div className="max-w-7xl mx-auto px-4 pt-4 pb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                {/* Fila izquierda: navegación */}
                <div className="flex items-center gap-2 justify-center sm:justify-start">
                    <button
                        onClick={() => window.history.back()}
                        aria-label="Atrás"
                        title="Atrás"
                    >
                        <ChevronLeft className="text-red-400 hover:text-red-300" />
                    </button>
                    <button
                        onClick={() => window.history.forward()}
                        aria-label="Adelante"
                        title="Adelante"
                    >
                        <ChevronRight className="text-red-400 hover:text-red-300" />
                    </button>
                    <Link
                        to="/"
                        className="ml-2 text-white font-bold text-base sm:text-lg hover:text-red-400 flex items-center gap-1"
                    >
                        <Home className="w-5 h-5" /> Inicio
                    </Link>
                </div>

                {/* Título institucional */}
                <div className="text-center w-full sm:w-auto">
                    <h1 className="text-white text-base sm:text-lg font-bold tracking-wide uppercase leading-tight">
                        MEDIADOR PEDAGÓGICO:{" "}
                        <span className="text-red-500">SEED</span>
                    </h1>
                </div>

                {/* Botones de navegación */}
                <nav className="flex items-center justify-center gap-3 sm:gap-6 sm:justify-end">
                    <Link
                        to="/simulador/memoria"
                        className="font-semibold text-white border border-white/20 px-3 py-1 rounded hover:bg-white/10 transition"
                    >
                        Simulador Memoria
                    </Link>

                    <button
                        onClick={() =>
                            setMenuType(menuType === "sim" ? null : "sim")
                        }
                        className={`font-semibold px-2 py-1 transition hover:text-red-400 ${
                            menuType === "sim" ? "text-red-400" : "text-white"
                        }`}
                    >
                        Simuladores de Estructuras
                    </button>

                    <button
                        onClick={() =>
                            setMenuType(
                                menuType === "concepts" ? null : "concepts"
                            )
                        }
                        className={`font-semibold px-2 py-1 transition hover:text-red-400 ${
                            menuType === "concepts"
                                ? "text-red-400"
                                : "text-white"
                        }`}
                    >
                        Conceptos
                    </button>
                </nav>
            </div>

            {/* Menú desplegable */}
            {menuType && (
                <div
                    ref={menuRef}
                    className="absolute top-full w-full left-0 bg-[#1f1f1f] border-t border-[#2a2a2a] shadow-xl py-6 px-4 sm:px-10 z-40"
                >
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-white font-bold text-lg">
                            {menuType === "sim"
                                ? "Simuladores disponibles"
                                : "Conceptos disponibles"}
                        </h2>
                        <button
                            onClick={closeMenu}
                            className="text-white hover:text-red-400"
                            title="Cerrar"
                        >
                            <X />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-[50vh] overflow-y-auto scrollbar-thin scrollbar-thumb-[#D72638]/60">
                        {(menuType === "sim" ? simuladores : conceptos).map(
                            (item) => (
                                <Link
                                    key={item.title}
                                    to={item.to}
                                    onClick={closeMenu}
                                    className="block px-4 py-2 bg-[#262626] rounded hover:bg-red-500 hover:text-black transition font-medium text-sm text-white border border-transparent hover:border-red-300"
                                >
                                    {item.title}
                                </Link>
                            )
                        )}
                    </div>
                </div>
            )}
        </header>
    );
}
