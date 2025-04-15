export const commandsData: Record<string, any> = {
  secuencia: {
    buttons: [
      {
        title: "create",
        description:
          "Crear una Secuencia de acuerdo a una capacidad predefinida",
        estructura: "create(valor-capacidad);",
        ejemplo: "create(10);",
      },
      {
        title: "insertLast",
        description: "Insertar un elemento al final de la Secuencia",
        estructura: "insertLast(valor);",
        ejemplo: "insertLast(1);",
      },
      {
        title: "get",
        description: "Buscar un elemento en la Secuencia",
        estructura: "get(valor);",
        ejemplo: "get(1);",
      },
      {
        title: "set",
        description: "Actualizar el valor de un elemento existente en la Secuencia",
        estructura: "set(posición,nuevo-valor)",
        ejemplo: "set(0,10)",
      },
      {
        title: "delete",
        description: "Borrar un elemento de la Secuencia",
        estructura: "delete(posición);",
        ejemplo: "delete(0);",
      },
      {
        title: "clean",
        description: "Borrar la estructura Secuencia",
        estructura: "clean();",
        ejemplo: "clean();",
      },
    ],
  },
  pila: {
    buttons: [
      {
        title: "push",
        description: "Insertar un elemento en la Pila.",
        estructura: "push(valor);",
        ejemplo: "push(1);",
      },
      {
        title: "pop",
        description: "Eliminar un elemento de la Pila.",
        estructura: "pop();",
        ejemplo: "pop();",
      },
      {
        title: "getTop",
        description: "Obtener el elemento que se encuentra en el tope de la Pila.",
        estructura: "getTop();",
        ejemplo: "getTop();",
      },
      {
        title: "clean",
        description: "Vaciar la Pila.",
        estructura: "clean();",
        ejemplo: "clean();",
      },
    ],
  },
  cola: {
    buttons: [
      {
        title: "enqueue",
        description: "Agregar un elemento a la Cola.",
        estructura: "enqueue(valor);",
        ejemplo: "enqueue(1);",
      },
      {
        title: "dequeue",
        description: "Retirar el primer elemento que fue insertado en la Cola.",
        estructura: "dequeue();",
        ejemplo: "dequeue();",
      },
      {
        title: "getFront",
        description: "Obtener el primer elemento que fue insertado en la Cola.",
        estructura: "getFront();",
        ejemplo: "getFront();",
      },
      {
        title: "getRear",
        description: "Obtener el último elemento que fue insertado en la Cola.",
        estructura: "getRear();",
        ejemplo: "getRear();",
      },
      {
        title: "clean",
        description: "Vaciar la cola",
        estructura: "clean();",
        ejemplo: "clean();",
      },
    ],
  },
  cola_de_prioridad: {
    buttons: [
      {
        title: "enqueue",
        description: "Agregar un elemento a la Cola.",
        estructura: "enqueue(valor, prioridad);",
        ejemplo: "enqueue(1, 1);",
      },
      {
        title: "dequeue",
        description: "Retirar el primer elemento que fue insertado en la Cola.",
        estructura: "dequeue();",
        ejemplo: "dequeue();",
      },
      {
        title: "getFront",
        description: "Obtener el primer elemento que fue insertado en la Cola.",
        estructura: "getFront();",
        ejemplo: "getFront();",
      },
      {
        title: "getRear",
        description: "Obtener el último elemento que fue insertado en la Cola.",
        estructura: "getRear();",
        ejemplo: "getRear();",
      },
      {
        title: "clean",
        description: "Vaciar la cola",
        estructura: "clean();",
        ejemplo: "clean();",
      },
    ],
  },
  lista_simple: {
    buttons: [
      {
        title: "create",
        description: "Crear una lista vacía o con un valor inicial",
        estructura: "create(valor);",
        ejemplo: "create(1);",
      },
      {
        title: "insertFirst",
        description: "Insertar al inicio de la Lista.",
        estructura: "insertFirst(valor);",
        ejemplo: "insertFirst(1);",
      },
      {
        title: "insertLast",
        description: "Insertar al final de la Lista.",
        estructura: "insertLast(valor);",
        ejemplo: "insertLast(1);",
      },
      {
        title: "insertSorted",
        description: "Insertar de manera Ordenada desde la cabeza de la Lista.",
        estructura: "insertSorted(posición,valor);",
        ejemplo: "insertSorted(2,1);",
      },
      {
        title: "delete",
        description: "Eliminar un elemento de la Lista dada una posición..",
        estructura: "delete(posicion);",
        ejemplo: "delete(1);",
      },
      {
        title: "get",
        description: "Buscar el elemento que se encuentre en una posicion dada.",
        estructura: "get(posicion);",
        ejemplo: "get(1);",
      },
      {
        title: "set",
        description: "Actualizar el elemento que se encuentre en una posición dada.",
        estructura: "set(posicion,nuevoValor);",
        ejemplo: "set(1,5);",
      },
      {
        title: "clean",
        description: "Borra la lista simple",
        estructura: "clean();",
        ejemplo: "clean();",
      },
      {
        title: "traverse",
        description: "Recorrer la lista",
        estructura: "traverse();",
        ejemplo: "traverse();",
      },
    ],
  },
  lista_doble: {
    buttons: [
      {
        title: "create",
        description: "Crear una lista vacía o con un valor inicial",
        estructura: "create(valor);",
        ejemplo: "create(1);",
      },
      {
        title: "insertFirst",
        description: "Insertar al inicio de la Lista.",
        estructura: "insertFirst(valor);",
        ejemplo: "insertFirst(1);",
      },
      {
        title: "insertLast",
        description: "Insertar al final de la Lista.",
        estructura: "insertLast(valor);",
        ejemplo: "insertLast(1);",
      },
      {
        title: "insertSorted",
        description: "Insertar de manera Ordenada desde la cabeza de la Lista.",
        estructura: "insertSorted(posición,valor);",
        ejemplo: "insertSorted(2,1);",
      },
      {
        title: "delete",
        description: "Eliminar un elemento de la Lista dada una posición..",
        estructura: "delete(posicion);",
        ejemplo: "delete(1);",
      },
      {
        title: "get",
        description: "Buscar el elemento que se encuentre en una posicion dada.",
        estructura: "get(posicion);",
        ejemplo: "get(1);",
      },
      {
        title: "set",
        description: "Actualizar el elemento que se encuentre en una posición dada.",
        estructura: "set(posicion,nuevoValor);",
        ejemplo: "set(1,5);",
      },
      {
        title: "clean",
        description: "Borra la lista simple",
        estructura: "clean();",
        ejemplo: "clean();",
      },
      {
        title: "traverseForward",
        description: "Recorrer la lista hacia adelante",
        estructura: "traverseForward();",
        ejemplo: "traverseForward();",
      },
      {
        title: "traverseBackward",
        description: "Recorrer la lista hacia atrás",
        estructura: "traverseBackward();",
        ejemplo: "traverseBackward();",
      },
    ],
  },
  lista_circular: {
    buttons: [
      {
        title: "create",
        description: "Crear una lista vacía o con un valor inicial",
        estructura: "create(valor);",
        ejemplo: "create(1);",
      },
      {
        title: "insertFirst",
        description: "Insertar al inicio de la Lista.",
        estructura: "insertFirst(valor);",
        ejemplo: "insertFirst(1);",
      },
      {
        title: "insertLast",
        description: "Insertar al final de la Lista.",
        estructura: "insertLast(valor);",
        ejemplo: "insertLast(1);",
      },
      {
        title: "insertSorted",
        description: "Insertar de manera Ordenada desde la cabeza de la Lista.",
        estructura: "insertSorted(posición,valor);",
        ejemplo: "insertSorted(2,1);",
      },
      {
        title: "delete",
        description: "Eliminar un elemento de la Lista dada una posición..",
        estructura: "delete(posicion);",
        ejemplo: "delete(1);",
      },
      {
        title: "get",
        description: "Buscar el elemento que se encuentre en una posicion dada.",
        estructura: "get(posicion);",
        ejemplo: "get(1);",
      },
      {
        title: "set",
        description: "Actualizar el elemento que se encuentre en una posición dada.",
        estructura: "set(posicion,nuevoValor);",
        ejemplo: "set(1,5);",
      },
      {
        title: "clean",
        description: "Borra la lista simple",
        estructura: "clean();",
        ejemplo: "clean();",
      },
      {
        title: "traverse",
        description: "Recorrer la lista",
        estructura: "traverse();",
        ejemplo: "traverse();",
      },
    ],
  },
  lista_circular_doble: {
    buttons: [
      {
        title: "create",
        description: "Crear una lista vacía o con un valor inicial",
        estructura: "create(valor);",
        ejemplo: "create(1);",
      },
      {
        title: "insertFirst",
        description: "Insertar al inicio de la Lista.",
        estructura: "insertFirst(valor);",
        ejemplo: "insertFirst(1);",
      },
      {
        title: "insertLast",
        description: "Insertar al final de la Lista.",
        estructura: "insertLast(valor);",
        ejemplo: "insertLast(1);",
      },
      {
        title: "insertSorted",
        description: "Insertar de manera Ordenada desde la cabeza de la Lista.",
        estructura: "insertSorted(posición,valor);",
        ejemplo: "insertSorted(2,1);",
      },
      {
        title: "delete",
        description: "Eliminar un elemento de la Lista dada una posición..",
        estructura: "delete(posicion);",
        ejemplo: "delete(1);",
      },
      {
        title: "get",
        description: "Buscar el elemento que se encuentre en una posicion dada.",
        estructura: "get(posicion);",
        ejemplo: "get(1);",
      },
      {
        title: "set",
        description: "Actualizar el elemento que se encuentre en una posición dada.",
        estructura: "set(posicion,nuevoValor);",
        ejemplo: "set(1,5);",
      },
      {
        title: "clean",
        description: "Borra la lista simple",
        estructura: "clean();",
        ejemplo: "clean();",
      },
      {
        title: "traverseForward",
        description: "Recorrer la lista hacia adelante",
        estructura: "traverseForward();",
        ejemplo: "traverseForward();",
      },
      {
        title: "traverseBackward",
        description: "Recorrer la lista hacia atrás",
        estructura: "traverseBackward();",
        ejemplo: "traverseBackward();",
      },
    ],
  },
  tabla_hash: {
    buttons: [
      {
        title: "create",
        description: "Crear una tabla hash designando la cantidad de slots especificos.",
        estructura: "create(cantidadSlots);",
        ejemplo: "create(30);",
      },
      {
        title: "put",
        description: "Insertar o actualizar un elemento con clave y valor",
        estructura: "put(clave,valor);",
        ejemplo: "put('nombre',1);",
      },
      {
        title: "remove",
        description: "Eliminar un elemento por su clave",
        estructura: "remove(clave);",
        ejemplo: "remove('nombre');",
      },
      {
        title: "get",
        description: "Buscar un elemento por su clave",
        estructura: "get(clave);",
        ejemplo: "get('nombre');",
      },
      {
        title: "containsKey",
        description: "Verificar si una clave existe",
        estructura: "containsKey(clave);",
        ejemplo: "containsKey('nombre');",
      },
      {
        title: "clean",
        description: "Borrar la tabla hash",
        estructura: "clean();",
        ejemplo: "clean();",
      },
      {
        title: "values",
        description: "Recorrer todos los elementos(valores)",
        estructura: "values()();",
        ejemplo: "values();",
      },
    ],
  },

  bst: {
    buttons: [
      {
        title: "insert",
        description: "Insertar un nodo en el BST",
        estructura: "insert(valor);",
        ejemplo: "insert(1);",
      },
      {
        title: "delete",
        description: "Eliminar un nodo del BST",
        estructura: "delete(valor);",
        ejemplo: "delete(1);",
      },
      {
        title: "search",
        description: "Buscar un nodo en el BST",
        estructura: "search(valor);",
        ejemplo: "search(1);",
      },
      {
        title: "traverse",
        description: "Recorrer el BST en diferentes órdenes",
        estructura: "traverse(nombreOrden);",
        ejemplo: "traverse('inorder'); , traverse('preorder'); , traverse('postorder');",
      },
      {
        title: "findMin",
        description: "Encontrar el mínimo",
        estructura: "findMin();",
        ejemplo: "findMin();",
      },
      {
        title: "findMax",
        description: "Encontrar el máximo",
        estructura: "findMax();",
        ejemplo: "findMax();",
      },
      {
        title: "clean",
        description: "Borrar el BST",
        estructura: "clean();",
        ejemplo: "clean();",
      },
    ],
  },
  avl: {
    buttons: [
      {
        title: "insert",
        description: "Insertar un nodo en el AVL",
        estructura: "insert(valor);",
        ejemplo: "insert(1);",
      },
      {
        title: "delete",
        description: "Eliminar un nodo del AVL",
        estructura: "delete(valor);",
        ejemplo: "delete(1);",
      },
      {
        title: "search",
        description: "Buscar un nodo en el AVL",
        estructura: "search(valor);",
        ejemplo: "search(1);",
      },
      {
        title: "traverse",
        description: "Recorrer el AVL en diferentes órdenes",
        estructura: "traverse(nombreOrden);",
        ejemplo: "traverse('inorder'); , traverse('preorder'); , traverse('postorder');",
      },
      {
        title: "findMin",
        description: "Encontrar el mínimo",
        estructura: "findMin();",
        ejemplo: "findMin();",
      },
      {
        title: "findMax",
        description: "Encontrar el máximo",
        estructura: "findMax();",
        ejemplo: "findMax();",
      },
      {
        title: "balance",
        description: "Balancear el árbol AVL",
        estructura: "balance();",
        ejemplo: "balance();",
      },
      {
        title: "clean",
        description: "Borrar el AVL",
        estructura: "clean();",
        ejemplo: "clean();",
      },
    ],
  },
  rojinegro: {
    buttons: [
      {
        title: "insert",
        description: "Insertar un nodo en el árbol Rojo-Negro",
        estructura: "insert(valor);",
        ejemplo: "insert(1);",
      },
      {
        title: "delete",
        description: "Eliminar un nodo del árbol Rojo-Negro",
        estructura: "delete(valor);",
        ejemplo: "delete(1);",
      },
      {
        title: "search",
        description: "Buscar un nodo en el árbol Rojo-Negro",
        estructura: "search(valor);",
        ejemplo: "search(1);",
      },
      {
        title: "traverse",
        description: "Recorrer el árbol Rojo-Negro",
        estructura: "traverse(nombreOrden);",
        ejemplo: "traverse('inorder'); , traverse('preorder'); , traverse('postorder');",
      },
      {
        title: "findMin",
        description: "Encontrar el mínimo",
        estructura: "findMin();",
        ejemplo: "findMin();",
      },
      {
        title: "findMax",
        description: "Encontrar el máximo",
        estructura: "findMax();",
        ejemplo: "findMax();",
      },
      {
        title: "clean",
        description: "Borrar el árbol Rojo-Negro",
        estructura: "clean();",
        ejemplo: "clean();",
      },
    ],
  },
  splay: {
    buttons: [
      {
        title: "insert",
        description: "Insertar un nodo en el árbol Splay",
        estructura: "insert(valor);",
        ejemplo: "insert(1);",
      },
      {
        title: "delete",
        description: "Eliminar un nodo del árbol Splay",
        estructura: "delete(valor);",
        ejemplo: "delete(1);",
      },
      {
        title: "search",
        description: "Buscar un nodo en el árbol Splay",
        estructura: "search(valor);",
        ejemplo: "search(1);",
      },
      {
        title: "splay",
        description: "Realizar la operación Splay",
        estructura: "splay(valor);",
        ejemplo: "splay(1);",
      },
      {
        title: "clean",
        description: "Borrar el árbol Splay",
        estructura: "clean();",
        ejemplo: "clean();",
      },
    ],
  },
  heap: {
    buttons: [
      {
        title: "insert",
        description: "Insertar un elemento en el Heap",
        estructura: "insert(valor);",
        ejemplo: "insert(1);",
      },
      {
        title: "delete",
        description: "Eliminar un elemento del Heap",
        estructura: "delete(valor);",
        ejemplo: "delete(1);",
      },
      {
        title: "extractMin",
        description: "Extraer el mínimo del Heap",
        estructura: "extractMin();",
        ejemplo: "extractMin();",
      },
      {
        title: "extractMax",
        description: "Extraer el máximo del Heap",
        estructura: "extractMax();",
        ejemplo: "extractMax();",
      },
      {
        title: "heapify",
        description: "Aplicar Heapify",
        estructura: "heapify();",
        ejemplo: "heapify();",
      },
      {
        title: "clean",
        description: "Borrar el Heap",
        estructura: "clean();",
        ejemplo: "clean();",
      },
    ],
  },

  arboleneario: {
    buttons: [
      {
        title: "insert",
        description: "Insertar un nodo en el árbol N-ario",
        estructura: "insert(valorPadre,nuevoValor);",
        ejemplo: "insert(5,1);",
      },
      {
        title: "delete",
        description: "Eliminar un nodo del árbol N-ario",
        estructura: "delete(valor);",
        ejemplo: "delete(1);",
      },
      {
        title: "search",
        description: "Buscar un nodo en el árbol N-ario",
        estructura: "search(valor);",
        ejemplo: "search(1);",
      },
      {
        title: "traverse",
        description: "Recorrer el árbol N-ario en diferentes órdenes",
        estructura: "traverse(nombreOrden);",
        ejemplo: "traverse('inorder'); , traverse('preorder'); , traverse('postorder');",
      },
      {
        title: "clean",
        description: "Borrar el árbol N-ario",
        estructura: "clean();",
        ejemplo: "clean();",
      },
    ],
  },
  arbolb: {
    buttons: [
      {
        title: "insert",
        description: "Insertar un nodo en el árbol B",
        estructura: "insert(valor);",
        ejemplo: "insert(1);",
      },
      {
        title: "delete",
        description: "Eliminar un nodo del árbol B",
        estructura: "delete(valor);",
        ejemplo: "delete(1);",
      },
      {
        title: "search",
        description: "Buscar un nodo en el árbol B",
        estructura: "search(valor);",
        ejemplo: "search(1);",
      },
      {
        title: "traverse",
        description: "Recorrer el Árbol B en diferentes órdenes",
        estructura: "traverse(nombreOrden);",
        ejemplo: "traverse('inorder'); , traverse('preorder'); , traverse('postorder');",
      },
      {
        title: "clean",
        description: "Borrar el árbol B",
        estructura: "clean();",
        ejemplo: "clean();",
      },
    ],
  },
  arbolbplus: {
    buttons: [
      {
        title: "insert",
        description: "Insertar un nodo en el árbol B+",
        estructura: "insert(valor);",
        ejemplo: "insert(1);",
      },
      {
        title: "delete",
        description: "Eliminar un nodo del árbol B+",
        estructura: "delete(valor);",
        ejemplo: "delete(1);",
      },
      {
        title: "search",
        description: "Buscar un nodo en el árbol B+",
        estructura: "search(valor);",
        ejemplo: "search(1);",
      },
      {
        title: "traverse",
        description: "Recorrer el Árbol B+ en diferentes órdenes",
        estructura: "traverse(nombreOrden);",
        ejemplo: "traverse('inorder'); , traverse('preorder'); , traverse('postorder');",
      },
      {
        title: "clean",
        description: "Borrar el árbol B+",
        estructura: "clean();",
        ejemplo: "clean();",
      },
    ],
  },

  memoria: {
    buttons: [
      {
        title: "Insert",
        description:
          "Insertar una variable primitiva, un array o un objeto en memoria.",
        estructura: "insert tipo nombre = valor;",
        ejemplo: "insert int edad = 25;",
      },
      {
        title: "Delete Address",
        description:
          "Eliminar una variable, array u objeto completo por su dirección de memoria.",
        estructura: "delete address <direccion>",
        ejemplo: "delete address 4x001",
      },
      {
        title: "Clear Memory",
        description: "Borrar completamente la memoria RAM simulada.",
        estructura: "clear memory",
        ejemplo: "clear memory",
      },
      {
        title: "Convert Type",
        description: "Convertir una variable primitiva a otro tipo compatible.",
        estructura: "convert address <direccion> to <nuevotipo>",
        ejemplo: "convert address 4x001 to long",
      },
      {
        title: "Size Address",
        description:
          "Mostrar el tamaño en memoria (bits o bytes) de una variable, array u objeto.",
        estructura: "size address <direccion>",
        ejemplo: "size address 5x002",
      },
      {
        title: "update Value",
        description: "Actualizar el valor de una variable o array existente.",
        estructura: "update address <direccion> value <nuevovalor>",
        ejemplo: "update address 4x003 value 99",
      },
    ],
  },
};
