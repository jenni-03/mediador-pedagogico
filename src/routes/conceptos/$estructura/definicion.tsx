import { createFileRoute } from "@tanstack/react-router";
import { conceptosData } from "../../../constants/conceptsData";

export const Route = createFileRoute("/conceptos/$estructura/definicion")({
  component: RouteComponent,
});

function RouteComponent() {
  const { estructura } = Route.useParams();
  const data = conceptosData[estructura].definicion;
  const tipo = conceptosData[estructura].tipo;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">{estructura.toUpperCase()}</h1>
      <h1 className="text-sm text-gray-500 mb-3">{tipo}</h1>
      <hr className="mt-2 mb-4" />
      <div>
        <h1 className="text-xl font-bold mb-3">Descripción</h1>
        <p className="text-gray-700 text-sm mb-5">{data.descripcion}</p>
        <h1 className="text-xl font-bold mb-3">Características</h1>
        <ul className="list-disc ml-6">
          {data.caracteristicas.map((caracteristica: string, index: number) => (
            <li key={index} className="text-sm text-gray-700">
              {caracteristica}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
