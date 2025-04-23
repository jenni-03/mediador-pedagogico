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

  // Ocultar scroll horizontal general
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    html.style.overflowX = "hidden";
    body.style.overflowX = "hidden";

    const fixScroll = () => {
      const pageWidth = document.documentElement.scrollWidth;
      const screenWidth = window.innerWidth;
      document.body.style.transform =
        pageWidth > screenWidth
          ? `translateX(-${pageWidth - screenWidth}px)`
          : "none";
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

  // Congela el scroll cuando el menú está abierto
  useEffect(() => {
    if (menuType) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    const mainContent = document.querySelector(
      ".flex-1.overflow-y-auto"
    ) as HTMLElement | null;
    if (mainContent) {
      mainContent.style.overflow = menuType ? "hidden" : "auto";
    }
  }, [menuType]);

  return (
    <header
      className="
        sticky top-0 left-0 w-full z-50
        overflow-visible
        shadow-lg
        border-b border-[#2a2a2a]
        bg-gradient-to-r from-[#1a1a1a] to-[#2b2b2b]
      "
    >
      <div
        className="
          max-w-7xl mx-auto px-4 pt-4 pb-5
          flex flex-col gap-3 sm:flex-row
          sm:items-center sm:justify-between
        "
      >
        {/* Botones back/forward + Home */}
        <div className="flex items-center gap-3 justify-center sm:justify-start">
          {/* Back */}
          <button
            onClick={() => window.history.back()}
            className="
              p-2 text-white/70
              hover:text-red-400
              hover:scale-105
              transition-transform
            "
            title="Atrás"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Forward */}
          <button
            onClick={() => window.history.forward()}
            className="
              p-2 text-white/70
              hover:text-red-400
              hover:scale-105
              transition-transform
            "
            title="Adelante"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Home */}
          <Link
            to="/"
            className="
              flex items-center gap-1 ml-2
              font-bold text-base sm:text-lg
              text-white hover:text-red-400
              transition-colors
            "
          >
            <Home className="w-5 h-5" />
            <span>Inicio</span>
          </Link>
        </div>

        {/* Título principal */}
        <div className="text-center w-full sm:w-auto">
          <h1
            className="
              text-white text-base sm:text-lg
              font-bold tracking-wide
              uppercase
              leading-tight
            "
          >
            MEDIADOR PEDAGÓGICO: <span className="text-red-500">SEED</span>
          </h1>
        </div>

        {/* Navegación */}
        <nav className="flex items-center justify-center gap-3 sm:gap-6 sm:justify-end">
          <Link
            to="/simulador/memoria"
            className="
              font-semibold
              text-white
              border border-white/20
              px-3 py-1
              rounded
              hover:bg-white/10
              transition
              text-sm
            "
          >
            Simulador Memoria
          </Link>

          {/* Botón: Simuladores de Estructuras */}
          <button
            onClick={() => setMenuType(menuType === "sim" ? null : "sim")}
            className={`
              font-semibold px-3 py-1
              transition
              text-sm
              rounded
              ${
                menuType === "sim"
                  ? "text-red-400 underline underline-offset-4"
                  : "text-white hover:text-red-400"
              }
            `}
          >
            Simuladores de Estructuras
          </button>

          {/* Botón: Conceptos */}
          <button
            onClick={() =>
              setMenuType(menuType === "concepts" ? null : "concepts")
            }
            className={`
              font-semibold px-3 py-1
              transition
              text-sm
              rounded
              ${
                menuType === "concepts"
                  ? "text-red-400 underline underline-offset-4"
                  : "text-white hover:text-red-400"
              }
            `}
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
