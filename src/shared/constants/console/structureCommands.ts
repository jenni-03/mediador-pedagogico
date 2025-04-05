export const structureCommands: Record<string, string[]> = {
    secuencia: ["insertLast", "delete", "set", "clean", "create", "get"],
    lista_simple: ["insertFirst", "delete", "create", "clean"],
    lista_circular: ["insertLast", "rotateLeft", "rotateRight", "create", "clean"],
    lista_circular_doble: ["insertSorted", "deleteFirst", "deleteLast", "create", "clean"],
    // Agrega más estructuras con sus comandos válidos
};