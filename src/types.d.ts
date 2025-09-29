// types.ts — versión corregida y consolidada

import type { HierarchyNode } from "d3";
import type { ReactNode, Dispatch, SetStateAction } from "react";
import { TYPE_FILTER } from "./shared/constants/consts";
import type { NodoS } from "./shared/utils/nodes/NodoS";

/* ──────────────────────────────────────────────────────────────────────────
   Tipos base compartidos
   ────────────────────────────────────────────────────────────────────────── */

export type RBRenderColor = "red" | "black";
export type RBColor = "RED" | "BLACK";

export type EqualityFn<T> = (a: T, b: T) => boolean;
export type Comparator<T> = (a: T, b: T) => number;

export type LinkPathFn = (
  source: { x: number; y: number },
  target: { x: number; y: number },
  r: number
) => string;

export type TreeLinkData = {
  sourceId: string;
  targetId: string;
};

export type TraversalNodeType = {
  id: string;
  value: number;
};

export type HierarchyNodeData<T> = {
  id: string;
  value?: T;
  isPlaceholder?: boolean;

  // AVL
  bf?: number; // balance factor
  height?: number; // altura

  // RB (render)
  color?: RBRenderColor;

  // N-ario / B / B+
  degree?: number;
  order?: number;

  idNum?: number;
  meta?: { nIndex?: number };
  children?: HierarchyNodeData<T>[];
};

/* ──────────────────────────────────────────────────────────────────────────
   Listas / Pilas / Colas (datos para render)
   ────────────────────────────────────────────────────────────────────────── */

export interface LinkedListInterface<T> {
  insertarAlInicio(valor: T): NodoS<T>;
  insertarAlFinal(valor: T): NodoS<T>;
  insertarEnPosicion(valor: T, posicion: number): NodoS<T>;
  eliminarAlInicio(): NodoS<T> | null;
  eliminarAlFinal(): NodoS<T> | null;
  eliminarEnPosicion(posicion: number): NodoS<T> | null;
  buscar(valor: T): boolean;
  esVacia(): boolean;
  vaciar(): void;
  clonar(): this;
  getArrayDeNodos(): ListNodeData<T>[];
  getTamanio(): number;
}

