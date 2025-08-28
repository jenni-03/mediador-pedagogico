export const structureCommands: Record<string, string[]> = {
  secuencia: ["insertLast", "delete", "set", "clean", "create", "get", "search"],
  pila: ["push", "pop", "getTop", "clean"],
  cola: ["enqueue", "dequeue", "getFront", "clean"],
  "cola de prioridad": ["enqueue", "dequeue", "getFront", "clean"],
  lista_enlazada: ["insertFirst", "insertLast", "insertAt", "removeFirst", "removeLast", "removeAt", "search", "clean"],
  tabla_hash: ["create", "set", "get", "delete", "clean"],
  arbol_binario: ["insertLeft", "insertRight", "delete", "search", "getPreOrder", "getInOrder", "getPostOrder", "getLevelOrder", "clean"],
  arbol_binario_busqueda: ["insert", "delete", "search", "getPreOrder", "getInOrder", "getPostOrder", "getLevelOrder", "clean"],
  arbol_avl: ["insert", "delete", "search", "getPreOrder", "getInOrder", "getPostOrder", "getLevelOrder", "clean"],
  arbol_rojinegro: ["insert", "delete", "search", "getPreOrder", "getInOrder", "getPostOrder", "getLevelOrder", "clean"],
  arbol_nario: [
    "createRoot", "insertChild", "deleteNode", "moveNode", "updateValue", "search", "getPreOrder", "getPostOrder", "getLevelOrder", "clean",
  ],
};
