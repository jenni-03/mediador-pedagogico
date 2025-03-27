import { getRouteApi } from "@tanstack/react-router";
import { conceptosData } from "../../shared/constants/conceptsData";
// Importa todos los componentes que se pueden renderizar
import { OperationSecuencia } from "./components/structures/secuencia/OperationSecuencia";

// Mapea los nombres a sus respectivos componentes
const componentMap: Record<string, React.FC> = {
    Secuencia: OperationSecuencia, // Si nombre = "Secuencia", renderiza <DefinitionSecuencia />
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
