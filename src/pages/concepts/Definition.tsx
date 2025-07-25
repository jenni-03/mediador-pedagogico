import { getRouteApi } from "@tanstack/react-router";
import { conceptosData } from "../../shared/constants/conceptsData";
import { DefinitionArbolBinario, DefinitionCola, DefinitionColaPrioridad, DefinitionListaCDoble, DefinitionListaCSimple, DefinitionListaDoble, DefinitionListaSimple, DefinitionPila, DefinitionSecuencia, DefinitionTablaHash } from "./concepts";

// Mapea los nombres a sus respectivos componentes
const componentMap: Record<string, React.FC> = {
    "Secuencia": DefinitionSecuencia,  // Si nombre = "Secuencia", renderiza <DefinitionSecuencia />
    "Cola": DefinitionCola,  // Si nombre = "Cola", renderiza <DefinitionCola />
    "Cola de Prioridad": DefinitionColaPrioridad, 
    "Lista Simplemente Enlazada": DefinitionListaSimple, 
    "Árbol Binario" : DefinitionArbolBinario,
    "Pila": DefinitionPila,
    "tabla_hash" : DefinitionTablaHash,
    "Lista Doblemente Enlazada": DefinitionListaDoble, 
    "Lista Circular Simplemente Enlazada": DefinitionListaCSimple,
    "Lista Circular Doblemente Enlazada": DefinitionListaCDoble
};

export function Definition() {
    const route = getRouteApi("/conceptos/$estructura/definicion");

    const { estructura } = route.useParams();
    const nombre: string = conceptosData[estructura].nombre;

    // Buscar el componente correspondiente en el mapeo, si no existe, usar un fallback
    const DynamicComponent = componentMap[nombre] || (() => <p>Componente no encontrado</p>);

    return (
        <div>
            <DynamicComponent /> {/* Renderiza el componente dinámico aquí */}
        </div>
    );
}
