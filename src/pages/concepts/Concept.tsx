import { getRouteApi, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SideBar } from "./components/Sidebar";
import { Header } from "../simulator/components/molecules/Header";

export function Concept() {
  const route = getRouteApi("/conceptos/$estructura");
  const { estructura } = route.useParams();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Redirige a /definicion si la URL es /conceptos/:estructura
  useEffect(() => {
    navigate({ to: `/conceptos/${estructura}/definicion`, replace: true });
  }, [estructura, navigate]);

  // Hace que el botón "Atrás" del navegador redirija al home "/"
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      event.preventDefault();
      navigate({ to: "/", replace: true });
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [navigate]);

  return (
    // Contenedor general que ocupa el 100vh
    <div className="h-screen flex flex-col">
      {/* El Header se integra en la columna (tendrá su altura natural) */}
      <Header />

      {/* Área de contenido que se expande y se hace scroll si es necesario */}
      <div className="flex flex-1">
        {/* Sidebar: se muestra fijo en desktop y como drawer en móvil */}
        <div className="transition-all duration-300">
          <SideBar
            estructura={estructura}
            isOpen={isSidebarOpen}
            setIsOpen={setIsSidebarOpen}
          />
        </div>

        {/* Contenedor del Outlet:
            - flex-1 para ocupar el espacio restante.
            - overflow-y-auto para que se active el scroll en caso de contenido extenso.
            - md:ml-64 para que en desktop se separe del sidebar fijo.
         */}
        <div className="flex-1 overflow-y-auto md:ml-64">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
