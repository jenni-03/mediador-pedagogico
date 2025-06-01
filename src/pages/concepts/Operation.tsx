import { getRouteApi } from "@tanstack/react-router";
import { conceptosData } from "../../shared/constants/conceptsData";
// Importa todos los componentes que se pueden renderizar
import { OperationSecuencia } from "./components/structures/secuencia/OperationSecuencia";
import { OperationCola } from "./components/structures/cola/OperationCola";
import { OperationColaPrioridad } from "./components/structures/cola_de_prioridad/OperationColaPrioridad";
import { OperationListaSimple } from "./components/structures/lista_simple/OperationListaSimple";
import { OperationArbolBinario } from "./components/structures/arbol_binario/OperationArbolBinario";
import { OperationTablaHash} from "./components/structures/tabla_hash/OperationTablaHash";

// Mapea los nombres a sus respectivos componentes
const componentMap: Record<string, React.FC> = {
    "Secuencia": OperationSecuencia, // Si nombre = "Secuencia", renderiza <OperationSecuencia />
    "Cola": OperationCola,
    "Cola de Prioridad": OperationColaPrioridad, 
    "Lista Simplemente Enlazada": OperationListaSimple, 
    "Árbol Binario" : OperationArbolBinario,
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
