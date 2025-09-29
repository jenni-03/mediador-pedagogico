// types.ts — merge Efranor + compañero (solo conciliación)

import type { HierarchyNode } from "d3";
import type { ReactNode, Dispatch, SetStateAction } from "react";
import { TYPE_FILTER } from "./shared/constants/consts";
import type { NodoS } from "./shared/utils/nodes/NodoS";
// Si tienes el tipo real de NodoD, quita este comentario e importa desde donde corresponda.
// import type { NodoD } from "./shared/utils/nodes/NodoD";

/* ─────────────────────────── Base comunes ─────────────────────────── */

export type RBRenderColor = "red" | "black";
export type RBColor = "RED" | "BLACK";

// Tus extras de RB
export type RbRotation = { type: "left" | "right"; pivotId: string };
export type RbRecolor = { id: string; to: "red" | "black" };

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
  bf?: number;
  height?: number;

  // RB (render)
  color?: RBRenderColor;

  // N-ario / B / B+
  degree?: number;
  order?: number;

  idNum?: number;
  meta?: { nIndex?: number };
  children?: HierarchyNodeData<T>[];
};

/* ───────────── Listas / Pilas / Colas (datos para render) ─────────── */

export interface LinkedListInterface<T> {
  insertarAlInicio(valor: T): NodoS<T> | NodoD<T>;
  insertarAlFinal(valor: T): NodoS<T> | NodoD<T>;
  insertarEnPosicion(valor: T, posicion: number): NodoS<T> | NodoD<T>;
  eliminarAlInicio(): NodoS<T> | NodoD<T>;
  eliminarAlFinal(): NodoS<T> | NodoD<T>;
  eliminarEnPosicion(posicion: number): NodoS<T> | NodoD<T>;
  buscar(valor: T): boolean;
  esVacia(): boolean;
  vaciar(): void;
  clonar(): this;
  getArrayDeNodos(): ListNodeData<T>[];
  getTamanio(): number;
}

