export const structureCommands: Record<string, string[]> = {
    secuencia: ["insertLast", "delete", "set", "clean", "create", "get"],
    pila: ["push", "pop", "getTop", "clean"],
    cola: ["enqueue", "dequeue", "getFront", "clean", "getRear"],
    cola_de_prioridad: ["enqueue", "dequeue", "getFront", "clean", "getRear"],
    lista_simple: ["create", "insertFirst", "insertLast", "delete", "insertAt", "search", "update", "clean", "traverse"],
    lista_circular: ["insertLast", "rotateLeft", "rotateRight", "create", "clean"],
    lista_circular_doble: ["insertSorted", "deleteFirst", "deleteLast", "create", "clean"],
};