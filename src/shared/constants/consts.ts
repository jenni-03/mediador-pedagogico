export const TYPE_FILTER = {
    NONE: 'none',
    ESTRUCTURA_LINEAL: 'estructura_lineal',
    ARBOL_BINARIO: 'arbol_binario',
    ARBOL_ENEARIO: 'arbol_eneario'
} as const

export const STRUCTURE_NAME = {
    SEQUENCE: 'secuencia',
    QUEUE: 'cola',
    PRIORITY_QUEUE: 'cola de prioridad',
    STACK: 'pila',
    LINKED_LIST: 'lista_enlazada',
    SIMPLE_LINKED_LIST: 'lista_simplemente_enlazada',
    DOUBLE_LINKED_LIST: 'lista_doblemente_enlazada',
    HASHTABLE: 'tabla_hash',
} as const

export const SVG_STYLE_VALUES = {
    MEMORY_TEXT_COLOR: '#A0FFDA',
    MEMORY_TEXT_SIZE: '13px',
    MEMORY_TEXT_WEIGHT: '500',
    MEMORY_FILL_COLOR: '#2E2E2E',
    MEMORY_STROKE_COLOR: '#555',
    MEMORY_SRTOKE_WIDTH: 1,
    ELEMENT_TEXT_COLOR: '#E0E0E0',
    ELEMENT_TEXT_WEIGHT: '600',
    ELEMENT_TEXT_SIZE: '16px',
    RECT_FILL_FIRST_COLOR: '#1A1A1A',
    RECT_FILL_SECOND_COLOR: '#1F1F2D',
    RECT_STROKE_COLOR: '#D72638',
    RECT_STROKE_WIDTH: 1.2,
}

export const SVG_SEQUENCE_VALUES = {
    MARGIN_LEFT: 20,
    MARGIN_RIGHT: 20,
    ELEMENT_WIDTH: 65,
    ELEMENT_HEIGHT: 65,
    SPACING: 0,
    HEIGHT: 230,
    INDEX_TEXT_COLOR: '#FF6F6F',
    INDEX_TEXT_SIZE: '13px',
    INDEX_TEXT_WEIGHT: '600',
} as const

export const SVG_QUEUE_VALUES = {
    MARGIN_LEFT: 50,
    MARGIN_RIGHT: 50,
    ELEMENT_WIDTH: 80,
    ELEMENT_HEIGHT: 40,
    SPACING: 55,
    HEIGHT: 230,
} as const

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
    HEIGHT: 230,
} as const