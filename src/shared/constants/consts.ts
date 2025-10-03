import { ListRenderConfig } from "../../types";

export const TYPE_FILTER = {
  NONE: "none",
  ESTRUCTURA_LINEAL: "estructura_lineal",
  ARBOL_BINARIO: "arbol_binario",
  ARBOL_ENEARIO: "arbol_eneario",
} as const;

export const STRUCTURE_NAME = {
  SEQUENCE: 'secuencia',
  QUEUE: 'cola',
  PRIORITY_QUEUE: 'cola de prioridad',
  STACK: 'pila',
  LINKED_LIST: 'lista_enlazada',
  SIMPLE_LINKED_LIST: 'lista_simplemente_enlazada',
  DOUBLY_LINKED_LIST: 'lista_doblemente_enlazada',
  CIRCULAR_DOUBLY_LINKED_LIST: 'lista_circular_doblemente_enlazada',
  CIRCULAR_SIMPLE_LINKED_LIST: 'lista_circular_simplemente_enlazada',
  HASHTABLE: 'tabla_hash',
  BINARY_TREE: 'arbol_binario',
  BINARY_SEARCH_TREE: 'arbol_binario_busqueda',
  AVL_TREE: "arbol_avl",
  RB_TREE: "arbol_rojinegro",
  SPLAY_TREE: "arbol_splay",
  NARY_TREE: "arbol_nario",
  TREE_123: "arbol_123",
  TREE_B: "arbol_b",
  TREE_BPLUS: "arbol_b_plus",
  HEAP_TREE: "arbol_heap",
} as const

export const SVG_STYLE_VALUES = {
  MEMORY_TEXT_COLOR: "#A0FFDA",
  MEMORY_TEXT_SIZE: "13px",
  MEMORY_TEXT_WEIGHT: "500",
  MEMORY_FILL_COLOR: "#2E2E2E",
  MEMORY_STROKE_COLOR: "#555",
  MEMORY_STROKE_WIDTH: 1,
  ELEMENT_TEXT_COLOR: "#E0E0E0",
  ELEMENT_TEXT_WEIGHT: "600",
  ELEMENT_TEXT_SIZE: "16px",
  RECT_FILL_FIRST_COLOR: "#1A1A1A",
  RECT_FILL_SECOND_COLOR: "#1F1F2D",
  RECT_STROKE_COLOR: "#D72638",
  RECT_STROKE_WIDTH: 1.2,
};

export const SVG_SEQUENCE_VALUES = {
  MARGIN_LEFT: 20,
  MARGIN_RIGHT: 20,
  ELEMENT_WIDTH: 65,
  ELEMENT_HEIGHT: 65,
  SPACING: 0,
  HEIGHT: 230,
  INDEX_TEXT_COLOR: "#FF6F6F",
  INDEX_TEXT_SIZE: "13px",
  INDEX_TEXT_WEIGHT: "600",
} as const;

export const SVG_PRIORITY_QUEUE_VALUES = {
  ELEMENT_TEXT_COLOR: "black",
  ELEMENT_TEXT_WEIGHT: "bold",
  ELEMENT_TEXT_SIZE: "15px",
  PRIORITY_BADGE_RADIUS: 14,
  PRIORITY_BADGE_HEIGHT: 14,
  PRIORITY_BADGE_STROKE_WIDTH: 2,
  PRIORITY_BADGE_TEXT_HEIGHT: 14,
  PRIORITY_BADGE_TEXT_FILL: "white",
  PRIORITY_BADGE_TEXT_SIZE: "12px",
  PRIORITY_BADGE_TEXT_WEIGHT: "bold",
  PRIORITY_GLOW_HEIGHT: 14,
  PRIORITY_GLOW_RADIUS: 16,
  PRIORITY_GLOW_FILL: "none",
  PRIORITY_GLOW_STROKE_WIDTH: 1,
} as const;

