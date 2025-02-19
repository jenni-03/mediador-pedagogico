import { createFileRoute } from "@tanstack/react-router";
import { conceptosData } from "../../../constants/conceptsData";

export const Route = createFileRoute("/conceptos/$estructura/complejidad")({
  component: RouteComponent,
});

function RouteComponent() {
  const { estructura } = Route.useParams();
  const data = conceptosData[estructura].complejidad;
  const tipo = conceptosData[estructura].tipo;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">{estructura.toUpperCase()}</h1>
      <h1 className="text-sm text-gray-500 mb-3">{tipo}</h1>
      <hr className="mt-2 mb-4" />
      <div>
        <h1 className="text-xl font-bold mb-3">Análisis Algorítmico</h1>
        <p className="text-gray-700 text-sm mb-5">{data.analisis}</p>
      </div>
    </div>
  );
}
