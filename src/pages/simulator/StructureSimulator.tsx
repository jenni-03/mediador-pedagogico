import { getRouteApi } from "@tanstack/react-router";
import { conceptosData } from "../../shared/constants/conceptsData";
import { SequenceSimulator } from "./SequenceSimulator";
import { QueueSimulator } from "./QueueSimulator";
import { StackSimulator } from "./StackSimulator";
import { HashTableSimulator } from "./HashTableSimulator";
import { PriorityQueueSimulator } from "./PriorityQueueSimulator";

// Mapea los nombres a sus respectivos componentes
const componentMap: Record<string, React.FC> = {
    Secuencia: SequenceSimulator, // Si nombre = "Secuencia", renderiza <SequenceSimulator />
    Cola: QueueSimulator,
    tabla_hash: HashTableSimulator,
    Pila: StackSimulator,
    "Cola de Prioridad": PriorityQueueSimulator,
};

export function StructureSimulator() {
    const route = getRouteApi("/simulador/$estructura");

    const { estructura } = route.useParams();
    const nombre: string = conceptosData[estructura].nombre;

    // Buscar el componente correspondiente en el mapeo, si no existe, usar un fallback
    const DynamicComponent =
        componentMap[nombre] || (() => <p>Componente no encontrado</p>);

    return (
        <div>
            <DynamicComponent /> {/* Renderiza el componente dinámico aquí */}
        </div>
    );
}
