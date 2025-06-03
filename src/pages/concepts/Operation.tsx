import { getRouteApi } from "@tanstack/react-router";
import { conceptosData } from "../../shared/constants/conceptsData";
import { OperationArbolBinario, OperationCola, OperationColaPrioridad, OperationListaSimple, OperationPila, OperationSecuencia } from "./concepts";
import { OperationTablaHash} from "./components/structures/tabla_hash/OperationTablaHash";

// Mapea los nombres a sus respectivos componentes
const componentMap: Record<string, React.FC> = {
    "Secuencia": OperationSecuencia, // Si nombre = "Secuencia", renderiza <OperationSecuencia />
    "Cola": OperationCola,
    "Cola de Prioridad": OperationColaPrioridad, 
    "Lista Simplemente Enlazada": OperationListaSimple, 
    "Árbol Binario" : OperationArbolBinario,
    "Pila": OperationPila,
    "tabla_hash" : OperationTablaHash,
};

export function Operation() {
    const route = getRouteApi("/conceptos/$estructura/operaciones");

    const { estructura } = route.useParams();
    const nombre = conceptosData[estructura].nombre;

    // Buscar el componente correspondiente en el mapeo, si no existe, usar un fallback
    const DynamicComponent =
        componentMap[nombre] || (() => <p>Componente no encontrado</p>);

    return (
        <div>
            <DynamicComponent /> {/* Renderiza el componente dinámico aquí */}
        </div>
    );
}
