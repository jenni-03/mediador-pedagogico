import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";

export const Route = createFileRoute("/conceptos/$estructura")({
  component: RouteComponent,
});

function RouteComponent() {
  const { estructura } = Route.useParams();
  const navigate = Route.useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Redirige a /definicion si la URL es /conceptos/:estructura
  useEffect(() => {
    navigate({ to: `/conceptos/${estructura}/definicion`, replace: true });
  }, [estructura, navigate]);

  return (
    <div className="flex h-screen">
      {/* Sidebar dinámico, dependiendo del tamaño de la pantalla*/}
      <div className={`transition-all duration-300 ${isSidebarOpen ? "w-64" : "w-10"} md:w-64`}>
        <Sidebar estructura={estructura} isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      </div>
      <div className="flex-1 p-4 overflow-y-auto">
        <Outlet /> {/* Renderiza las subrutas */}
      </div>
    </div>
  );
}
