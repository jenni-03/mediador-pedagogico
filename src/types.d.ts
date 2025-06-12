import { TYPE_FILTER } from "./shared/constants/consts";
import { NodoS } from "./shared/utils/nodes/NodoS";

export interface LinkedListInterface {
  insertarAlInicio(valor: number): NodoS | NodoD;
  insertarAlFinal(valor: number): NodoS | NodoD;
  insertarEnPosicion(valor: number, posicion: number): NodoS | NodoD;
  eliminarAlInicio(): NodoS | NodoD;
  eliminarAlFinal(): NodoS | NodoD;
  eliminarEnPosicion(posicion: number): NodoS | NodoD;
  buscar(valor: number): boolean;
  esVacia(): boolean;
  vaciar(): void;
  clonar(): this;
  getArrayDeNodos(): ListNodeData[];
  getTamanio(): number;
}

export type CardListProps = {
  data: CardData[];
  filter: FilterState;
};

export type NavBarProps = {
  filter: FilterState;
  setFilter: React.Dispatch<React.SetStateAction<FilterState>>;
};

export type AnimatedButtonLinkProps = {
  bgColor: string;
  to: string;
  text: string;
  params: string;
};

export type AnimatedButtonModalProps = {
  bgColor: string;
  text: string;
  onClick?: () => void;
};

export type SideBarProps = {
  estructura: string;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
};

export type SideBarItemProps = {
  to: string;
  params: string;
  label: string;
};

export type CommandProps = {
  title: string;
  description: string;
  estructura: string;
  ejemplo: string;
};

export type GroupCommandProps = {
  buttons: CommandProps[];
};

export type CustomModalProps = {
  title: string;
  description: string;
  structure: string;
  example: string;
  children: ReactNode;
  onClose: () => void; // Función que se llama al cerrar el modal
};

export type SimulatorProps<T extends string> = {
  structureName: T;
  structureType?: string;
  structure: unknown;
  actions: BaseStructureActions<T>;
  query: BaseQueryOperations;
  error: { message: string; id: number } | null;
  children: React.ReactNode;
};

export type FilterState = {
  query: string;
  type: FilterTypeValue;
};

export type FilterTypeValue = (typeof TYPE_FILTER)[keyof typeof TYPE_FILTER];

export interface CardData {
  title: string;
  id: number;
  img: string;
  type: string;
  bgCard: string;
  bgButton: string;
  toConceptos: string;
  toPracticar: string;
}

export type BaseQueryOperations<T extends string> =
  T extends "secuencia" ? {
    create: number | null;
    toAdd: number | null;
    toDelete: number | null;
    toGet: number | null;
    toSearch: number | null;
    toUpdate: [number, number] | [];
  }
  : T extends "cola" ? {
    toEnqueuedNode: string | null;
    toDequeuedNode: string | null;
    toGetFront: string | null;
    toClear: boolean;
  }
  : T extends "tabla_hash" ? {
    create: (cap: number) => void;
    set: (key: number, value: number) => void;
    get: (key: number) => void;
    delete: (key: number) => void;
    clean: () => void;
  }
  : T extends "cola_de_prioridad" ? {
    toEnqueuedNode: string | null;
    toDequeuedNode: string | null;
    toGetFront: string | null;
    toClear: boolean;
  }
  : T extends "pila" ? {
    toPushNode: string | null;
    toPopNode: string | null;
    toGetTop: string | null;
    toClear: boolean;
  }
  : T extends "lista_enlazada" ? {
    toAddFirst: string | null;
    toAddLast: string | null;
    toAddAt: [string, number] | [];
    toDeleteFirst: string | null;
    toDeleteLast: string | null;
    toDeleteAt: [string, number] | [];
    toSearch: number | null;
    toClear: boolean;
  }
  : never; // Fallback para otros casos

export type BaseStructureActions<T extends string> = T extends "secuencia"
  ? {
    create: (n: number) => void;
    insertLast: (element: number) => void;
    delete: (element: number) => void;
    get: (pos: number) => void;
    search: (element: number) => void;
    clean: () => void;
    set: (pos: number, element: number) => void;
  }
  : T extends "cola"
  ? {
    enqueue: (element: number) => void;
    dequeue: () => void;
    getFront: () => void;
    clean: () => void;
  } :
  T extends "cola de prioridad" ? {
    enqueue: (element: number) => void;
    dequeue: () => void;
    getFront: () => void;
    getRear: () => void;
    clean: () => void;
  } :
  T extends "pila" ? {
    push: (element: number) => void;
    pop: () => void;
    getTop: () => void;
    clean: () => void;
  } :
  T extends "lista_enlazada" ? {
    insertFirst: (element: number) => void;
    insertLast: (element: number) => void;
    insertAt: (element: number, pos: number) => void;
    removeFirst: () => void;
    removeLast: () => void;
    removeAt: (pos: number) => void;
    search: (element: number) => void;
    clean: () => void;
  } :
  Record<string, (...args: unknown[]) => void>; // Fallback para otros casos

export type AnimationContextType = {
  isAnimating: boolean;
  setIsAnimating: React.Dispatch<React.SetStateAction<boolean>>;
};

export type CodeAnalysisProps = {
  code: string;
  operationalCost: string[];
  complexity: string;
};

export type ListNodeData = {
  id: string;
  value: number;
  next: string | null;
  prev?: string | null;
  memoryAddress: string;
};

export type QueueNodeData = {
  id: string;
  value: number;
  next: string | null;
  memoryAddress: string;
};

export type PriorityQueueNodeData = {
  id: string;
  value: number;
  next: string | null;
  memoryAddress: string;
  priority: number;
};

export type LinkData = {
  sourceId: string;
  targetId: string;
  type: "next" | "prev";
};

export type StackNodeData = {
  id: string;
  value: number;
  next: string | null;
  memoryAddress: string;
};

export type IndicatorPositioningConfig = {
  calculateTransform: (
    nodePos: { x: number; y: number },
    dims: { elementWidth: number; elementHeight: number }
  ) => string;
};
