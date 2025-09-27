import { type HierarchyNode } from "d3";
import { TYPE_FILTER } from "./shared/constants/consts";
import { type NodoS } from "./shared/utils/nodes/NodoS";

//RojoNegro
export type RbRotation = { type: "left" | "right"; pivotId: string };
export type RbRecolor = { id: string; to: "red" | "black" };
export type RBRenderColor = "red" | "black";

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
  getArrayDeNodos(): ListNodeData[];
  getTamanio(): number;
}

// Un nodo de jerarquía 2-3 SIEMPRE tiene:
// - id: "n-<idNum>"
// - idNum: presente
// - value: number[] (todas las claves del nodo, en orden)
// - children?: TwoThreeHierarchy[] (sin placeholders)
export type TwoThreeHierarchy = {
  id: string; // "n-<id>"
  idNum: number; // requerido
  value: number[]; // requerido
  children?: TwoThreeHierarchy[];
  // opcionalmente puedes conservar campos de HierarchyNodeData si los usas:
  isPlaceholder?: boolean;
  degree?: number;
  order?: number;
  meta?: { nIndex?: number };
};
export type BPlusQuery = BaseQueryOperations<"arbol_bplus">;

// Conveniencia para las operaciones del simulador 2-3
export type TwoThreeQuery = BaseQueryOperations<"arbol_123">;
export type BQuery = BaseQueryOperations<"arbol_b">;

// Un nodo de Árbol B para el renderer D3/SVG (similar a TwoThreeHierarchy, pero m-ario genérico).
export type BHierarchy = {
  id: string; // "n-<idNum>"
  idNum: number; // requerido
  keys: number[]; // claves del nodo en orden ascendente
  children?: BHierarchy[]; // hijos reales (sin placeholders)

  // Campos opcionales ya usados en tu ecosistema
  isPlaceholder?: boolean;

  // Metadatos útiles para tooltips/inspección
  order?: number; // m (aridad máx del árbol, p.ej. 4 → B-tree de orden 4)
  degree?: number; // número de hijos actuales
  minKeys?: number; // t-1 si t=grado mínimo
  maxKeys?: number; // m-1
  meta?: { nIndex?: number };
};

/* ─────────────────────────── 2.1) Eventos de animación/fix-ups B ───────────────── */
export type BSplitEvent = {
  type: "split";
  nodeId: string; // id del nodo que se parte
  midKey: number; // clave separadora promovida
  leftId?: string; // ids resultantes (si ya existen tras la operación)
  rightId?: string;
};

export type BMergeEvent = {
  type: "merge";
  leftId: string; // nodo que absorbe
  rightId: string; // hermano que se fusiona
  sepKey: number; // separador que baja desde el padre
};

export type BRedistributeEvent = {
  type: "redistribute";
  fromId: string; // donante
  toId: string; // receptor
  viaKey: number; // separador ajustado en el padre
  direction: "left" | "right";
};

/* ───────── Fix-ups B+: leaf links + split/merge diferenciados ───────── */
export type BPlusSplitEvent = {
  type: "splitLeaf" | "splitInternal";
  nodeId: string; // nodo que se parte
  midKey: number; // clave separadora (se duplica hacia arriba en B+)
  leftId?: string;
  rightId?: string;
};

export type BPlusMergeEvent = {
  type: "mergeLeaf" | "mergeInternal";
  leftId: string; // absorbe
  rightId: string; // hermano fusionado
  sepKey: number; // separador que se ajusta en el padre (se elimina/actualiza)
};