export type ListNodeData<T = unknown> = {
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

export type IndicatorPositioningConfig = {
  calculateTransform: (
    nodePos: { x: number; y: number },
    dims: { elementWidth: number; elementHeight: number }
  ) => string;
};

/* ───────────── Árboles 2-3 / B / B+ (renderer) ───────────── */

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

export type BPlusHierarchy = {
  id: string;
  idNum: number;
  keys: number[];
  children?: BPlusHierarchy[]; // solo si !isLeaf
  isLeaf: boolean;
  nextLeafId?: string;
  prevLeafId?: string;
  order?: number;
  degree?: number;
  minKeys?: number;
  maxKeys?: number;
  isPlaceholder?: boolean;
  meta?: { nIndex?: number };
};

/* ───────────── Eventos / Fix-ups B y B+ ───────────── */

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

/* ───────────── Heaps (renderer + animación determinista) ───────────── */

export type HeapHierarchy = {
  id: string; // "heap-0"
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

/* ───────────── Trazas / frames AVL & RB ───────────── */

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

/* ───────────── UI / Props varias ───────────── */

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

/* ───────────── Queries por estructura ─────────────
   Incluye alias compatibles:
   - B+: "arbol_bplus" y "arbol_b_plus"
   - 2–3: "arbol_123" y "arbol_23"
   - RB alterno: "arbol_rojinegro" y "arbol_rb"
   - Cola de prioridad: "cola_de_prioridad"
*/

export type BaseQueryOperations<
  T extends string =
    | "secuencia"
    | "cola"
    | "cola_de_prioridad"
    | "cola de prioridad"
    | "pila"
    | "lista_enlazada"
    | "arbol_binario"
    | "arbol_binario_busqueda"
    | "arbol_avl"
    | "arbol_rojinegro"
    | "arbol_rb"
    | "arbol_nario"
    | "arbol_123"
    | "arbol_23"
    | "arbol_b"
    | "arbol_bplus"
    | "arbol_b_plus"
    | "arbol_heap",
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
    : // Colas
      T extends "cola"
      ? {
          toEnqueuedNode: string | null;
          toDequeuedNode: string | null;
          toGetFront: string | null;
          toClear: boolean;
        }
      : T extends "cola_de_prioridad" | "cola de prioridad"
        ? {
            toEnqueuedNode: string | null;
            toDequeuedNode: string | null;
            toGetFront: string | null;
            toClear: boolean;
          }
        : // Pila
          T extends "pila"
          ? {
              toPushNode: string | null;
              toPopNode: string | null;
              toGetTop: string | null;
              toClear: boolean;
            }
          : // Lista enlazada
            T extends "lista_enlazada"
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
            : // Árbol binario (simple)
              T extends "arbol_binario"
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
              : // ABB
                T extends "arbol_binario_busqueda"
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
                : // AVL
                  T extends "arbol_avl"
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
                  : // RB (ambos alias)
                    T extends "arbol_rojinegro" | "arbol_rb"
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
                        rbFix?: {
                          rotations: RbRotation[];
                          recolors: RbRecolor[];
                        } | null;
                      }
                    : // N-ario (ids string)
                      T extends "arbol_nario"
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
                      : // 2-3 (ambos alias)
                        T extends "arbol_123" | "arbol_23"
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
                        : // B
                          T extends "arbol_b"
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
                          : // B+ (ambos alias)
                            T extends "arbol_bplus" | "arbol_b_plus"
                            ? {
                                toInsert: number | null;
                                toDelete: number | null;
                                toSearch: number | null;
                                toGetRange: [] | [from: number, to: number];
                                toScanFrom: [] | [start: number, limit: number];
                                toGetInOrder: TraversalNodeType[] | undefined;
                                toGetLevelOrder:
                                  | TraversalNodeType[]
                                  | undefined;
                                toClear: boolean;
                                bPlusFix?: BPlusFixLog | null;
                              }
                            : T extends "arbol_heap"
                              ? {
                                  /* Mutaciones */
                                  toInsert: number | null; // payload insertado
                                  insertedId?: string | null; // id del nodo que terminó con el payload

                                  /** Resultado de eliminar (root o cualquier nodo) */
                                  toDelete: number | null; // valor objetivo solicitado (para logs/UI)
                                  deletedId?: string | null; // id realmente eliminado (snapshot)
                                  deletedValue?: number | null; // valor eliminado (snapshot)
                                  deletedIsRoot?: boolean; // marcamos si el target era la raíz
                                  updatedRootId?: string | null; // id de la nueva raíz (si quedó alguna)

                                  /* Consultas */
                                  toSearch: number | null; // valor buscado
                                  /** Si hay duplicados, puedes devolver todos los ids encontrados: */
                                  searchResultIds?: string[] | null;

                                  /* Único recorrido “lógico” del heap */
                                  toGetLevelOrder: TraversalNodeType[] | [];

                                  /* Limpieza */
                                  toClear: boolean;

                                  /* Animación determinista (insert/delete) */
                                  heapFix?: HeapFixLog | null; // replaceNode + swaps en orden
                                }
                              : never;

export type BPlusQuery =
  | BaseQueryOperations<"arbol_bplus">
  | BaseQueryOperations<"arbol_b_plus">;
export type TwoThreeQuery = BaseQueryOperations<"arbol_123">;
export type BQuery = BaseQueryOperations<"arbol_b">;

/* ───────────── Acciones (API simuladores) ─────────────
   Nota:
   - Árbol binario simple usa insertLeft/insertRight
   - ABB/AVL/RB usan insert(value)
   - Cola de prioridad en acciones sigue la variante con espacio ("cola de prioridad")
*/

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
    : // Colas
      T extends "cola"
      ? {
          enqueue: (element: number) => void;
          dequeue: () => void;
          getFront: () => void;
          clean: () => void;
        }
      : T extends "cola_de_prioridad" | "cola de prioridad"
        ? {
            enqueue: (element: number, priority: number) => void;
            dequeue: () => void;
            getFront: () => void;
            clean: () => void;
          }
        : // Pila
          T extends "pila"
          ? {
              push: (element: number) => void;
              pop: () => void;
              getTop: () => void;
              clean: () => void;
            }
          : // Lista enlazada
            T extends "lista_enlazada"
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
            : // Árbol binario (simple)
              T extends "arbol_binario"
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
              : // ABB
                T extends "arbol_binario_busqueda"
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
                : // AVL
                  T extends "arbol_avl"
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
                  : // RB
                    T extends "arbol_rojinegro"
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
                    : T extends "arbol_heap"
                      ? {
                          insert: (value: number) => void;

                          // delete general: por valor (número) o por id (string)
                          delete: (target: number | { id: string }) => void;

                          search: (value: number) => void;
                          getLevelOrder: () => void;
                          clean: () => void;
                        }
                      : // N-ario (ids numéricos aquí)
                        T extends "arbol_nario"
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
                        : // 2-3
                          T extends "arbol_123" | "arbol_23"
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
                          : // B
                            T extends "arbol_b"
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
                            : // B+ (ambos alias)
                              T extends "arbol_bplus" | "arbol_b_plus"
                              ? {
                                  insert: (value: number) => void;
                                  delete: (value: number) => void;
                                  search: (value: number) => void;
                                  range: (from: number, to: number) => void;
                                  scanFrom: (
                                    start: number,
                                    limit: number
                                  ) => void;
                                  getInOrder: () => void;
                                  getLevelOrder: () => void;
                                  clean: () => void;
                                }
                              : Record<string, (...args: unknown[]) => void>;

/* ───────────── Props del simulador ───────────── */

export type SimulatorProps<T extends string> = {
  structureName: T;
  structureType?: string;
  structure: unknown;
  actions: BaseStructureActions<T>;
  query: BaseQueryOperations<T>;
  error: { message: string; id: number } | null;
  children: ReactNode;
};
