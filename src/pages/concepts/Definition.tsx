import { getRouteApi } from "@tanstack/react-router";
import { conceptosData } from "../../shared/constants/conceptsData";
// Importa todos los componentes que se pueden renderizar
import { DefinitionSecuencia } from "./components/structures/secuencia/DefinitionSecuencia";

// Mapea los nombres a sus respectivos componentes
const componentMap: Record<string, React.FC> = {
    "Secuencia": DefinitionSecuencia,  // Si nombre = "Secuencia", renderiza <DefinitionSecuencia />
};

export function Definition() {
    const route = getRouteApi("/conceptos/$estructura/definicion");

    const { estructura } = route.useParams();
    const nombre: string = conceptosData[estructura].nombre;

    // Buscar el componente correspondiente en el mapeo, si no existe, usar un fallback
    const DynamicComponent = componentMap[nombre] || (() => <p>Componente no encontrado</p>);
    // const data = conceptosData[estructura].definicion;
    // const tipo = conceptosData[estructura].tipo;

    return (
        <div>
            <DynamicComponent /> {/* Renderiza el componente dinámico aquí */}
        </div>
        // <div className="py-4 px-10">
        //     <h1 className="text-2xl font-bold mb-1">{nombre.toUpperCase()}</h1>
        //     <h1 className="text-sm text-gray-500 mb-3">{tipo}</h1>
        //     <hr className="mt-2 mb-4" />
        //     <div>
        //         <h1 className="text-xl font-bold mb-3">Descripción</h1>
        //         <p className="text-gray-800 text-sm mb-5">{data.descripcion}</p>
        //         <h1 className="text-xl font-bold mb-3">Características</h1>
        //         <ul className="list-disc marker:text-red-500 ml-6 space-y-3">
        //             {data.caracteristicas.map(
        //                 (caracteristica: string, index: number) => (
        //                     <li key={index} className="text-sm text-gray-800">
        //                         {caracteristica}
        //                     </li>
        //                 )
        //             )}
        //         </ul>
        //         {data.otros && (
        //             <p>
        //                 <h1 className="text-xl font-bold mt-3">Secuencia unidimensional</h1>
        //                 {data.otros.map((otro: string, index: number) => (
        //                     <p key={index} className="text-sm text-gray-800 mt-3">{otro}</p>
        //                 ))}
        //             </p>
        //         )}
        //     </div>
        // </div>
    );
}
