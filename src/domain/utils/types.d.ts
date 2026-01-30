import type { HierarchyNode } from "d3";
import type { ReactNode, Dispatch, SetStateAction } from "react";
import type { NodoS } from "../nodes/NodoS";
import type { NodoD } from "../nodes/NodoD";
import type { NodoBin } from "../nodes/NodoBin";
import type { NodoAVL } from "../nodes/NodoAVL";
import type { NodoRB } from "../nodes/NodoRB";
import { TYPE_FILTER } from "../constants/consts";
import type { NodoSplay } from "../nodes/NodoSplay";

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

export type ListLinkPathFn = (
  direction: "prev" | "next" | "circular-prev" | "circular-next",
  sourcePos: { x: number; y: number } | null,
  targetPos: { x: number; y: number } | null,
  elementWidth: number,
  elementHeight: number
) => string;


export type ListLinkData = {
  sourceId: string;
  targetId: string;
  type: "next" | "prev" | "circular-next" | "circular-prev";
};

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

export type TwoThreeHierarchy = {
  id: string;
  idNum: number;
  value: number[];
  children?: TwoThreeHierarchy[];
  isPlaceholder?: boolean;
  degree?: number;
  order?: number;
  meta?: { nIndex?: number };
};

export type BHierarchy = {
  id: string;
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
  children?: BPlusHierarchy[];
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

/* ───────────── Trazas / frames AVL, RB & Splay ───────────── */

export type BinaryTreeLevelStep =
  | { type: "checkEmpty"; isEmpty: boolean }
  | { type: "checkChild"; side: "left" | "right" }
  | { type: "enqueue"; at: string; origin: "root" | "left" | "right" }
  | { type: "dequeue"; at: string }
  | { type: "visit"; at: string };

export type BinaryTreeTraversalStep =
  | { type: "checkNull"; at: string | null; isNull: boolean }
  | { type: "goLeft"; from: string; to: string | null }
  | { type: "visit"; at: string }
  | { type: "goRight"; from: string; to: string | null }
  | { type: "return"; from: string | null; to: string | null; via: "root" | "left" | "right" };

export type BinaryTreeGetStep =
  | { type: "checkNull"; at: string | null; isNull: boolean }
  | { type: "match"; at: string, found: boolean }
  | { type: "goLeft"; from: string; to: string | null }
  | { type: "checkLeftResult"; from: string; found: boolean }
  | { type: "goRight"; from: string; to: string | null }
  | { type: "return"; from: string | null; to: string | null; via: "root" | "left" | "right", found: boolean };

export type BSTInsertStep =
  | { type: "checkNull"; at: string | null; isNull: boolean }
  | { type: "createLeaf"; parent: string | null; side: "root" | "left" | "right" }
  | { type: "compare"; at: string; cmp: -1 | 0 | 1 }
  | { type: "goLeft"; from: string; to: string | null }
  | { type: "goRight"; from: string; to: string | null }
  | { type: "return"; from: string | null; to: string | null; via: "root" | "left" | "right" };

export type BSTInsertMeta<T> = {
  parent: NodoBin<T> | null;
  targetNode: NodoBin<T> | null;
  inserted: boolean;
};

export type BSTDeleteStep =
  | { type: "checkNull"; at: string | null; isNull: boolean }
  | { type: "compare"; at: string; cmp: -1 | 0 | 1 }
  | { type: "goLeft"; from: string; to: string | null }
  | { type: "goRight"; from: string; to: string | null }
  | { type: "match"; at: string }
  | { type: "return"; from: string | null; to: string | null; via: "root" | "left" | "right" };

export type BSTDeleteMeta<T> = {
  parent: NodoBin<T> | null;
  targetNode: NodoBin<T> | null;
  pathToSuccessorIds: string[];
  successor: NodoBin<T> | null;
  successorParent: NodoBin<T> | null;
  replacement: NodoBin<T> | null;
  replacementSide: "left" | "right" | null;
  deleted: boolean;
};

export type BSTSearchStep =
  | { type: "checkNull"; at: string | null; isNull: boolean }
  | { type: "compare"; at: string; cmp: -1 | 0 | 1 }
  | { type: "goLeft"; from: string; to: string | null }
  | { type: "goRight"; from: string; to: string | null }
  | { type: "match"; at: string }
  | { type: "return"; from: string | null; to: string | null; via: "root" | "left" | "right" };

type BSTSearchMeta<T> = {
  targetNode: NodoBin<T> | null;
};

export type AVLInsertStep =
  | { type: "checkNull"; at: string | null; isNull: boolean }
  | { type: "createLeaf"; parent: string | null; side: "root" | "left" | "right" }
  | { type: "compare"; at: string; cmp: -1 | 0 | 1 }
  | { type: "goLeft"; from: string; to: string | null }
  | { type: "goRight"; from: string; to: string | null }
  | { type: "updateHeight"; at: string }
  | { type: "computeBalance"; at: string; bf: -2 | -1 | 0 | 1 | 2 }
  | { type: "rotationCase"; at: string; kind: "LL" | "LR" | "RL" | "RR" }
  | { type: "rotate"; dir: "left" | "right"; pivot: string; frameIndex: number; rotationIndex: number; phase?: 0 | 1 }
  | { type: "return"; from: string | null; to: string | null; via: "root" | "left" | "right" };

type AVLInsertMeta<T> = {
  parent: NodoAVL<T> | null;
  targetNode: NodoAVL<T> | null;
  inserted: boolean;
};

export type AVLDeleteStep =
  | { type: "checkNull"; at: string | null; isNull: boolean }
  | { type: "compare"; at: string; cmp: -1 | 0 | 1 }
  | { type: "goLeft"; from: string; to: string | null }
  | { type: "goRight"; from: string; to: string | null }
  | { type: "match"; at: string; role: "target" | "successor" }
  | { type: "callDeleteSuccessor"; from: string; startAt: string | null }
  | { type: "updateHeight"; at: string }
  | { type: "computeBalance"; at: string; bf: -2 | -1 | 0 | 1 | 2 }
  | { type: "rotationCase"; at: string; kind: "LL" | "LR" | "RL" | "RR" }
  | { type: "rotate"; dir: "left" | "right"; pivot: string; frameIndex: number; rotationIndex: number; phase?: 0 | 1 }
  | { type: "return"; from: string | null; to: string | null; via: "root" | "left" | "right" };

export type AVLDeleteMeta<T> = {
  parent: NodoAVL<T> | null;
  targetNode: NodoAVL<T> | null;
  pathToSuccessorIds: string[];
  successor: NodoAVL<T> | null;
  successorParent: NodoAVL<T> | null;
  replacement: NodoAVL<T> | null;
  replacementSide: "left" | "right" | null;
  deleted: boolean;
};

export type RBInsertStep =
  | { type: "visit"; at: string | null }
  | { type: "compare"; at: string; cmp: -1 | 0 | 1 }
  | { type: "advance"; from: string; to: string | null; dir: "L" | "R" }
  | { type: "createNode"; id: string; color: "RED" }
  | { type: "attachNode"; parentId: string | null; side: "root" | "left" | "right" }
  | { type: "fixupWhileCheck"; zId: string; parentId: string | null; parentRed: boolean }
  | { type: "parentSide"; pId: string; gId: string; side: "left" | "right" }
  | { type: "fixupCase"; case: 1 | 2 | 3; side: "left" | "right" }
  | { type: "recolor"; caseKind: "case1" | "case3" | "root"; actionIndex: number; count: 1 | 2 | 3; side?: "left" | "right" }
  | { type: "rotate"; caseKind: "case2" | "case3"; dir: "left" | "right"; pivot: string; frameIndex: number; actionIndex: number; pivotSideOnParent: "left" | "right" | "root" }
  | { type: "rootBlackCheck"; rootId: string | null; recolor: boolean }
  | { type: "return" };

export type RBDeleteStep =
  | { type: "visit"; at: string | null }
  | { type: "compare"; at: string; cmp: -1 | 0 | 1 }
  | { type: "advance"; from: string; to: string | null; dir: "L" | "R" }
  | { type: "checkMatch"; found: boolean; zId: string | null }
  | { type: "deleteCase"; kind: "noLeft" | "noRight" | "twoChildren"; zId: string }
  | { type: "transplant"; uId: string; vId: string | null; uParentId: string | null; uSide: "root" | "left" | "right" }
  | { type: "succParentCheck"; directChild: boolean; zId: string; succId: string }
  | { type: "linkChild"; prevParentId: string, newParentId: string; childId: string | null; side: "left" | "right" }
  | { type: "setParent"; nodeId: string | null; parentId: string | null, side: "left" | "right" }
  | { type: "fixupCall"; needed: boolean; }
  | { type: "fixupWhileCheck"; xId: string | null; xParentId: string | null; continue: boolean }
  | { type: "resolveParent"; pId: string | null; from: "x.padre" | "xParent" }
  | { type: "resolveSibling"; pId: string; wId: string | null; side: "left" | "right" }
  | { type: "fixupCase"; case: "A" | "B" | "C" | "D"; side: "left" | "right"; nodeId: string }
  | { type: "moveUp"; fromXId: string | null; toXId: string; newXParentId: string | null }
  | { type: "xSide"; pId: string; xId: string | null; side: "left" | "right" }
  | { type: "checkNode"; nodeType: "Hermano" | "HijoCer" | "HijoLej"; case: "B" | "C" | "D"; side: "left" | "right" }
  | { type: "recolor"; kind: "copyZColor" | "fixup" | "final"; actionIndex: number; count?: 1 | 2 | 3 | 4; side?: "left" | "right"; case?: "A" | "B" | "C" | "D" }
  | { type: "rotate"; caseKind: "fixupA" | "fixupC" | "fixupD"; dir: "left" | "right"; pivot: string; frameIndex: number; actionIndex: number; pivotSideOnParent: "left" | "right" | "root" }
  | { type: "return" };

export type SplayInsertStep =
  | { type: "visit"; at: string | null }
  | { type: "compare"; at: string; cmp: -1 | 0 | 1 }
  | { type: "advance"; from: string; to: string | null; dir: "L" | "R" }
  | { type: "createNode"; id: string; }
  | { type: "attachNode"; parentId: string | null; side: "root" | "left" | "right" }
  | { type: "splayCall"; xId: string; reason: "insertion" | "search" }
  | { type: "splayWhileCheck"; xId: string; parentId: string | null; continue: boolean }
  | { type: "resolvePG"; xId: string; pId: string; gId: string | null }
  | { type: "splayCase"; kind: "zig" | "zig-zig" | "zig-zag"; shape: "LL" | "LR" | "RR" | "RL" }
  | {
    type: "rotate";
    kind: "splay";
    subkind: "zig" | "zigzig-1" | "zigzig-2" | "zigzag-1" | "zigzag-2";
    dir: "left" | "right";
    pivot: string;
    frameIndex: number;
    rotationIndex: number;
    pivotSideOnParent: "left" | "right" | "root";
  }
  | { type: "setRoot"; rootId: string }
  | { type: "return" };

export type SplaySearchStep =
  | { type: "visit"; at: string | null }
  | { type: "compare"; at: string; cmp: -1 | 0 | 1 }
  | { type: "advance"; from: string; to: string | null; dir: "L" | "R" }
  | { type: "splayCall"; xId: string; reason: "search-found" | "search-notfound" }
  | { type: "splayWhileCheck"; xId: string; parentId: string | null; continue: boolean }
  | { type: "resolvePG"; xId: string; pId: string; gId: string | null }
  | { type: "splayCase"; kind: "zig" | "zig-zig" | "zig-zag"; shape: "LL" | "LR" | "RR" | "RL" }
  | {
    type: "rotate";
    kind: "splay";
    subkind: "zig" | "zigzig-1" | "zigzig-2" | "zigzag-1" | "zigzag-2";
    dir: "left" | "right";
    pivot: string;
    frameIndex: number;
    rotationIndex: number;
    pivotSideOnParent: "left" | "right" | "root";
  }
  | { type: "setRoot"; rootId: string }
  | { type: "return" };

export type SplayDeleteStep =
  | { type: "checkFoundNode"; at: string | null }
  | { type: "split"; root: string; leftId: string | null; rightId: string | null }
  | { type: "detachParent"; nodeId: string | null; parentId: string | null; side: "left" | "right" }
  | { type: "cutChild"; fromId: string; side: "left" | "right"; childId: string | null }
  | { type: "setRoot"; rootId: string | null; side?: "left" | "right" | "null" }
  | { type: "joinCase"; kind: "leftNull" | "leftNotNull" }
  | { type: "traverseMaxLeftStart"; rootId: string }
  | { type: "moveToRight"; fromId: string; toId: string }
  | { type: "maxLeftFound"; nodeId: string }
  | { type: "decSize"; }
  | { type: "splayCall"; xId: string; reason: "deletion" }
  | { type: "attachRight"; parentId: string; rightId: string | null }
  | { type: "setParent"; nodeId: string; parentId: string | null }
  | { type: "splayWhileCheck"; xId: string; parentId: string | null; continue: boolean }
  | { type: "resolvePG"; xId: string; pId: string; gId: string | null }
  | { type: "splayCase"; kind: "zig" | "zig-zig" | "zig-zag"; shape: "LL" | "LR" | "RR" | "RL" }
  | {
    type: "rotate";
    kind: "splay";
    subkind: "zig" | "zigzig-1" | "zigzig-2" | "zigzag-1" | "zigzag-2";
    dir: "left" | "right";
    pivot: string;
    frameIndex: number;
    rotationIndex: number;
    pivotSideOnParent: "left" | "right" | "root";
  }
  | { type: "return" };

export type RotationType = "LL" | "RR" | "LR" | "RL";

export type RotationStep = {
  type: RotationType;
  zId: string; // Nodo desbalanceado (raíz del subárbol que rota)
  yId: string; // Hijo de la rama pesada
  xId?: string | null; // Nieto (solo LR/RL)
  parentOfZId?: string | null; // Padre de Z
  BId?: string | null; // LL/RR y.right (LL) o y.left (RR)
  xLeftId?: string | null; // LR/RL x.left
  xRightId?: string | null; // LR/RL x.right
}

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

export type RbRotationTag = "Izq(padre)" | "Der(padre)" | "Der(hermano)" | "Izq(hermano)" | "Der(abuelo)" | "Izq(abuelo)";

export type RBRenderColor = "red" | "black";
export type RBColor = "RED" | "BLACK";

export type RBAction =
  | { kind: "recolor"; id: string; from: RBColor; to: RBColor; nodeBadge: string; }
  | { kind: "rotation"; tag: RbRotationTag; step: RotationStep };

export type RBTrace<T> = {
  actions: RBAction[];
  hierarchies: {
    bst: HierarchyNodeData<T> | null;
    mids: HierarchyNodeData<T>[];
  };
};

export type SplayRotationTag = "Zig" | "Zig-Zig" | "Zig-Zag";

export type SplayFrame = AvlFrame;

export type SplayRotation = { tag: SplayRotationTag; step: RotationStep; };

export type SplayTrace<T> = {
  rotations: SplayRotation[];
  hierarchies: {
    bst: HierarchyNodeData<T> | null;
    mids: HierarchyNodeData<T>[];
  };
};

/* ───────────── Tipos de retorno para árboles BST ───────────── */

export type BinaryTreeLevelOutput<T> = {
  steps: BinaryTreeLevelStep[];
  visited: NodoBin<T>[];
};

export type BinaryTreeTraverseOutput<T> = {
  steps: BinaryTreeTraversalStep[];
  visited: NodoBin<T>[];
};

export type BinaryTreeInsertOutput<T> = {
  steps: BinaryTreeGetStep[];
  parent: NodoBin<T> | null;
  targetNode: NodoBin<T>;
  inserted: boolean;
};

export type BinaryTreeDeleteOutput<T> = {
  steps: BinaryTreeGetStep[];
  parent: NodoBin<T> | null;
  targetNode: NodoBin<T>;
  targetSide: "left" | "right" | null;
  pathToSuccessorIds: string[];
  successor: NodoBin<T> | null;
  successorParent: NodoBin<T> | null;
  replacement: NodoBin<T> | null;
  deleted: boolean;
};

export type BinaryTreeSearchOutput<T> = {
  steps: BinaryTreeGetStep[];
  targetNode: NodoBin<T> | null;
  found: boolean;
}

export type BSTInsertOutput<T> = {
  steps: BSTInsertStep[];
  parent: NodoBin<T> | null;
  targetNode: NodoBin<T> | null;
  inserted: boolean;
};

export type BSTSearchOutput<T> = {
  steps: BSTSearchStep[];
  targetNode: NodoBin<T> | null;
  found: boolean;
};

export type BSTDeleteOutput<T> = {
  steps: BSTDeleteStep[];
  parent: NodoBin<T> | null;
  targetNode: NodoBin<T> | null;
  pathToSuccessorIds: string[];
  successor: NodoBin<T> | null;
  successorParent: NodoBin<T> | null;
  replacement: NodoBin<T> | null;
  replacementSide: "left" | "right" | null;
  deleted: boolean;
};

export type AVLInsertOutput<T> = {
  steps: AVLInsertStep[];
  parent: NodoAVL<T> | null;
  targetNode: NodoAVL<T> | null;
  inserted: boolean;
};

export type AVLDeleteOutput<T> = {
  steps: AVLDeleteStep[];
  parent: NodoAVL<T> | null;
  targetNode: NodoAVL<T> | null;
  pathToSuccessorIds: string[];
  successor: NodoAVL<T> | null;
  successorParent: NodoAVL<T> | null;
  replacement: NodoAVL<T> | null;
  replacementSide: "left" | "right" | null;
  deleted: boolean;
};

export type RBInsertOutput<T> = {
  steps: RBInsertStep[];
  parent: NodoRB<T> | null;
  targetNode: NodoRB<T> | null;
  inserted: boolean;
};

export type RBDeleteOutput<T> = {
  steps: RBDeleteStep[];
  parent: NodoRB<T> | null;
  targetNode: NodoRB<T> | null;
  pathToSuccessorIds: string[];
  successor: NodoRB<T> | null;
  successorParent: NodoRB<T> | null;
  replacement: NodoRB<T> | null;
  deleted: boolean;
};

export type SplayInsertOutput<T> = {
  steps: SplayInsertStep[];
  parent: NodoSplay<T> | null;
  targetNode: NodoSplay<T> | null;
  inserted: boolean;
};

export type SplayDeleteOutput<T> = {
  searchSteps: SplaySearchStep[];
  deleteSteps: SplayDeleteStep[];
  targetNode: NodoSplay<T> | null;
  maxLeft: NodoSplay<T> | null;
  deleted: boolean;
};

export type SplaySearchOutput<T> = {
  steps: SplaySearchStep[];
  targetNode: NodoSplay<T> | null;
  found: boolean;
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
    bg?: string; stroke?: string; label?: string; value?: string
  };
  size?: { width?: number; height?: number; radius?: number; scaleFrom?: number };
  anchor?: {
    side?: "left" | "right" | "above" | "below";
    dx?: number; dy?: number;
  };
  typography?: {
    labelFz?: string; valueFz?: string; labelFw?: number | string; valueFw?: number | string;
  }
}

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
    toAdd: { element: number, index: number } | null;
    toDelete: { index: number, firstNullIndex: number } | null;
    toGet: number | null;
    toSearch: number | null;
    toUpdate: { newValue: number, index: number } | null;
    toClear: boolean;
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
    toAddAt: { nodeId: string, position: number } | null;
    toDeleteFirst: string | null;
    toDeleteLast: string | null;
    toDeleteAt: { nodeId: string, position: number } | null;
    toSearch: number | null;
    toClear: boolean;
  }
  : // Árbol binario (simple)
  T extends "arbol_binario"
  ? {
    toInsertLeft: { steps: BinaryTreeGetStep[], parentNodeId: string | null, targetNodeId: string, inserted: boolean } | null;
    toInsertRight: { steps: BinaryTreeGetStep[], parentNodeId: string | null, targetNodeId: string, inserted: boolean } | null;
    toDelete: { steps: BinaryTreeGetStep[], parentNodeId: string | null, targetNodeId: string, targetSide: "left" | "right" | null, pathToSuccessorIds: string[], successorNodeId: string | null, successorParentNodeId: string | null, replacementNodeId: string | null, deleted: boolean } | null;
    toSearch: { steps: BinaryTreeGetStep[], targetNodeId: string | null, found: boolean } | null;
    toGetPreOrder: { steps: BinaryTreeTraversalStep[], nodes: TraversalNodeType[] } | null;
    toGetInOrder: { steps: BinaryTreeTraversalStep[], nodes: TraversalNodeType[] } | null;
    toGetPostOrder: { steps: BinaryTreeTraversalStep[], nodes: TraversalNodeType[] } | null;
    toGetLevelOrder: { steps: BinaryTreeLevelStep[], nodes: TraversalNodeType[] } | null;
    toClear: boolean;
  }
  : // ABB
  T extends "arbol_binario_busqueda"
  ? {
    toInsert: { steps: BSTInsertStep[], parentNodeId: string | null, targetNodeId: string, inserted: boolean } | null;
    toDelete: { steps: BSTDeleteStep[], parentNodeId: string | null, targetNodeId: string | null, pathToSuccessorIds: string[], successorNodeId: string | null, successorParentNodeId: string | null, replacementNodeId: string | null, replacementSide: "left" | "right" | null, deleted: boolean } | null;
    toSearch: { steps: BSTSearchStep[], targetNodeId: string | null, found: boolean } | null;
    toGetPreOrder: { steps: BinaryTreeTraversalStep[], nodes: TraversalNodeType[] } | null;
    toGetInOrder: { steps: BinaryTreeTraversalStep[], nodes: TraversalNodeType[] } | null;
    toGetPostOrder: { steps: BinaryTreeTraversalStep[], nodes: TraversalNodeType[] } | null;
    toGetLevelOrder: { steps: BinaryTreeLevelStep[], nodes: TraversalNodeType[] } | null;
    toClear: boolean;
  }
  : // AVL
  T extends "arbol_avl"
  ? {
    toInsert: { steps: AVLInsertStep[], parentNodeId: string | null, targetNodeId: string, inserted: boolean } | null;
    toDelete: { steps: AVLDeleteStep[], parentNodeId: string | null, targetNodeId: string | null, pathToSuccessorIds: string[], successorNodeId: string | null, successorParentNodeId: string | null, replacementNodeId: string | null, replacementSide: "left" | "right" | null, deleted: boolean } | null;
    toSearch: { steps: BSTSearchStep[], targetNodeId: string | null, found: boolean } | null;
    toGetPreOrder: { steps: BinaryTreeTraversalStep[], nodes: TraversalNodeType[] } | null;
    toGetInOrder: { steps: BinaryTreeTraversalStep[], nodes: TraversalNodeType[] } | null;
    toGetPostOrder: { steps: BinaryTreeTraversalStep[], nodes: TraversalNodeType[] } | null;
    toGetLevelOrder: { steps: BinaryTreeLevelStep[], nodes: TraversalNodeType[] } | null;
    toClear: boolean;
    avlTrace: OperationTrace<number> | null;
  }
  : // RB (ambos alias)
  T extends "arbol_rojinegro" | "arbol_rb"
  ? {
    toInsert: { steps: RBInsertStep[], parentNodeId: string | null, targetNodeId: string, inserted: boolean } | null;
    toDelete: { steps: RBDeleteStep[], parentNodeId: string | null, targetNodeId: string | null, pathToSuccessorIds: string[], successorNodeId: string | null, successorParentNodeId: string | null, replacementNodeId: string | null, deleted: boolean } | null;
    toSearch: { steps: BSTSearchStep[], targetNodeId: string | null, found: boolean } | null;
    toGetPreOrder: { steps: BinaryTreeTraversalStep[], nodes: TraversalNodeType[] } | null;
    toGetInOrder: { steps: BinaryTreeTraversalStep[], nodes: TraversalNodeType[] } | null;
    toGetPostOrder: { steps: BinaryTreeTraversalStep[], nodes: TraversalNodeType[] } | null;
    toGetLevelOrder: { steps: BinaryTreeLevelStep[], nodes: TraversalNodeType[] } | null;
    toClear: boolean;
    rbTrace: RBTrace<number> | null;
  }
  : T extends "arbol_splay"
  ? {
    toInsert: { targetNodeId: string, inserted: boolean } | null;
    toDelete: { nodeId: string, removed: boolean, maxLeftId: string | null } | null;
    toSearch: { nodeId: string; found: boolean; } | null;
    toGetPreOrder: TraversalNodeType[] | [];
    toGetInOrder: TraversalNodeType[] | [];
    toGetPostOrder: TraversalNodeType[] | [];
    toGetLevelOrder: TraversalNodeType[] | [];
    toClear: boolean;
    splayTrace: SplayTrace<number> | null;
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
  : // Splay
  T extends "arbol_splay"
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
  error: { message: string; id: number; op: string; planId?: string | null } | null;
  children: ReactNode;
};