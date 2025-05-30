import { getRouteApi } from "@tanstack/react-router";
import { conceptosData } from "../../shared/constants/conceptsData";
import { ComplexityArbolBinario, ComplexityCola, ComplexityColaPrioridad, ComplexityListaSimple, ComplexityPila, ComplexitySecuencia } from "./concepts";

// Mapea los nombres a sus respectivos componentes
const componentMap: Record<string, React.FC> = {
    "Secuencia": ComplexitySecuencia, // Si nombre = "Secuencia", renderiza <ComplexitySecuencia />
    "Cola": ComplexityCola,
    "Cola de Prioridad": ComplexityColaPrioridad, 
    "Lista Simplemente Enlazada": ComplexityListaSimple, 
    "Árbol Binario" : ComplexityArbolBinario,
    "Pila": ComplexityPila
};

export function Complexity() {
    const route = getRouteApi("/conceptos/$estructura/complejidad");

    const { estructura } = route.useParams();
    const nombre = conceptosData[estructura].nombre;

    // Buscar el componente correspondiente en el mapeo, si no existe, usar un fallback
    const DynamicComponent =
        componentMap[nombre] || (() => <p>Componente no encontrado</p>);

    return <div>
        <DynamicComponent /> {/* Renderiza el componente dinámico aquí */}
    </div>;
}