export type BPlusRedistributeEvent = {
  type: "redistributeLeaf" | "redistributeInternal";
  fromId: string; // donante
  toId: string; // receptor
  viaKey: number; // separador ajustado en el padre
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

export type BFixLog = (BSplitEvent | BMergeEvent | BRedistributeEvent)[];

// Un nodo de Árbol B+ para el renderer D3/SVG.
// En B+ todas las claves "reales" viven en hojas. Los internos solo enrutan.
export type BPlusHierarchy = {
  id: string; // "n-<idNum>"
  idNum: number; // requerido
  keys: number[]; // claves ordenadas asc
  children?: BPlusHierarchy[]; // hijos reales (sin placeholders) solo si !isLeaf

  // B+ específico
  isLeaf: boolean; // ← diferenciador clave
  nextLeafId?: string; // enlace lateral derecha (lista enlazada de hojas)
  prevLeafId?: string; // enlace lateral izquierda (opcional)

  // (Opcionales) Metadatos para tooltips/inspección
  order?: number; // m (aridad máx del árbol)
  degree?: number; // hijos actuales (internos) o #keys (hoja)
  minKeys?: number; // t-1 si t = grado mínimo
  maxKeys?: number; // m-1
  isPlaceholder?: boolean;
  meta?: { nIndex?: number };
};

export type ListRenderConfig = {
  showHeadIndicator: boolean;
  showTailIndicator: boolean;
  showDoubleLinks: boolean;
  showCircularLinks: boolean;
  showNextCircularLink?: boolean;
  showPrevCircularLink?: boolean;
};

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

/* ───────────────────── Heap: jerarquía para renderer (opcional) ───────────────────── */
export type HeapHierarchy = {
  id: string; // ej. "heap-0", "heap-1"
  idNum: number; // índice entero (level-order)
  priority: number; // clave usada para comparar
  value?: number; // dato asociado (si difiere de priority)
  children?: HeapHierarchy[];
  isPlaceholder?: boolean;
  index?: number; // alias de idNum si te viene mejor
  meta?: { nIndex?: number };
};

/* ───────────────────── Heap: eventos para animación / fix-ups ───────────────────── */
export type HeapSwapEvent = {
  type: "swap";
  aId: string; // id del nodo A
  bId: string; // id del nodo B
};

export type HeapReplaceRootEvent = {
  type: "replaceRoot";
  rootId: string; // id del root previo
  withId: string; // id del último nodo que sube
};

export type HeapReplaceNodeEvent = {
  type: "replaceNode";
  targetId: string; // id del nodo a reemplazar (no raíz)
  withId: string; // id del nodo que toma su lugar (típicamente el último)
  parentId?: string; // opcional: útil si quieres reajustar un solo link
};

// Unión canónica:
export type HeapFixEvent =
  | HeapSwapEvent
  | HeapReplaceRootEvent
  | HeapReplaceNodeEvent;

export type HeapFixLog = HeapFixEvent[];

/* Conveniencia (igual que hiciste con B/B+) */
export type HeapQuery = BaseQueryOperations<"arbol_heap">;

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

export type BaseQueryOperations<T extends string> = T extends "secuencia"
  ? {
      create: number | null;
      toAdd: number | null;
      toDelete: number | null;
      toGet: number | null;
      toSearch: number | null;
      toUpdate: [number, number] | [];
    }
  : T extends "cola"
    ? {
        toEnqueuedNode: string | null;
        toDequeuedNode: string | null;
        toGetFront: string | null;
        toClear: boolean;
      }
    : T extends "tabla_hash"
      ? {
          create: (cap: number) => void;
          set: (key: number, value: number) => void;
          get: (key: number) => void;
          delete: (key: number) => void;
          clean: () => void;
        }
      : T extends "cola_de_prioridad"
        ? {
            toEnqueuedNode: string | null;
            toDequeuedNode: string | null;
            toGetFront: string | null;
            toClear: boolean;
          }
        : T extends "pila"
          ? {
              toPushNode: string | null;
              toPopNode: string | null;
              toGetTop: string | null;
              toClear: boolean;
            }
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
                  : T extends "arbol_rojinegro" | "arbol_rb"
                    ? {
                        /* Operaciones mutables */
                        toInsert: number | null; // insert(x)
                        toDelete: number | null; // delete(x)

                        /* Consultas */
                        toSearch: number | null; // search(x)

                        /* Recorridos */
                        toGetPreOrder: TraversalNodeType[] | [];
                        toGetInOrder: TraversalNodeType[] | [];
                        toGetPostOrder: TraversalNodeType[] | [];
                        toGetLevelOrder: TraversalNodeType[] | [];

                        /* Limpieza */
                        toClear: boolean; // clear()

                        /* Fix-ups RB detectados en la última operación (opcional) */
                        rbFix?: {
                          rotations: RbRotation[]; // p.ej. [{dir:"left", pivotId:"n3"}]
                          recolors: RbRecolor[]; // p.ej. [{id:"n1", to:"black"}, ...]
                        } | null;
                      }
                    : T extends "arbol_nario"
                      ? {
                          /** Crear raíz si está vacío */
                          toCreateRoot: number | null;

                          /** Insertar hijo: [parentId, value, index?]  ← parentId es string */
                          toInsertChild:
                            | []
                            | [parentId: string, value: number, index?: number];

                          /** Eliminar nodo/subárbol por id */
                          toDeleteNode: string | null;

                          /** Mover subárbol: [id, newParentId, index?]  ← ids son string */
                          toMoveNode:
                            | []
                            | [id: string, newParentId: string, index?: number];

                          /** Actualizar valor de un nodo: [id, newValue]  ← id es string */
                          toUpdateValue: [] | [id: string, newValue: number];

                          /** Buscar valor (por contenido) */
                          toSearch: number | null;

                          /** Recorridos */
                          toGetPreOrder: TraversalNodeType[] | [];
                          toGetPostOrder: TraversalNodeType[] | [];
                          toGetLevelOrder: TraversalNodeType[] | [];

                          /** Vaciar árbol completo */
                          toClear: boolean;
                        }
                      : T extends "arbol_123" | "arbol_23"
                        ? {
                            /** Operaciones mutables */
                            toInsert: number | null; // insert(x)
                            toDelete: number | null; // delete(x)

                            /** Consultas */
                            toSearch: number | null; // search(x)

                            /** Recorridos (nota: cada key del nodo se emite como elemento de la secuencia) */
                            toGetPreOrder: TraversalNodeType[] | [];
                            toGetInOrder: TraversalNodeType[] | [];
                            toGetPostOrder: TraversalNodeType[] | [];
                            toGetLevelOrder: TraversalNodeType[] | [];

                            /** Limpieza */
                            toClear: boolean; // clear()
                          }
                        : T extends "arbol_b"
                          ? {
                              /** Mutaciones */
                              toInsert: number | null; // insert(x)
                              toDelete: number | null; // delete(x)

                              /** Consultas */
                              toSearch: number | null; // search(x)

                              /** Recorridos */
                              toGetPreOrder: TraversalNodeType[] | [];
                              toGetInOrder: TraversalNodeType[] | [];
                              toGetPostOrder: TraversalNodeType[] | [];
                              toGetLevelOrder: TraversalNodeType[] | [];

                              /** Limpieza */
                              toClear: boolean; // clear()

                              /** (Opcional) registro de fix-ups para el renderer */
                              bFix?: BFixLog | null;
                            }
                          : T extends "arbol_bplus"
                            ? {
                                /** Mutaciones */
                                toInsert: number | null;
                                toDelete: number | null;

                                /** Consultas puntuales */
                                toSearch: number | null;

                                /** Parámetros para animar RANGE / SCAN FROM (solo args) */
                                toGetRange: [] | [from: number, to: number];
                                toScanFrom: [] | [start: number, limit: number];

                                /** Secuencias para la banda inferior (resultado que se dibuja) */
                                toGetInOrder: TraversalNodeType[] | undefined;
                                toGetLevelOrder:
                                  | TraversalNodeType[]
                                  | undefined;

                                /** Limpieza */
                                toClear: boolean;

                                /** Fix-ups para el renderer (opcional) */
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
                              : never; // Fallback para otros casos

// Fallback para otros casos

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
      }
    : T extends "cola de prioridad"
      ? {
          enqueue: (element: number, priority: number) => void;
          dequeue: () => void;
          getFront: () => void;
          clean: () => void;
        }
      : T extends "pila"
        ? {
            push: (element: number) => void;
            pop: () => void;
            getTop: () => void;
            clean: () => void;
          }
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
                : T extends "arbol_rojinegro"
                  ? {
                      insert: (value: number) => void; // inserta y hace fix-up RB
                      delete: (value: number) => void; // elimina y hace fix-up RB
                      search: (value: number) => void; // búsqueda BST

                      getPreOrder: () => void;
                      getInOrder: () => void;
                      getPostOrder: () => void;
                      getLevelOrder: () => void;

                      clean: () => void; // reset total
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
                    : T extends "arbol_nario"
                      ? {
                          /** Crea la raíz si el árbol está vacío */
                          createRoot: (value: number) => void;

                          /** parentId es NUMÉRICO aquí */
                          insertChild: (
                            parentId: number,
                            value: number,
                            index?: number
                          ) => void;

                          /** ids numéricos */
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
                      : T extends "arbol_123" | "arbol_23"
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
                          : T extends "arbol_b_plus"
                            ? {
                                insert: (value: number) => void;
                                delete: (value: number) => void;
                                search: (value: number) => void;

                                // Propios de B+
                                range: (from: number, to: number) => void;
                                scanFrom: (
                                  start: number,
                                  limit: number
                                ) => void;

                                // Recorridos
                                getInOrder: () => void;
                                getLevelOrder: () => void;

                                clean: () => void;
                              }
                            : Record<string, (...args: unknown[]) => void>; // Fallback para otros casos

export type AnimationContextType = {
  isAnimating: boolean;
  setIsAnimating: React.Dispatch<React.SetStateAction<boolean>>;
};

export type CodeAnalysisProps = {
  code: string;
  operationalCost: string[];
  complexity: string;
};

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

export type IndicatorPositioningConfig = {
  calculateTransform: (
    nodePos: { x: number; y: number },
    dims: { elementWidth: number; elementHeight: number }
  ) => string;
};

export type EqualityFn<T> = (a: T, b: T) => boolean;

export type Comparator<T> = (a: T, b: T) => number;

export type HierarchyNodeData<T> = {
  id: string;
  value?: T;
  isPlaceholder?: boolean;
  //(opcionales) para AVL
  bf?: number; // balance factor
  height?: number; // altura del nodo

  // (opcional) para Árbol Roji-Negro
  color?: RBRenderColor; // "red" | "black" si viene de RB

  // N-ario (opcional)
  degree?: number; // número de hijos del nodo (para tooltips/etiquetas)
  order?: number; // aridad máxima del árbol/nodo (si quieres mostrarla)

  idNum?: number; // id numérico original (opcional)
  meta?: {
    nIndex?: number; // para n-ario (posición del hijo)
    // puedes añadir otros campos que uses visualmente
  };
  children?: HierarchyNodeData<T>[];
};

export type TreeLinkData = {
  sourceId: string;
  targetId: string;
};

export type TraversalNodeType = {
  id: string;
  value: number;
};

export type RotationStep = {
  type: "LL" | "RR" | "LR" | "RL";
  zId: string; // Nodo desbalanceado (raíz del subárbol que rota)
  yId: string; // Hijo de la rama pesada
  xId?: string | null; // Nieto (solo LR/RL)
  parentOfZId?: string | null; // Padre de Z
  BId?: string | null; // LL/RR y.right (LL) o y.left (RR)
  xLeftId?: string | null; // LR/RL x.left
  xRightId?: string | null; // LR/RL x.right
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
  links: {
    sourceId: string;
    targetId: string;
  }[];
};

type TreeTraversalAnimOptions = {
  recolor?: boolean;
  strokeColor?: string;
};
