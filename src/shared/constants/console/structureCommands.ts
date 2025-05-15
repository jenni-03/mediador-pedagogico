export const structureCommands: Record<string, string[]> = {
    secuencia: ["insertLast", "delete", "set", "clean", "create", "get"],
    pila: ["push", "pop", "getTop", "clean"],
    cola: ["enqueue", "dequeue", "getFront", "clean"],
    cola_de_prioridad: ["enqueue", "dequeue", "getFront", "clean"],
    lista_simple: ["create", "insertFirst", "insertLast", "delete", "insertSorted", "get", "set", "clean", "traverse"],
    lista_doble: ["create", "insertFirst", "insertLast", "delete", "insertSorted", "get", "set", "clean", "traverseForward", "traverseBackward"],
    lista_circular: ["create", "insertFirst", "insertLast", "delete", "insertSorted", "get", "set", "clean", "traverse"],
    lista_circular_doble: ["create", "insertFirst", "insertLast", "delete", "insertSorted", "get", "set", "clean", "traverseForward", "traverseBackward"],
    tabla_hash: ["create", "set","get","delete","clean"],
};