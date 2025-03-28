import { getRouteApi } from "@tanstack/react-router";
import { conceptosData } from "../../shared/constants/conceptsData";
// Importa todos los componentes que se pueden renderizar
import { ComplexitySecuencia } from "./components/structures/secuencia/ComplexitySecuencia";
import { ComplexityCola } from "./components/structures/cola/ComplexityCola";

// Mapea los nombres a sus respectivos componentes
const componentMap: Record<string, React.FC> = {
    "Secuencia": ComplexitySecuencia, // Si nombre = "Secuencia", renderiza <ComplexitySecuencia />
    "Cola": ComplexityCola,
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
