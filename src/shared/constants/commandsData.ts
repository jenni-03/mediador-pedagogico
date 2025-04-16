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
  listasimple: {
    buttons: [
      {
        title: "Create",
        description: "Crear una lista vacía o con un valor inicial...",
        estructura: "Create valor",
        ejemplo: "Create 1",
      },
      {
        title: "InsertFirst",
        description: "Insertar al inicio...",
        estructura: "InsertFirst valor",
        ejemplo: "InsertFirst 1",
      },
      {
        title: "InsertLast",
        description: "Insertar al final...",
        estructura: "InsertLast valor",
        ejemplo: "InsertLast 1",
      },
      {
        title: "InsertAt",
        description: "Insertar en una posición específica...",
        estructura: "InsertAt valor",
        ejemplo: "InsertAt 1",
      },
      {
        title: "Delete",
        description: "Eliminar un nodo...",
        estructura: "Delete valor",
        ejemplo: "Delete 1",
      },
      {
        title: "Search",
        description: "Buscar un nodo...",
        estructura: "Search valor",
        ejemplo: "Search 1",
      },
      {
        title: "update",
        description: "Actualizar un nodo...",
        estructura: "update valor",
        ejemplo: "update 1",
      },
      {
        title: "clean",
        description: "Borrar la lista...",
        estructura: "clean",
        ejemplo: "clean",
      },
      {
        title: "Traverse",
        description: "Recorrer la lista...",
        estructura: "Traverse valor",
        ejemplo: "Traverse 1",
      },
    ],
  },
  listadoble: {
    buttons: [
      {
        title: "Create",
        description: "Crear una lista doblemente enlazada...",
        estructura: "Create valor",
        ejemplo: "Create 1",
      },
      {
        title: "InsertFirst",
        description: "Insertar al inicio...",
        estructura: "InsertFirst valor",
        ejemplo: "InsertFirst 1",
      },
      {
        title: "InsertLast",
        description: "Insertar al final...",
        estructura: "InsertLast valor",
        ejemplo: "InsertLast 1",
      },
      {
        title: "InsertAt",
        description: "Insertar en una posición específica...",
        estructura: "InsertAt valor",
        ejemplo: "InsertAt 1",
      },
      {
        title: "Delete",
        description: "Eliminar un nodo...",
        estructura: "Delete valor",
        ejemplo: "Delete 1",
      },
      {
        title: "Search",
        description: "Buscar un nodo...",
        estructura: "Search valor",
        ejemplo: "Search 1",
      },
      {
        title: "update",
        description: "Actualizar un nodo...",
        estructura: "update valor",
        ejemplo: "update 1",
      },
      {
        title: "clean",
        description: "Borrar la lista...",
        estructura: "clean",
        ejemplo: "clean",
      },
      {
        title: "TraverseF",
        description: "Recorrer la lista hacia adelante...",
        estructura: "TraverseF valor",
        ejemplo: "TraverseF 1",
      },
      {
        title: "TraverseB",
        description: "Recorrer la lista hacia atrás...",
        estructura: "TraverseB valor",
        ejemplo: "TraverseB 1",
      },
    ],
  },
  listacircular: {
    buttons: [
      {
        title: "Create",
        description: "Crear una lista circular...",
        estructura: "Create valor",
        ejemplo: "Create 1",
      },
      {
        title: "InsertFirst",
        description: "Insertar al inicio...",
        estructura: "InsertFirst valor",
        ejemplo: "InsertFirst 1",
      },
      {
        title: "InsertLast",
        description: "Insertar al final...",
        estructura: "InsertLast valor",
        ejemplo: "InsertLast 1",
      },
      {
        title: "InsertAt",
        description: "Insertar en una posición específica...",
        estructura: "InsertAt valor",
        ejemplo: "InsertAt 1",
      },
      {
        title: "Delete",
        description: "Eliminar un nodo...",
        estructura: "Delete valor",
        ejemplo: "Delete 1",
      },
      {
        title: "Search",
        description: "Buscar un nodo...",
        estructura: "Search valor",
        ejemplo: "Search 1",
      },
      {
        title: "update",
        description: "Actualizar un nodo...",
        estructura: "update valor",
        ejemplo: "update 1",
      },
      {
        title: "clean",
        description: "Borrar la lista...",
        estructura: "clean",
        ejemplo: "clean",
      },
      {
        title: "Traverse",
        description: "Recorrer la lista...",
        estructura: "Traverse valor",
        ejemplo: "Traverse 1",
      },
    ],
  },
  listacirculardoble: {
    buttons: [
      {
        title: "Create",
        description: "Crear una lista circular doblemente enlazada...",
        estructura: "Create valor",
        ejemplo: "Create 1",
      },
      {
        title: "InsertFirst",
        description: "Insertar al inicio...",
        estructura: "InsertFirst valor",
        ejemplo: "InsertFirst 1",
      },
      {
        title: "InsertLast",
        description: "Insertar al final...",
        estructura: "InsertLast valor",
        ejemplo: "InsertLast 1",
      },
      {
        title: "InsertAt",
        description: "Insertar en una posición específica...",
        estructura: "InsertAt valor",
        ejemplo: "InsertAt 1",
      },
      {
        title: "Delete",
        description: "Eliminar un nodo...",
        estructura: "Delete valor",
        ejemplo: "Delete 1",
      },
      {
        title: "Search",
        description: "Buscar un nodo...",
        estructura: "Search valor",
        ejemplo: "Search 1",
      },
      {
        title: "update",
        description: "Actualizar un nodo...",
        estructura: "update valor",
        ejemplo: "update 1",
      },
      {
        title: "clean",
        description: "Borrar la lista...",
        estructura: "clean",
        ejemplo: "clean",
      },
      {
        title: "TraverseF",
        description: "Recorrer la lista hacia adelante...",
        estructura: "TraverseF valor",
        ejemplo: "TraverseF 1",
      },
      {
        title: "TraverseB",
        description: "Recorrer la lista hacia atrás...",
        estructura: "TraverseB valor",
        ejemplo: "TraverseB 1",
      },
    ],
  },
  pila: {
    buttons: [
      {
        title: "Push",
        description: "Apilar un elemento...",
        estructura: "Push valor",
        ejemplo: "Push 1",
      },
      {
        title: "Pop",
        description: "Desapilar un elemento...",
        estructura: "Pop valor",
        ejemplo: "Pop 1",
      },
      {
        title: "Top",
        description: "Obtener el elemento superior...",
        estructura: "Top valor",
        ejemplo: "Top 1",
      },
      {
        title: "clean",
        description: "Vaciar la pila...",
        estructura: "clean",
        ejemplo: "clean",
      },
    ],
  },
  cola: {
    buttons: [
      {
        title: "Enqueue",
        description: "Encolar un elemento...",
        estructura: "Enqueue valor",
        ejemplo: "Enqueue 1",
      },
      {
        title: "Dequeue",
        description: "Desencolar un elemento...",
        estructura: "Dequeue valor",
        ejemplo: "Dequeue 1",
      },
      {
        title: "Front",
        description: "Obtener el primer elemento...",
        estructura: "Front valor",
        ejemplo: "Front 1",
      },
      {
        title: "Rear",
        description: "Obtener el último elemento...",
        estructura: "Rear valor",
        ejemplo: "Rear 1",
      },
      {
        title: "clean",
        description: "Vaciar la cola...",
        estructura: "clean",
        ejemplo: "clean",
      },
    ],
  },
  coladeprioridad: {
    buttons: [
      {
        title: "Enqueue",
        description: "Encolar un elemento con prioridad...",
        estructura: "Enqueue valor",
        ejemplo: "Enqueue 1",
      },
      {
        title: "Dequeue",
        description: "Desencolar el elemento con mayor prioridad...",
        estructura: "Dequeue valor",
        ejemplo: "Dequeue 1",
      },
      {
        title: "Front",
        description: "Obtener el primer elemento...",
        estructura: "Front valor",
        ejemplo: "Front 1",
      },
      {
        title: "Rear",
        description: "Obtener el último elemento...",
        estructura: "Rear valor",
        ejemplo: "Rear 1",
      },
      {
        title: "clean",
        description: "Vaciar la cola de prioridad...",
        estructura: "clean",
        ejemplo: "clean",
      },
    ],
  },
  tablahash: {
    buttons: [
      {
        title: "Insert",
        description: "Insertar un elemento con clave y valor...",
        estructura: "Insert valor",
        ejemplo: "Insert 1",
      },
      {
        title: "update",
        description: "Actualizar un valor existente...",
        estructura: "update valor",
        ejemplo: "update 1",
      },
      {
        title: "Delete",
        description: "Eliminar un elemento por su clave...",
        estructura: "Delete valor",
        ejemplo: "Delete 1",
      },
      {
        title: "Search",
        description: "Buscar un valor por su clave...",
        estructura: "Search valor",
        ejemplo: "Search 1",
      },
      {
        title: "Contains",
        description: "Verificar si una clave existe...",
        estructura: "Contains valor",
        ejemplo: "Contains 1",
      },
      {
        title: "Resize",
        description: "Redimensionar la tabla hash...",
        estructura: "Resize valor",
        ejemplo: "Resize 1",
      },
      {
        title: "clean",
        description: "Borrar la tabla hash...",
        estructura: "clean",
        ejemplo: "clean",
      },
      {
        title: "Traverse",
        description: "Recorrer todos los elementos...",
        estructura: "Traverse valor",
        ejemplo: "Traverse 1",
      },
    ],
  },

  bst: {
    buttons: [
      {
        title: "Insert",
        description: "Insertar un nodo en el BST...",
        estructura: "Insert valor",
        ejemplo: "Insert 1",
      },
      {
        title: "Delete",
        description: "Eliminar un nodo del BST...",
        estructura: "Delete valor",
        ejemplo: "Delete 1",
      },
      {
        title: "Search",
        description: "Buscar un nodo en el BST...",
        estructura: "Search valor",
        ejemplo: "Search 1",
      },
      {
        title: "Traverse",
        description: "Recorrer el BST en diferentes órdenes...",
        estructura: "Traverse valor",
        ejemplo: "Traverse 1",
      },
      {
        title: "FindMin",
        description: "Encontrar el mínimo...",
        estructura: "FindMin valor",
        ejemplo: "FindMin 1",
      },
      {
        title: "FindMax",
        description: "Encontrar el máximo...",
        estructura: "FindMax valor",
        ejemplo: "FindMax 1",
      },
      {
        title: "clean",
        description: "Borrar el BST...",
        estructura: "clean",
        ejemplo: "clean",
      },
    ],
  },

  avl: {
    buttons: [
      {
        title: "Insert",
        description: "Insertar un nodo en el AVL...",
        estructura: "Insert valor",
        ejemplo: "Insert 1",
      },
      {
        title: "Delete",
        description: "Eliminar un nodo del AVL...",
        estructura: "Delete valor",
        ejemplo: "Delete 1",
      },
      {
        title: "Search",
        description: "Buscar un nodo en el AVL...",
        estructura: "Search valor",
        ejemplo: "Search 1",
      },
      {
        title: "Traverse",
        description: "Recorrer el AVL en diferentes órdenes...",
        estructura: "Traverse valor",
        ejemplo: "Traverse 1",
      },
      {
        title: "FindMin",
        description: "Encontrar el mínimo...",
        estructura: "FindMin valor",
        ejemplo: "FindMin 1",
      },
      {
        title: "FindMax",
        description: "Encontrar el máximo...",
        estructura: "FindMax valor",
        ejemplo: "FindMax 1",
      },
      {
        title: "Balance",
        description: "Balancear el árbol AVL...",
        estructura: "Balance valor",
        ejemplo: "Balance 1",
      },
      {
        title: "clean",
        description: "Borrar el AVL...",
        estructura: "clean",
        ejemplo: "clean",
      },
    ],
  },

  rojinegro: {
    buttons: [
      {
        title: "Insert",
        description: "Insertar un nodo en el árbol Rojo-Negro...",
        estructura: "Insert valor",
        ejemplo: "Insert 1",
      },
      {
        title: "Delete",
        description: "Eliminar un nodo del árbol Rojo-Negro...",
        estructura: "Delete valor",
        ejemplo: "Delete 1",
      },
      {
        title: "Search",
        description: "Buscar un nodo en el árbol Rojo-Negro...",
        estructura: "Search valor",
        ejemplo: "Search 1",
      },
      {
        title: "Traverse",
        description: "Recorrer el árbol Rojo-Negro...",
        estructura: "Traverse valor",
        ejemplo: "Traverse 1",
      },
      {
        title: "FindMin",
        description: "Encontrar el mínimo...",
        estructura: "FindMin valor",
        ejemplo: "FindMin 1",
      },
      {
        title: "FindMax",
        description: "Encontrar el máximo...",
        estructura: "FindMax valor",
        ejemplo: "FindMax 1",
      },
      {
        title: "clean",
        description: "Borrar el árbol Rojo-Negro...",
        estructura: "clean",
        ejemplo: "clean",
      },
    ],
  },

  splay: {
    buttons: [
      {
        title: "Insert",
        description: "Insertar un nodo en el árbol Splay...",
        estructura: "Insert valor",
        ejemplo: "Insert 1",
      },
      {
        title: "Delete",
        description: "Eliminar un nodo del árbol Splay...",
        estructura: "Delete valor",
        ejemplo: "Delete 1",
      },
      {
        title: "Search",
        description: "Buscar un nodo en el árbol Splay...",
        estructura: "Search valor",
        ejemplo: "Search 1",
      },
      {
        title: "Splay",
        description: "Realizar la operación Splay...",
        estructura: "Splay valor",
        ejemplo: "Splay 1",
      },
      {
        title: "clean",
        description: "Borrar el árbol Splay...",
        estructura: "clean",
        ejemplo: "clean",
      },
    ],
  },

  heap: {
    buttons: [
      {
        title: "Insert",
        description: "Insertar un elemento en el Heap...",
        estructura: "Insert valor",
        ejemplo: "Insert 1",
      },
      {
        title: "Delete",
        description: "Eliminar un elemento del Heap...",
        estructura: "Delete valor",
        ejemplo: "Delete 1",
      },
      {
        title: "ExtractMin",
        description: "Extraer el mínimo del Heap...",
        estructura: "ExtractMin valor",
        ejemplo: "ExtractMin 1",
      },
      {
        title: "ExtractMax",
        description: "Extraer el máximo del Heap...",
        estructura: "ExtractMax valor",
        ejemplo: "ExtractMax 1",
      },
      {
        title: "Heapify",
        description: "Aplicar Heapify...",
        estructura: "Heapify valor",
        ejemplo: "Heapify 1",
      },
      {
        title: "clean",
        description: "Borrar el Heap...",
        estructura: "clean",
        ejemplo: "clean",
      },
    ],
  },

  arboleneario: {
    buttons: [
      {
        title: "Insert",
        description: "Insertar un nodo en el árbol N-ario...",
        estructura: "Insert valor",
        ejemplo: "Insert 1",
      },
      {
        title: "Delete",
        description: "Eliminar un nodo del árbol N-ario...",
        estructura: "Delete valor",
        ejemplo: "Delete 1",
      },
      {
        title: "Search",
        description: "Buscar un nodo en el árbol N-ario...",
        estructura: "Search valor",
        ejemplo: "Search 1",
      },
      {
        title: "Traverse",
        description: "Recorrer el eneario en diferentes órdenes...",
        estructura: "Traverse valor",
        ejemplo: "Traverse 1",
      },
      {
        title: "clean",
        description: "Borrar el árbol N-ario...",
        estructura: "clean",
        ejemplo: "clean",
      },
    ],
  },

  arbolb: {
    buttons: [
      {
        title: "Insert",
        description: "Insertar un nodo en el árbol B...",
        estructura: "Insert valor",
        ejemplo: "Insert 1",
      },
      {
        title: "Delete",
        description: "Eliminar un nodo del árbol B...",
        estructura: "Delete valor",
        ejemplo: "Delete 1",
      },
      {
        title: "Search",
        description: "Buscar un nodo en el árbol B...",
        estructura: "Search valor",
        ejemplo: "Search 1",
      },
      {
        title: "Traverse",
        description: "Recorrer el Árbol b en diferentes órdenes...",
        estructura: "Traverse valor",
        ejemplo: "Traverse 1",
      },
      {
        title: "clean",
        description: "Borrar el árbol B...",
        estructura: "clean",
        ejemplo: "clean",
      },
    ],
  },

  arbolbplus: {
    buttons: [
      {
        title: "Insert",
        description: "Insertar un nodo en el árbol B+...",
        estructura: "Insert valor",
        ejemplo: "Insert 1",
      },
      {
        title: "Delete",
        description: "Eliminar un nodo del árbol B+...",
        estructura: "Delete valor",
        ejemplo: "Delete 1",
      },
      {
        title: "Search",
        description: "Buscar un nodo en el árbol B+...",
        estructura: "Search valor",
        ejemplo: "Search 1",
      },
      {
        title: "Traverse",
        description: "Recorrer el Árbol b+ en diferentes órdenes...",
        estructura: "Traverse valor",
        ejemplo: "Traverse 1",
      },
      {
        title: "clean",
        description: "Borrar el árbol B+...",
        estructura: "clean",
        ejemplo: "clean",
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
          "-> string[] nombres = {\"Ana\", \"Luis\"};    (Array de Strings)\n" +
          "-> object persona = new object( int edad = 23; float deudas[] = {20, 30, 40, 50};);\n"
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
        description:
          "Limpia el contenido de la consola.\n", 
        estructura: "cls",
        ejemplo: "cls",
      },
    ],
  },  
};
