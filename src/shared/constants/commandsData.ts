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
        description:
          "Actualizar el valor de un elemento existente en la Secuencia",
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
        description:
          "Obtener el elemento que se encuentra en el tope de la Pila.",
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
        title: "clean",
        description: "Vaciar la cola",
        estructura: "clean();",
        ejemplo: "clean();",
      },
    ],
  },
  "cola de prioridad": {
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
        description:
          "Buscar el elemento que se encuentre en una posicion dada.",
        estructura: "get(posicion);",
        ejemplo: "get(1);",
      },
      {
        title: "set",
        description:
          "Actualizar el elemento que se encuentre en una posición dada.",
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
        description:
          "Buscar el elemento que se encuentre en una posicion dada.",
        estructura: "get(posicion);",
        ejemplo: "get(1);",
      },
      {
        title: "set",
        description:
          "Actualizar el elemento que se encuentre en una posición dada.",
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
        description:
          "Buscar el elemento que se encuentre en una posicion dada.",
        estructura: "get(posicion);",
        ejemplo: "get(1);",
      },
      {
        title: "set",
        description:
          "Actualizar el elemento que se encuentre en una posición dada.",
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
        description:
          "Buscar el elemento que se encuentre en una posicion dada.",
        estructura: "get(posicion);",
        ejemplo: "get(1);",
      },
      {
        title: "set",
        description:
          "Actualizar el elemento que se encuentre en una posición dada.",
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
        description: "Crear la tabla hash con N slots",
        estructura: "create(n);",
        ejemplo: "create(10);",
      },
      {
        title: "set",
        description: "Insertar o actualizar un par clave→valor",
        estructura: "set(clave,valor);",
        ejemplo: "set(25,100);",
      },
      {
        title: "get",
        description: "Recuperar el valor asociado a una clave",
        estructura: "get(clave);",
        ejemplo: "get(25);",
      },
      {
        title: "delete",
        description: "Eliminar un par por su clave",
        estructura: "delete(clave);",
        ejemplo: "delete(25);",
      },
      {
        title: "clean",
        description: "Vaciar la tabla hash",
        estructura: "clean();",
        ejemplo: "clean();",
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
        ejemplo:
          "traverse('inorder'); , traverse('preorder'); , traverse('postorder');",
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
        ejemplo:
          "traverse('inorder'); , traverse('preorder'); , traverse('postorder');",
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
        ejemplo:
          "traverse('inorder'); , traverse('preorder'); , traverse('postorder');",
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
        ejemplo:
          "traverse('inorder'); , traverse('preorder'); , traverse('postorder');",
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
        ejemplo:
          "traverse('inorder'); , traverse('preorder'); , traverse('postorder');",
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
        ejemplo:
          "traverse('inorder'); , traverse('preorder'); , traverse('postorder');",
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
        title: "Declarar",
        description:
          "Permite declarar variables primitivas, arrays u objetos en la memoria de forma natural, al estilo de Java. Se debe respetar la sintaxis estricta, con exactamente un espacio entre cada token.\n" +
          "->Las declaraciones pueden incluir asignación (por ejemplo, 'int edad = 25;') o no (por ejemplo, 'int edad;'), en cuyo caso se asigna un valor por defecto según el tipo.\n" +
          "->Para arrays se utiliza la sintaxis: 'tipo[] nombre = {valor1,valor2,...};'.\n" +
          "->Para objetos: 'object nombre = new object( ... );'.",
        estructura:
          "Primitivo: tipo nombre = valor;   |   Sin asignación: tipo nombre;   |   Array: tipo[] nombre = {valor1,valor2,...};   |   Objeto: object nombre = new object( ... );",
        ejemplo:
          "-> int edad = 25;                            (Primitivo con asignación)\n" +
          "-> int edad;                                (Primitivo sin asignación, valor por defecto)\n" +
          "-> float temperatura = 36.7;                (Primitivo float)\n" +
          "-> int[] edades = {20, 30, 40, 50};         (Array de enteros)\n" +
          '-> string[] nombres = {"Ana", "Luis"};    (Array de Strings)\n' +
          "-> object persona = new object( int edad = 23; float deudas[] = {20, 30, 40, 50};);\n",
      },

      {
        title: "Delete Address",
        description:
          "Elimina la variable, array u objeto completo identificado por su dirección de memoria. Este comando es útil para limpiar o reasignar recursos en la simulación.",
        estructura: "delete address <direccion>",
        ejemplo: "delete address 4x001",
      },
      {
        title: "Clear Memory",
        description:
          "Borra por completo el contenido de la memoria simulada, reiniciando todos los registros, contadores y nombres globales.\n" +
          "Útil para comenzar de cero en una nueva sesión.",
        estructura: "clear memory",
        ejemplo: "clear memory",
      },
      {
        title: "Convert Type",
        description:
          "Convierte una variable primitiva a otro tipo compatible. Este comando se asegura de que la conversión sea segura (por ejemplo, de int a long) y evita pérdida de datos.\n" +
          "Se especifica la dirección de la variable y el nuevo tipo deseado.",
        estructura: "convert address <direccion> to <nuevotipo>",
        ejemplo: "convert address 4x001 to long",
      },
      {
        title: "Size Address",
        description:
          "Muestra el tamaño en memoria (expresado en bits o bytes) que ocupa la variable, array u objeto en una dirección específica.\n" +
          "Esto ayuda a visualizar el uso de recursos de la simulación.",
        estructura: "size address <direccion>",
        ejemplo: "size address 5x002",
      },
      {
        title: "Update Value",
        description:
          "Permite modificar el valor almacenado en una dirección de memoria.\n" +
          "Ideal para cambiar el contenido de una variable o un array ya declarado.\n" +
          "El comando interpreta el nuevo valor y actualiza la estructura correspondiente.",
        estructura: "update address <direccion> value <nuevovalor>",
        ejemplo: "update address 4x003 value 99",
      },
      {
        title: "Address Of",
        description:
          "Retorna la dirección de memoria de una variable especificada por su nombre.\n" +
          "Muy útil para encontrar rápidamente dónde se almacena un dato en la simulación.",
        estructura: "address of <nombre_variable>",
        ejemplo: "address of edad",
      },
      {
        title: "Type Address",
        description:
          "Muestra el tipo de dato de la variable, array u objeto almacenado en la dirección especificada.\n" +
          "Este comando permite verificar qué tipo de dato hay en una dirección determinada.",
        estructura: "type address <direccion>",
        ejemplo: "type address 4x001",
      },
      {
        title: "Help",
        description:
          "Muestra una lista de todos los comandos disponibles y sus respectivas sintaxis.Es la opción ideal para recordar rápidamente cómo usar el simulador.\n" +
          "Comandos:\n" +
          "->Declarar: Permite definir variables, arrays u objetos (e.g., int edad = 25;).\n" +
          "->Delete Address: Elimina la entrada en memoria por su dirección.\n" +
          "->Clear Memory: Limpia toda la memoria simulada.\n" +
          "->Convert Type: Cambia el tipo de una variable primitiva.\n" +
          "->Size Address: Muestra el tamaño en memoria de la entrada.\n" +
          "->Update Value: Actualiza el valor de una dirección dada.\n" +
          "->Address Of: Obtiene la dirección de una variable por su nombre.\n" +
          "->Type Address: Muestra el tipo del valor en la dirección especificada.",
        estructura: "help",
        ejemplo: "help",
      },
      {
        title: "CLS",
        description: "Limpia el contenido de la consola.\n",
        estructura: "cls",
        ejemplo: "cls",
      },
    ],
  },
};
