import { getRouteApi } from "@tanstack/react-router";
import { conceptosData } from "../../shared/constants/conceptsData";
// Importa todos los componentes que se pueden renderizar
import { DefinitionSecuencia } from "./components/structures/secuencia/DefinitionSecuencia";
import { DefinitionCola } from "./components/structures/cola/DefinitionCola";

// Mapea los nombres a sus respectivos componentes
const componentMap: Record<string, React.FC> = {
    "Secuencia": DefinitionSecuencia,  // Si nombre = "Secuencia", renderiza <DefinitionSecuencia />
    "Cola": DefinitionCola,  // Si nombre = "Cola", renderiza <DefinitionCola />
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