export type ListNodeData<T> = {
  id: string;
  value: T;
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

export type PriorityQueueNodeData = QueueNodeData & {
  priority: number;
};

export type LinkData = {
  sourceId: string;
  targetId: string;
  type: "next" | "prev" | "circular-next" | "circular-prev";
};

export type StackNodeData = {
  id: string;
  value: number;
  next: string | null;
  memoryAddress: string;
};

/* ──────────────────────────────────────────────────────────────────────────
   Árboles 2-3 / B / B+
   ────────────────────────────────────────────────────────────────────────── */

// 2-3 (para renderer)
export type TwoThreeHierarchy = {
  id: string; // "n-<idNum>"
  idNum: number;
  value: number[];
  children?: TwoThreeHierarchy[];
  isPlaceholder?: boolean;
  degree?: number;
  order?: number;
  meta?: { nIndex?: number };
};

// B (para renderer)
export type BHierarchy = {
  id: string; // "n-<idNum>"
  idNum: number;
  keys: number[];
  children?: BHierarchy[];
  isPlaceholder?: boolean;
  order?: number;
  degree?: number;
  minKeys?: number;
  maxKeys?: number;
  meta?: { nIndex?: number };
};

// B+ (para renderer)
export type BPlusHierarchy = {
  id: string;
  idNum: number;
  keys: number[];
  children?: BPlusHierarchy[]; // solo si !isLeaf
  isLeaf: boolean; // diferenciador clave
  nextLeafId?: string;
  prevLeafId?: string;
  order?: number;
  degree?: number;
  minKeys?: number;
  maxKeys?: number;
  isPlaceholder?: boolean;
  meta?: { nIndex?: number };
};

/* ───────────────────────────  Fix-ups / eventos B  ─────────────────────── */

export type BSplitEvent = {
  type: "split";
  nodeId: string;
  midKey: number;
  leftId?: string;
  rightId?: string;
};

export type BMergeEvent = {
  type: "merge";
  leftId: string;
  rightId: string;
  sepKey: number;
};

export type BRedistributeEvent = {
  type: "redistribute";
  fromId: string;
  toId: string;
  viaKey: number;
  direction: "left" | "right";
};

export type BFixLog = (BSplitEvent | BMergeEvent | BRedistributeEvent)[];

/* ───────────────  Fix-ups / eventos B+ (incluye hojas enlazadas) ───────── */

export type BPlusSplitEvent = {
  type: "splitLeaf" | "splitInternal";
  nodeId: string;
  midKey: number;
  leftId?: string;
  rightId?: string;
};

export type BPlusMergeEvent = {
  type: "mergeLeaf" | "mergeInternal";
  leftId: string;
  rightId: string;
  sepKey: number;
};

export type BPlusRedistributeEvent = {
  type: "redistributeLeaf" | "redistributeInternal";
  fromId: string;
  toId: string;
  viaKey: number;
  direction: "left" | "right";
};

export type BPlusLeafLinkEvent = {
  type: "linkLeaves";
  leftLeafId: string;
  rightLeafId: string;
};

export type BPlusFixLog = (
  | BPlusSplitEvent
  | BPlusMergeEvent
  | BPlusRedistributeEvent
  | BPlusLeafLinkEvent
)[];

/* ──────────────────────────────────────────────────────────────────────────
   Heaps (renderer + animación determinista)
   ────────────────────────────────────────────────────────────────────────── */

export type HeapHierarchy = {
  id: string; // ej. "heap-0"
  idNum: number; // índice level-order
  priority: number;
  value?: number;
  children?: HeapHierarchy[];
  isPlaceholder?: boolean;
  index?: number;
  meta?: { nIndex?: number };
};

export type HeapSwapEvent = {
  type: "swap";
  aId: string;
  bId: string;
};

export type HeapReplaceRootEvent = {
  type: "replaceRoot";
  rootId: string;
  withId: string;
};

export type HeapReplaceNodeEvent = {
  type: "replaceNode";
  targetId: string;
  withId: string;
  parentId?: string;
};

export type HeapFixEvent =
  | HeapSwapEvent
  | HeapReplaceRootEvent
  | HeapReplaceNodeEvent;

export type HeapFixLog = HeapFixEvent[];

export type HeapQuery = BaseQueryOperations<"arbol_heap">;

/* ──────────────────────────────────────────────────────────────────────────
   Trazas / frames para AVL y RB
   ────────────────────────────────────────────────────────────────────────── */

export type RotationStep = {
  type: "LL" | "RR" | "LR" | "RL";
  zId: string;
  yId: string;
  xId?: string | null;
  parentOfZId?: string | null;
  BId?: string | null;
  xLeftId?: string | null;
  xRightId?: string | null;
};

export type OperationTrace<T> = {
  rotations: RotationStep[];
  hierarchies: {
    pre: HierarchyNodeData<T> | null;
    mids: HierarchyNodeData<T>[];
  };
};

export type AvlFrame = {
  root: HierarchyNode<HierarchyNodeData<number>>;
  nodes: HierarchyNode<HierarchyNodeData<number>>[];
  links: { sourceId: string; targetId: string }[];
};

export type RBFrame = AvlFrame;

export type RBAction =
  | {
      kind: "recolor";
      id: string;
      from: RBColor;
      to: RBColor;
      nodeBadge: string;
    }
  | {
      kind: "rotation";
      tag:
        | "L(padre)"
        | "R(padre)"
        | "R(tío)"
        | "L(tío)"
        | "R(abuelo)"
        | "L(abuelo)";
      step: RotationStep;
    };

export type RBTrace<T> = {
  actions: RBAction[];
  hierarchies: {
    bst: HierarchyNodeData<T> | null;
    mids: HierarchyNodeData<T>[];
  };
};

/* ──────────────────────────────────────────────────────────────────────────
   UI / Props varias
   ────────────────────────────────────────────────────────────────────────── */

export type ListRenderConfig = {
  showHeadIndicator: boolean;
  showTailIndicator: boolean;
  showDoubleLinks: boolean;
  showCircularLinks: boolean;
  showNextCircularLink?: boolean;
  showPrevCircularLink?: boolean;
};

export type CardData = {
  title: string;
  id: number;
  img: string;
  type: string;
  bgCard: string;
  bgButton: string;
  toConceptos: string;
  toPracticar: string;
};

export type CardListProps = {
  data: CardData[];
  filter: FilterState;
};

export type NavBarProps = {
  filter: FilterState;
  setFilter: Dispatch<SetStateAction<FilterState>>;
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
  onClose: () => void;
};

export type AnimationContextType = {
  isAnimating: boolean;
  setIsAnimating: Dispatch<SetStateAction<boolean>>;
};

export type CodeAnalysisProps = {
  code: string;
  operationalCost: string[];
  complexity: string;
};

export type FilterState = {
  query: string;
  type: FilterTypeValue;
};

export type FilterTypeValue = (typeof TYPE_FILTER)[keyof typeof TYPE_FILTER];

export type HintTarget =
  | { type: "node"; id: string }
  | { type: "link"; sourceId: string; targetId: string };

export type HintContent = {
  label: string;
  value: string;
};

export type HintOptions = {
  palette?: {
    bg?: string;
    stroke?: string;
    label?: string;
    value?: string;
  };
  size?: {
    width?: number;
    height?: number;
    radius?: number;
    scaleFrom?: number;
  };
  anchor?: {
    side?: "left" | "right" | "above" | "below";
    dx?: number;
    dy?: number;
  };
  typography?: {
    labelFz?: string;
    valueFz?: string;
    labelFw?: number | string;
    valueFw?: number | string;
  };
};

export type TreeTraversalAnimOptions = {
  recolor?: boolean;
  strokeColor?: string;
};

/* ──────────────────────────────────────────────────────────────────────────
   Queries y acciones (genéricos por estructura)
   Literales válidos de estructura (unificados):
   "secuencia" | "cola" | "cola_de_prioridad" | "pila" | "lista_enlazada" |
   "arbol_binario" | "arbol_binario_busqueda" | "arbol_avl" | "arbol_rojinegro" |
   "arbol_nario" | "arbol_123" | "arbol_b" | "arbol_bplus" | "arbol_heap"
   ────────────────────────────────────────────────────────────────────────── */

export type BaseQueryOperations<
  T extends string =
    | "secuencia"
    | "cola"
    | "cola_de_prioridad"
    | "pila"
    | "lista_enlazada"
    | "arbol_binario"
    | "arbol_binario_busqueda"
    | "arbol_avl"
    | "arbol_rojinegro"
    | "arbol_nario"
    | "arbol_123"
    | "arbol_b"
    | "arbol_bplus"
    | "arbol_heap"
> =
  // Secuencia
  T extends "secuencia"
    ? {
        create: number | null;
        toAdd: number | null;
        toDelete: number | null;
        toGet: number | null;
        toSearch: number | null;
        toUpdate: [number, number] | [];
      }
    // Colas
    : T extends "cola"
    ? {
        toEnqueuedNode: string | null;
        toDequeuedNode: string | null;
        toGetFront: string | null;
        toClear: boolean;
      }
    : T extends "cola_de_prioridad"
    ? {
        toEnqueuedNode: string | null;
        toDequeuedNode: string | null;
        toGetFront: string | null;
        toClear: boolean;
      }
    // Pila
    : T extends "pila"
    ? {
        toPushNode: string | null;
        toPopNode: string | null;
        toGetTop: string | null;
        toClear: boolean;
      }
    // Lista enlazada
    : T extends "lista_enlazada"
    ? {
        toAddFirst: string | null;
        toAddLast: string | null;
        toAddAt: [string, number] | [];
        toDeleteFirst: string | null;
        toDeleteLast: string | null;
        toDeleteAt: [string, number] | [];
        toSearch: number | null;
        toClear: boolean;
      }
    // Árbol binario
    : T extends "arbol_binario"
    ? {
        toInsertLeft: string | null;
        toInsertRight: string | null;
        toDelete: [string, string | null] | [];
        toSearch: number | null;
        toGetPreOrder: TraversalNodeType[] | [];
        toGetInOrder: TraversalNodeType[] | [];
        toGetPostOrder: TraversalNodeType[] | [];
        toGetLevelOrder: TraversalNodeType[] | [];
        toClear: boolean;
      }
    // ABB
    : T extends "arbol_binario_busqueda"
    ? {
        toInsert: string | null;
        toDelete: [string, string | null] | [];
        toSearch: number | null;
        toGetPreOrder: TraversalNodeType[] | [];
        toGetInOrder: TraversalNodeType[] | [];
        toGetPostOrder: TraversalNodeType[] | [];
        toGetLevelOrder: TraversalNodeType[] | [];
        toClear: boolean;
      }
    // AVL
    : T extends "arbol_avl"
    ? {
        toInsert: string | null;
        toDelete: [string, string | null] | [];
        toSearch: number | null;
        toGetPreOrder: TraversalNodeType[] | [];
        toGetInOrder: TraversalNodeType[] | [];
        toGetPostOrder: TraversalNodeType[] | [];
        toGetLevelOrder: TraversalNodeType[] | [];
        toClear: boolean;
        avlTrace: OperationTrace<number> | null;
      }
    // Roji-negro
    : T extends "arbol_rojinegro"
    ? {
        toInsert: string | null;
        toDelete: [string, string | null] | [];
        toSearch: number | null;
        toGetPreOrder: TraversalNodeType[] | [];
        toGetInOrder: TraversalNodeType[] | [];
        toGetPostOrder: TraversalNodeType[] | [];
        toGetLevelOrder: TraversalNodeType[] | [];
        toClear: boolean;
        rbTrace: RBTrace<number> | null;
      }
    // N-ario
    : T extends "arbol_nario"
    ? {
        toCreateRoot: number | null;
        toInsertChild:
          | []
          | [parentId: string, value: number, index?: number];
        toDeleteNode: string | null;
        toMoveNode:
          | []
          | [id: string, newParentId: string, index?: number];
        toUpdateValue: [] | [id: string, newValue: number];
        toSearch: number | null;
        toGetPreOrder: TraversalNodeType[] | [];
        toGetPostOrder: TraversalNodeType[] | [];
        toGetLevelOrder: TraversalNodeType[] | [];
        toClear: boolean;
      }
    // 2-3
    : T extends "arbol_123"
    ? {
        toInsert: number | null;
        toDelete: number | null;
        toSearch: number | null;
        toGetPreOrder: TraversalNodeType[] | [];
        toGetInOrder: TraversalNodeType[] | [];
        toGetPostOrder: TraversalNodeType[] | [];
        toGetLevelOrder: TraversalNodeType[] | [];
        toClear: boolean;
      }
    // B
    : T extends "arbol_b"
    ? {
        toInsert: number | null;
        toDelete: number | null;
        toSearch: number | null;
        toGetPreOrder: TraversalNodeType[] | [];
        toGetInOrder: TraversalNodeType[] | [];
        toGetPostOrder: TraversalNodeType[] | [];
        toGetLevelOrder: TraversalNodeType[] | [];
        toClear: boolean;
        bFix?: BFixLog | null;
      }
    // B+
    : T extends "arbol_bplus"
    ? {
        toInsert: number | null;
        toDelete: number | null;
        toSearch: number | null;
        toGetRange: [] | [from: number, to: number];
        toScanFrom: [] | [start: number, limit: number];
        toGetInOrder: TraversalNodeType[] | undefined;
        toGetLevelOrder: TraversalNodeType[] | undefined;
        toClear: boolean;
        bPlusFix?: BPlusFixLog | null;
      }
    // Heap
    : T extends "arbol_heap"
    ? {
        toInsert: string | null;
        toDeleteRoot: [string, string | null] | [];
        toSearch: number | null;
        toPeek: number | null;
        toGetLevelOrder: TraversalNodeType[] | [];
        toClear: boolean;
        swapPath: string[];
      }
    : never;

export type BPlusQuery = BaseQueryOperations<"arbol_bplus">;
export type TwoThreeQuery = BaseQueryOperations<"arbol_123">;
export type BQuery = BaseQueryOperations<"arbol_b">;

/* ──────────────────────────────────────────────────────────────────────────
   Acciones por estructura (API de los simuladores)
   ────────────────────────────────────────────────────────────────────────── */

export type BaseStructureActions<T extends string> =
  // Secuencia
  T extends "secuencia"
    ? {
        create: (n: number) => void;
        insertLast: (element: number) => void;
        delete: (element: number) => void;
        get: (pos: number) => void;
        search: (element: number) => void;
        clean: () => void;
        set: (pos: number, element: number) => void;
      }
    // Colas
    : T extends "cola"
    ? {
        enqueue: (element: number) => void;
        dequeue: () => void;
        getFront: () => void;
        clean: () => void;
      }
    : T extends "cola_de_prioridad"
    ? {
        enqueue: (element: number, priority: number) => void;
        dequeue: () => void;
        getFront: () => void;
        clean: () => void;
      }
    // Pila
    : T extends "pila"
    ? {
        push: (element: number) => void;
        pop: () => void;
        getTop: () => void;
        clean: () => void;
      }
    // Lista enlazada
    : T extends "lista_enlazada"
    ? {
        insertFirst: (element: number) => void;
        insertLast: (element: number) => void;
        insertAt: (element: number, pos: number) => void;
        removeFirst: () => void;
        removeLast: () => void;
        removeAt: (pos: number) => void;
        search: (element: number) => void;
        clean: () => void;
      }
    // Árbol binario
    : T extends "arbol_binario"
    ? {
        insertLeft: (parent: number, value: number) => void;
        insertRight: (parent: number, value: number) => void;
        delete: (nodeId: number) => void;
        search: (value: number) => void;
        getPreOrder: () => void;
        getInOrder: () => void;
        getPostOrder: () => void;
        getLevelOrder: () => void;
        clean: () => void;
      }
    // ABB
    : T extends "arbol_binario_busqueda"
    ? {
        insert: (value: number) => void;
        delete: (nodeId: number) => void;
        search: (value: number) => void;
        getPreOrder: () => void;
        getInOrder: () => void;
        getPostOrder: () => void;
        getLevelOrder: () => void;
        clean: () => void;
      }
    // AVL
    : T extends "arbol_avl"
    ? {
        insert: (value: number) => void;
        delete: (value: number) => void;
        search: (value: number) => void;
        getPreOrder: () => void;
        getInOrder: () => void;
        getPostOrder: () => void;
        getLevelOrder: () => void;
        clean: () => void;
      }
    // RB
    : T extends "arbol_rojinegro"
    ? {
        insert: (value: number) => void;
        delete: (value: number) => void;
        search: (value: number) => void;
        getPreOrder: () => void;
        getInOrder: () => void;
        getPostOrder: () => void;
        getLevelOrder: () => void;
        clean: () => void;
      }
    // Heap
    : T extends "arbol_heap"
    ? {
        insert: (value: number) => void;
        deleteRoot: () => void;
        search: (value: number) => void;
        peek: () => void;
        getLevelOrder: () => void;
        clean: () => void;
      }
    // N-ario
    : T extends "arbol_nario"
    ? {
        createRoot: (value: number) => void;
        insertChild: (
          parentId: number,
          value: number,
          index?: number
        ) => void;
        deleteNode: (id: number) => void;
        moveNode: (
          id: number,
          newParentId: number,
          index?: number
        ) => void;
        updateValue: (id: number, newValue: number) => void;
        search: (value: number) => void;
        getPreOrder: () => void;
        getPostOrder: () => void;
        getLevelOrder: () => void;
        clean: () => void;
      }
    // 2-3
    : T extends "arbol_123"
    ? {
        insert: (value: number) => void;
        delete: (value: number) => void;
        search: (value: number) => void;
        getPreOrder: () => void;
        getInOrder: () => void;
        getPostOrder: () => void;
        getLevelOrder: () => void;
        clean: () => void;
      }
    // B
    : T extends "arbol_b"
    ? {
        insert: (value: number) => void;
        delete: (value: number) => void;
        search: (value: number) => void;
        getPreOrder: () => void;
        getInOrder: () => void;
        getPostOrder: () => void;
        getLevelOrder: () => void;
        clean: () => void;
      }
    // B+
    : T extends "arbol_bplus"
    ? {
        insert: (value: number) => void;
        delete: (value: number) => void;
        search: (value: number) => void;
        range: (from: number, to: number) => void;
        scanFrom: (start: number, limit: number) => void;
        getInOrder: () => void;
        getLevelOrder: () => void;
        clean: () => void;
      }
    : Record<string, (...args: unknown[]) => void>;

/* ──────────────────────────────────────────────────────────────────────────
   Props del simulador (genéricas)
   ────────────────────────────────────────────────────────────────────────── */

export type SimulatorProps<T extends string> = {
  structureName: T;
  structureType?: string;
  structure: unknown;
  actions: BaseStructureActions<T>;
  query: BaseQueryOperations<T>;
  error: { message: string; id: number } | null;
  children: ReactNode;
};