export const SVG_QUEUE_VALUES = {
  MARGIN_LEFT: 50,
  MARGIN_RIGHT: 50,
  ELEMENT_WIDTH: 80,
  ELEMENT_HEIGHT: 40,
  SPACING: 55,
  HEIGHT: 230,
} as const;

export const SVG_STACK_VALUES = {
  MARGIN_TOP: 30,
  MARGIN_BOTTOM: 30,
  MARGIN_LEFT: 50,
  MARGIN_RIGHT: 50,
  ELEMENT_WIDTH: 80,
  ELEMENT_HEIGHT: 60,
  SPACING: 10,
  WIDTH: 120,
} as const;

export const SVG_LINKED_LIST_VALUES = {
  MARGIN_LEFT: 50,
  MARGIN_RIGHT: 50,
  ELEMENT_WIDTH: 80,
  ELEMENT_HEIGHT: 40,
  SPACING: 55,
  HEIGHT: 240,
} as const;

export const SVG_BINARY_TREE_VALUES = {
  MARGIN_LEFT: 30,
  MARGIN_RIGHT: 30,
  MARGIN_TOP: 30,
  MARGIN_BOTTOM: 30,
  NODE_RADIUS: 25,
  NODE_SPACING: 65,
  LEVEL_SPACING: 85,
  SEQUENCE_PADDING: 35,
  SEQUENCE_HEIGHT: 25,
  ELEMENT_TEXT_WEIGHT: '600',
  ELEMENT_TEXT_SIZE: '16px',
  HIGHLIGHT_COLOR: "#D72638",
  UPDATE_STROKE_COLOR: "#93c5fd"
}

export const SVG_AVL_TREE_VALUES = {
  NODE_SPACING: 75,
  LEVEL_SPACING: 95,
  PANEL_OFFSET_Y: SVG_BINARY_TREE_VALUES.NODE_RADIUS + 2,
  CORNER: 7,
  LABEL_COLOR: "#9aa4b2",
  LABEL_FONT_SIZE: "9px",
  LABEL_FONT_WEIGHT: 600,
  ELEMENT_TEXT_SIZE: "10px",
  ELEMENT_TEXT_WEIGHT: 700,
  HVAL_COLOR: "#8aa0ff",
  BACKGROUND_COLOR: "#12161f",
  STROKE_COLOR: "#39404d",
  STROKE_WIDTH: 0.8,
  COL_BF: 28,
  COL_H: 25,
  ROW_H_LABEL: 7,
  ROW_H_VALUE: 11,
  EXTRA_W: 2,
};

export const SVG_RB_TREE_VALUES = {
  NODE_SPACING: 75,
  LEVEL_SPACING: 95,
  EXTRA_WIDTH: 70
}

export const SVG_SPLAY_TREE_VALUES = {
  NODE_SPACING: 75,
  LEVEL_SPACING: 95,
  EXTRA_WIDTH: 70
}

export const RB_COLORS = {
  RED: "#ff5a66",
  RED_RING: "#ff9aa1",
  BLACK: "#1f2430",
  BLACK_RING: "#4b5365",
  STROKE: "#95a1bf",
  TEXT_NODE: "#ffffff",
  HIGHLIGHT: "#a7e34b",
  BADGE_GB: "#0f141d",
  BADGE_STROKE: "#f4bf50",
};

export const LIST_RENDER_CONFIGS: Record<string, ListRenderConfig> = {
  simple: {
    showHeadIndicator: true,
    showTailIndicator: false,
    showDoubleLinks: false,
    showCircularLinks: false,
  },
  double: {
    showHeadIndicator: true,
    showTailIndicator: true,
    showDoubleLinks: true,
    showCircularLinks: false,
  },
  circular: {
    showHeadIndicator: true,
    showTailIndicator: true,
    showDoubleLinks: false,
    showCircularLinks: true,
    showNextCircularLink: true,
  },
  double_circular: {
    showHeadIndicator: true,
    showTailIndicator: false,
    showDoubleLinks: true,
    showCircularLinks: true,
    showNextCircularLink: true,
    showPrevCircularLink: true,
  },
};