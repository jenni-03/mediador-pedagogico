import { getRouteApi } from "@tanstack/react-router";
import { conceptosData } from "../../shared/constants/conceptsData";
import {
  OperationArbolB2,
  OperationArbolB,
  OperationArbol123,
  OperationArbolEneario,
  OperationArbolHeap,
  OperationArbolSplay,
  OperationArbolRojiNegro,
  OperationArbolBinarioBusqueda,
  OperationArbolAVL,
  OperationArbolBinario,
  OperationCola,
  OperationColaPrioridad,
  OperationListaCDoble,
  OperationListaCSimple,
  OperationListaDoble,
  OperationListaSimple,
  OperationPila,
  OperationSecuencia,
  OperationTablaHash,
} from "./concepts";

// Mapea los nombres a sus respectivos componentes
const componentMap: Record<string, React.FC> = {
  Secuencia: OperationSecuencia, // Si nombre = "Secuencia", renderiza <OperationSecuencia />
  Cola: OperationCola,
  "Cola de Prioridad": OperationColaPrioridad,
  "Lista Simplemente Enlazada": OperationListaSimple,
  "Árbol Binario": OperationArbolBinario,
  Pila: OperationPila,
  tabla_hash: OperationTablaHash,
  "Lista Doblemente Enlazada": OperationListaDoble,
  "Lista Circular Simplemente Enlazada": OperationListaCSimple,
  "Lista Circular Doblemente Enlazada": OperationListaCDoble,
  "Árbol AVL": OperationArbolAVL,
  "Árbol Binario de Búsqueda": OperationArbolBinarioBusqueda,
  "Árbol RojiNegro": OperationArbolRojiNegro,
  "Árbol Splay": OperationArbolSplay,
  "Árbol Heap": OperationArbolHeap,
  "Árbol Eneario": OperationArbolEneario,
  "Árbol 1-2-3": OperationArbol123,
  "Árbol B": OperationArbolB,
  "Árbol B+": OperationArbolB2,
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
