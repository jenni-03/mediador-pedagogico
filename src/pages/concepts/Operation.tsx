import { getRouteApi } from "@tanstack/react-router";
import { conceptosData } from "../../shared/constants/conceptsData";

export function Operation() {
    const route = getRouteApi("/conceptos/$estructura/operaciones");

    const { estructura } = route.useParams();
    const nombre = conceptosData[estructura].nombre;
    const data = conceptosData[estructura].operaciones;
    const tipo = conceptosData[estructura].tipo;

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-1">{nombre.toUpperCase()}</h1>
            <h1 className="text-sm text-gray-500 mb-3">{tipo}</h1>
            <hr className="mt-2 mb-4" />
            <div>
                <h1 className="text-xl font-bold mb-3">Insertar</h1>
                <p className="text-gray-700 text-sm mb-5">{data.insertar}</p>
                <h1 className="text-xl font-bold mb-3">Editar</h1>
                <p className="text-gray-700 text-sm mb-5">{data.editar}</p>
                <h1 className="text-xl font-bold mb-3">Consultar</h1>
                <p className="text-gray-700 text-sm mb-5">{data.consultar}</p>
                <h1 className="text-xl font-bold mb-3">Eliminar</h1>
                <p className="text-gray-700 text-sm mb-5">{data.eliminar}</p>
            </div>
        </div>
    );
}
