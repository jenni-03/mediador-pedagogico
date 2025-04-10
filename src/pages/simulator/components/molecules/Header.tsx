import { Link } from "@tanstack/react-router";
import { data } from "../../../../shared/constants/data-cards";
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Home } from "lucide-react";
import { DropdownMenu } from "./DropdownMenu";

export function Header() {
  const [menuType, setMenuType] = useState<"sim" | "concepts" | null>(null);

  const simuladores = data.map((d) => ({
    title: d.title,
    to: d.toPracticar.replace("$estructura", String(d.id)),
  }));

  const conceptos = data.map((d) => ({
    title: d.title,
    to: d.toConceptos.replace("$estructura", String(d.id)),
  }));

  // Este useEffect se encarga de eliminar el scroll horizontal general
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    html.style.overflowX = "hidden";
    body.style.overflowX = "hidden";

    const fixScroll = () => {
      const pageWidth = document.documentElement.scrollWidth;
      const screenWidth = window.innerWidth;
      document.body.style.transform =
        pageWidth > screenWidth ? `translateX(-${pageWidth - screenWidth}px)` : "none";
    };

    fixScroll();
    window.addEventListener("resize", fixScroll);
    return () => {
      html.style.overflowX = "";
      body.style.overflowX = "";
      body.style.transform = "none";
      window.removeEventListener("resize", fixScroll);
    };
  }, []);

  // Opción A: Congela el scroll de la página (body) cuando el menú está abierto
  useEffect(() => {
    // Bloqueo/Desbloqueo de scroll en body
    if (menuType) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  
    // Además, bloquea/Desbloquea el contenedor principal con .flex-1.overflow-y-auto
    const mainContent = document.querySelector(".flex-1.overflow-y-auto") as HTMLElement | null;
    if (mainContent) {
      if (menuType) {
        mainContent.style.overflow = "hidden";
      } else {
        mainContent.style.overflow = "auto";
      }
    }
  }, [menuType]);
  

  return (
    <header className="sticky top-0 left-0 w-full z-50 bg-[#1a1a1a] border-b border-[#2a2a2a] shadow-lg overflow-visible">
      <div className="max-w-7xl mx-auto px-4 pt-4 pb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 justify-center sm:justify-start">
          <button onClick={() => window.history.back()}>
            <ChevronLeft className="text-red-400 hover:text-red-300" />
          </button>
          <button onClick={() => window.history.forward()}>
            <ChevronRight className="text-red-400 hover:text-red-300" />
          </button>
          <Link
            to="/"
            className="ml-2 text-white font-bold text-base sm:text-lg hover:text-red-400 flex items-center gap-1"
          >
            <Home className="w-5 h-5" /> Inicio
          </Link>
        </div>

        <div className="text-center w-full sm:w-auto">
          <h1 className="text-white text-base sm:text-lg font-bold tracking-wide uppercase leading-tight">
            MEDIADOR PEDAGÓGICO: <span className="text-red-500">SEED</span>
          </h1>
        </div>

        <nav className="flex items-center justify-center gap-3 sm:gap-6 sm:justify-end">
          <Link
            to="/simulador/memoria"
            className="font-semibold text-white border border-white/20 px-3 py-1 rounded hover:bg-white/10 transition"
          >
            Simulador Memoria
          </Link>

          <button
            onClick={() => setMenuType(menuType === "sim" ? null : "sim")}
            className={`font-semibold px-2 py-1 transition hover:text-red-400 ${
              menuType === "sim" ? "text-red-400" : "text-white"
            }`}
          >
            Simuladores de Estructuras
          </button>

          <button
            onClick={() => setMenuType(menuType === "concepts" ? null : "concepts")}
            className={`font-semibold px-2 py-1 transition hover:text-red-400 ${
              menuType === "concepts" ? "text-red-400" : "text-white"
            }`}
          >
            Conceptos
          </button>
        </nav>
      </div>

      {/* Menú integrado dentro del header */}
      {menuType && (
        <DropdownMenu
          type={menuType}
          items={menuType === "sim" ? simuladores : conceptos}
          onClose={() => setMenuType(null)}
        />
      )}
    </header>
  );
}
