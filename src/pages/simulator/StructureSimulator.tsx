import { getRouteApi } from "@tanstack/react-router";
import { conceptosData } from "../../shared/constants/conceptsData";
import { SequenceSimulator } from "./SequenceSimulator";
import { QueueSimulator } from "./QueueSimulator";
// Importa todos los componentes que se pueden renderizar

// Mapea los nombres a sus respectivos componentes
const componentMap: Record<string, React.FC> = {
    "Secuencia": SequenceSimulator,  // Si nombre = "Secuencia", renderiza <SequenceSimulator />
    "Cola": QueueSimulator
};

export function StructureSimulator() {
    const route = getRouteApi("/simulador/$estructura");

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
