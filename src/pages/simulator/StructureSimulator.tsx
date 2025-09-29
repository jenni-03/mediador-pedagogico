import { getRouteApi } from "@tanstack/react-router";
import { conceptosData } from "../../shared/constants/conceptsData";
import { SequenceSimulator } from "./SequenceSimulator";
import { QueueSimulator } from "./QueueSimulator";
import { StackSimulator } from "./StackSimulator";
import { HashTableSimulator } from "./HashTableSimulator";
import { PriorityQueueSimulator } from "./PriorityQueueSimulator";
import { SimpleLinkedListSimulator } from "./SimpleLinkedListSimulator";
import { DoublyLinkedListSimulator } from "./DoublyLinkedListSimulator";
import { CircularDoublyLinkedListSimulator } from "./CircularDoublyLinkedListSimulator";
import { CircularSimpleLinkedListSimulator } from "./CircularSimpleLinkedListSimulator";
import { BinaryTreeSimulator } from "./BinaryTreeSimulator";
import { BinarySearchTreeSimulator } from "./BinarySearchTreeSimulator";
import { AvlTreeSimulator } from "./AvlTreeSimulator";
import { RbTreeSimulator } from "./RbTreeSimulator";
import { NaryTreeSimulator } from "./NaryTreeSimulator";
import { TwoThreeTreeSimulator } from "./123TreeSimulator";
import { BTreeSimulator } from "./BTreeSimulator";
import { BPlusTreeSimulator } from "./BPlusTreeSimulator";
import { HeapSimulator } from "./HeapSimulator";

// Mapea los nombres a sus respectivos componentes
const componentMap: Record<string, React.FC> = {
  Secuencia: SequenceSimulator,
  Cola: QueueSimulator,
  tabla_hash: HashTableSimulator,
  Pila: StackSimulator,
  "Cola de Prioridad": PriorityQueueSimulator,
  "Lista Simplemente Enlazada": SimpleLinkedListSimulator,
  "Lista Doblemente Enlazada": DoublyLinkedListSimulator,
  "Lista Circular Doblemente Enlazada": CircularDoublyLinkedListSimulator,
  "Lista Circular Simplemente Enlazada": CircularSimpleLinkedListSimulator,
  "Árbol Binario": BinaryTreeSimulator,
  "Árbol Binario de Búsqueda": BinarySearchTreeSimulator,
  "Árbol AVL": AvlTreeSimulator,
  "Árbol RojiNegro": RbTreeSimulator,
  "Árbol Eneario": NaryTreeSimulator,
  "Árbol 1-2-3": TwoThreeTreeSimulator,
  "Árbol B": BTreeSimulator,
  "Árbol B+": BPlusTreeSimulator,
  "Árbol Heap": HeapSimulator,
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
      <DynamicComponent />
    </div>
  );
}
