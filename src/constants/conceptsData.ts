export const conceptosData: Record<string, any> = {
  1: {
    definicion: {
      descripcion: "Una secuencia es una colección ordenada de elementos almacenados en un orden específico.",
      caracteristicas: [
        "El orden de los elementos es importante.",
        "Puede ser implementada con arreglos o listas enlazadas.",
        "Se usa en programación dinámica y algoritmos de secuencias."
      ],
    },
    operaciones: {
      insertar: "Se puede agregar un elemento en cualquier posición de la secuencia.",
      editar: "Modificar un elemento requiere conocer su posición.",
      consultar: "Acceder a un elemento se hace mediante su índice.",
      eliminar: "Eliminar un elemento puede requerir un desplazamiento de los demás.",
    },
    complejidad: {
      analisis: "Las operaciones dependen de la implementación, con O(1) para acceso en arreglos y O(n) en listas enlazadas.",
    },
    tipo: "Estructura Lineal",
    nombre: "Secuencia"
  },
  2: {
    definicion: {
      descripcion: "Una lista simplemente enlazada es una colección de nodos donde cada nodo apunta al siguiente.",
      caracteristicas: [
        "Cada nodo tiene un dato y una referencia al siguiente nodo.",
        "Permite inserción y eliminación eficiente.",
        "El acceso a elementos es secuencial.",
      ],
    },
    operaciones: {
      insertar: "Para insertar un nodo, se ajusta la referencia del nodo anterior.",
      editar: "Modificar un nodo implica cambiar su valor sin alterar la estructura.",
      consultar: "Se recorre la lista hasta encontrar el nodo deseado.",
      eliminar: "Eliminar un nodo requiere actualizar la referencia del nodo anterior.",
    },
    complejidad: {
      analisis: "La búsqueda es O(n), la inserción y eliminación son O(1) si se tiene referencia previa.",
    },
    tipo: "Estructura Lineal",
    nombre: "Lista Simplemente Enlazada"
  },
  3: {
    definicion: {
      descripcion: "Una lista doblemente enlazada es una lista donde cada nodo tiene referencias al anterior y al siguiente.",
      caracteristicas: [
        "Cada nodo almacena un valor y dos referencias.",
        "Permite recorrido en ambos sentidos.",
        "Requiere más memoria que una lista simplemente enlazada.",
      ],
    },
    operaciones: {
      insertar: "Se modifica la referencia del nodo anterior y el siguiente.",
      editar: "Cambiar el valor del nodo es directo si se tiene su referencia.",
      consultar: "Se puede recorrer en ambos sentidos hasta encontrar el nodo.",
      eliminar: "Requiere ajustar las referencias de los nodos adyacentes.",
    },
    complejidad: {
      analisis: "Las operaciones básicas tienen una complejidad de O(1) si se tiene acceso directo al nodo.",
    },
    tipo: "Estructura Lineal",
    nombre: "Lista Doblemente Enlazada"
  },
  4: {
    definicion: {
      descripcion: "Una lista circular simplemente enlazada es una lista enlazada donde el último nodo apunta al primero.",
      caracteristicas: [
        "El último nodo se enlaza con el primero, formando un ciclo.",
        "Permite recorridos circulares sin necesidad de reiniciar el puntero.",
        "Usada en sistemas de planificación y estructuras en anillo.",
      ],
    },
    operaciones: {
      insertar: "Insertar un nodo requiere ajustar la referencia del último nodo.",
      editar: "El valor de un nodo se puede modificar sin afectar la estructura.",
      consultar: "Para buscar un nodo, se recorre la lista hasta completar un ciclo.",
      eliminar: "Eliminar un nodo requiere ajustar las referencias para mantener el ciclo.",
    },
    complejidad: {
      analisis: "El acceso es O(n), pero las inserciones y eliminaciones pueden ser O(1) con referencias adecuadas.",
    },
    tipo: "Estructura Lineal",
    nombre: "Lista Circular Simple"
  },
  5: {
    definicion: {
      descripcion: "Una lista circular simplemente enlazada es una lista enlazada donde el último nodo apunta al primero.",
      caracteristicas: [
        "El último nodo se enlaza con el primero, formando un ciclo.",
        "Permite recorridos circulares sin necesidad de reiniciar el puntero.",
        "Usada en sistemas de planificación y estructuras en anillo.",
      ],
    },
    operaciones: {
      insertar: "Insertar un nodo requiere ajustar la referencia del último nodo.",
      editar: "El valor de un nodo se puede modificar sin afectar la estructura.",
      consultar: "Para buscar un nodo, se recorre la lista hasta completar un ciclo.",
      eliminar: "Eliminar un nodo requiere ajustar las referencias para mantener el ciclo.",
    },
    complejidad: {
      analisis: "El acceso es O(n), pero las inserciones y eliminaciones pueden ser O(1) con referencias adecuadas.",
    },
    tipo: "Estructura Lineal",
    nombre: "Lista Circular Doble Enlazada"
  },
  6: {
    definicion: {
      descripcion: "Una pila es una estructura de datos tipo LIFO (Last In, First Out).",
      caracteristicas: [
        "Las inserciones y eliminaciones ocurren en un único extremo.",
        "Se utiliza en llamadas a funciones y algoritmos de retroceso.",
        "Las operaciones básicas son `push` y `pop`.",
      ],
    },
    operaciones: {
      insertar: "Push: Añadir un elemento en la cima de la pila.",
      editar: "No se permite edición directa de elementos intermedios.",
      consultar: "Peek: Ver el elemento superior sin eliminarlo.",
      eliminar: "Pop: Remover el elemento superior de la pila.",
    },
    complejidad: {
      analisis: "Todas las operaciones tienen una complejidad de O(1)."
    },
    tipo: "Estructura Lineal",
    nombre: "Pila"
  },
  7: {
    definicion: {
      descripcion: "Una cola es una estructura de datos lineal que sigue el principio FIFO (First In, First Out)...",
      caracteristicas: [
        "El primer elemento en entrar es el primero en salir.",
        "Permite operaciones de inserción (enqueue) y eliminación (dequeue).",
        "Se usa en sistemas de procesamiento de tareas y estructuras de buffer.",
      ],
    },
    operaciones: {
      insertar: "Para insertar un elemento en una cola, se coloca al final de la estructura...",
      editar: "No es común editar elementos en una cola, ya que su orden es importante...",
      consultar: "Consultar en una cola implica acceder al primer elemento sin eliminarlo...",
      eliminar: "Eliminar en una cola (dequeue) implica quitar el primer elemento de la estructura...",
    },
    complejidad: {
      analisis: "Las operaciones de inserción y eliminación son O(1), ya que se realizan en extremos fijos...",
    },
    tipo: "Estructura Lineal",
    nombre: "Cola",
  },
  8: {
    definicion: {
      descripcion: "Una cola de prioridad es una variante de la cola donde cada elemento tiene una prioridad asociada...",
      caracteristicas: [
        "Los elementos se procesan según su prioridad en lugar del orden de llegada.",
        "Puede implementarse con montículos (heaps) para optimizar la eficiencia.",
        "Se usa en algoritmos como Dijkstra y en sistemas de planificación de tareas.",
      ],
    },
    operaciones: {
      insertar: "Para insertar un elemento, se coloca en la posición adecuada según su prioridad...",
      editar: "Modificar la prioridad de un elemento puede requerir reorganizar la estructura...",
      consultar: "Consultar en una cola de prioridad implica ver el elemento con mayor prioridad sin eliminarlo...",
      eliminar: "Eliminar en una cola de prioridad implica extraer el elemento con mayor prioridad...",
    },
    complejidad: {
      analisis: "Usando un heap, las operaciones de inserción y eliminación son O(log n)...",
    },
    tipo: "Estructura Lineal",
    nombre: "Cola de Prioridad",
  },
  9: {
    definicion: {
      descripcion: "Una tabla hash es una estructura de datos que asocia claves con valores utilizando una función hash...",
      caracteristicas: [
        "Proporciona acceso rápido a los datos.",
        "Usa una función hash para mapear claves a posiciones en la tabla.",
        "Maneja colisiones con técnicas como encadenamiento o direccionamiento abierto.",
      ],
    },
    operaciones: {
      insertar: "Para insertar un elemento, se calcula su índice con la función hash y se almacena en la tabla...",
      editar: "Editar un valor implica acceder a su clave hash y modificarlo...",
      consultar: "Consultar en una tabla hash implica buscar la clave y recuperar su valor...",
      eliminar: "Eliminar en una tabla hash requiere remover la clave y su valor asociado...",
    },
    complejidad: {
      analisis: "En promedio, la búsqueda, inserción y eliminación son O(1), pero pueden degradarse a O(n) con muchas colisiones...",
    },
    tipo: "Estructura Lineal",
    nombre: "Tabla Hash",
  },
  10: {
    definicion: {
      descripcion: "Un árbol binario es una estructura de datos no lineal compuesta por nodos donde cada nodo puede tener como máximo dos hijos, denominados hijo izquierdo e hijo derecho.",
      caracteristicas: [
        "Cada nodo tiene máximo dos hijos",
        "Los nodos se organizan en niveles jerárquicos",
        "Es una estructura recursiva por naturaleza",
        "Puede estar vacío o tener un nodo raíz"
      ],
    },
    operaciones: {
      insertar: "La inserción se realiza siguiendo la regla de los dos hijos, colocando nuevos nodos en posiciones vacías",
      editar: "La edición implica localizar el nodo deseado y modificar su valor mantiendo la estructura binaria",
      consultar: "La consulta puede realizarse mediante recorridos: preorden, inorden o postorden",
      eliminar: "La eliminación requiere considerar los casos de nodo hoja, nodo con un hijo o nodo con dos hijos"
    },
    complejidad: {
      analisis: "Las operaciones básicas tienen una complejidad de O(h) donde h es la altura del árbol. En el peor caso, puede ser O(n) si el árbol está degenerado"
    },
    tipo: "Árbol Binario",
    nombre: "Árbol Binario"
  },
  
  11: {
    definicion: {
      descripcion: "Un árbol binario de búsqueda (BST) es un árbol binario donde para cada nodo, todos los elementos en su subárbol izquierdo son menores y todos los elementos en su subárbol derecho son mayores.",
      caracteristicas: [
        "Mantiene sus elementos ordenados",
        "Facilita la búsqueda binaria",
        "No permite duplicados",
        "La estructura depende del orden de inserción"
      ],
    },
    operaciones: {
      insertar: "La inserción compara el valor con cada nodo para decidir si va al subárbol izquierdo o derecho hasta encontrar su posición",
      editar: "La edición debe mantener la propiedad de ordenamiento del BST",
      consultar: "La búsqueda se realiza comparando el valor con cada nodo, decidiendo si ir izquierda o derecha",
      eliminar: "La eliminación debe mantener la propiedad BST, usando técnicas como el sucesor inorden"
    },
    complejidad: {
      analisis: "En un árbol balanceado, las operaciones son O(log n). En el peor caso (árbol degenerado), son O(n)"
    },
    tipo: "Árbol Binario",
    nombre: "Árbol Binario de Búsqueda"
  },

  12: {
    definicion: {
      descripcion: "Un árbol AVL es un árbol binario de búsqueda autobalanceado donde la diferencia de altura entre los subárboles izquierdo y derecho de cualquier nodo no puede ser mayor que uno.",
      caracteristicas: [
        "Mantiene balance automático",
        "Usa factor de balance",
        "Realiza rotaciones para mantener balance",
        "Garantiza altura logarítmica"
      ],
    },
    operaciones: {
      insertar: "La inserción incluye actualizar factores de balance y realizar rotaciones si es necesario",
      editar: "La edición debe mantener tanto la propiedad BST como el balance AVL",
      consultar: "La consulta es similar a un BST normal",
      eliminar: "La eliminación puede requerir rebalanceo mediante rotaciones"
    },
    complejidad: {
      analisis: "Todas las operaciones tienen garantizada una complejidad de O(log n) debido al balance automático"
    },
    tipo: "Árbol Binario",
    nombre: "Árbol AVL"
  },

  13: {
    definicion: {
      descripcion: "Un árbol Roji-Negro es un árbol binario de búsqueda autobalanceado que utiliza un bit extra por nodo para el color (rojo o negro) y cumple ciertas propiedades que garantizan que el árbol permanezca balanceado.",
      caracteristicas: [
        "Usa colores rojo y negro para balance",
        "La raíz siempre es negra",
        "No pueden haber dos nodos rojos seguidos",
        "Todos los caminos tienen el mismo número de nodos negros"
      ],
    },
    operaciones: {
      insertar: "La inserción requiere recolorear nodos y realizar rotaciones para mantener las propiedades",
      editar: "La edición debe preservar las propiedades de coloración",
      consultar: "La búsqueda es igual que en un BST normal",
      eliminar: "La eliminación puede requerir recoloración y rotaciones"
    },
    complejidad: {
      analisis: "Garantiza operaciones en O(log n) con constantes ligeramente mayores que AVL"
    },
    tipo: "Árbol Binario",
    nombre: "Árbol RojiNegro"
  },

  14: {
    definicion: {
      descripcion: "Un árbol Splay es un árbol binario de búsqueda autoajustable que mueve automáticamente cualquier nodo accedido a la raíz mediante una serie de rotaciones.",
      caracteristicas: [
        "Auto-optimiza accesos frecuentes",
        "No mantiene balance estricto",
        "Usa operación splay",
        "Mejora acceso a elementos frecuentes"
      ],
    },
    operaciones: {
      insertar: "La inserción incluye realizar splay del nuevo nodo a la raíz",
      editar: "La edición realiza splay del nodo modificado",
      consultar: "Cada consulta mueve el nodo consultado a la raíz",
      eliminar: "La eliminación incluye splay antes de eliminar"
    },
    complejidad: {
      analisis: "Amortizado O(log n) para todas las operaciones, pero individual puede ser O(n)"
    },
    tipo: "Árbol Binario",
    nombre: "Árbol Splay"
  },

  15: {
    definicion: {
      descripcion: "Un Heap es un árbol binario completo donde cada nodo padre tiene un valor mayor (max-heap) o menor (min-heap) que sus hijos.",
      caracteristicas: [
        "Es un árbol binario completo",
        "Puede ser max-heap o min-heap",
        "La raíz es el elemento máximo/mínimo",
        "Se implementa eficientemente en un array"
      ],
    },
    operaciones: {
      insertar: "La inserción añade al final y realiza 'bubble-up' hasta su posición correcta",
      editar: "La edición requiere restaurar la propiedad heap",
      consultar: "Acceso inmediato al máximo/mínimo en la raíz",
      eliminar: "Eliminar la raíz y reorganizar mediante 'bubble-down'"
    },
    complejidad: {
      analisis: "Inserción y eliminación O(log n), acceso al máximo/mínimo O(1)"
    },
    tipo: "Árbol Binario",
    nombre: "Árbol Heap"
  },

  16: {
    definicion: {
      descripcion: "Un árbol eneario es una estructura donde cada nodo puede tener cualquier número de hijos, no limitándose a dos como en los árboles binarios.",
      caracteristicas: [
        "Número variable de hijos por nodo",
        "Mayor flexibilidad en la estructura",
        "Útil para representar jerarquías",
        "Puede implementarse con lista de hijos"
      ],
    },
    operaciones: {
      insertar: "La inserción añade un nuevo nodo como hijo de un nodo existente",
      editar: "La edición modifica el valor de un nodo existente",
      consultar: "La búsqueda puede requerir explorar todos los hijos",
      eliminar: "La eliminación debe manejar todos los hijos del nodo"
    },
    complejidad: {
      analisis: "Las operaciones dependen del número de hijos por nodo, típicamente O(n) en el peor caso"
    },
    tipo: "Árbol Eneario",
    nombre: "Árbol Eneario"
  },

  17: {
    definicion: {
      descripcion: "Un árbol 1-2-3 es un árbol de búsqueda balanceado donde los nodos pueden tener dos o tres hijos y uno o dos valores.",
      caracteristicas: [
        "Nodos con 1 o 2 valores",
        "2 o 3 hijos por nodo",
        "Todos los hijos a la misma altura",
        "Auto-balanceado por diseño"
      ],
    },
    operaciones: {
      insertar: "La inserción puede dividir nodos cuando se llenan",
      editar: "La edición debe mantener el orden de los valores",
      consultar: "La búsqueda compara con uno o dos valores por nodo",
      eliminar: "La eliminación puede requerir redistribución o fusión de nodos"
    },
    complejidad: {
      analisis: "Todas las operaciones garantizadas en O(log n)"
    },
    tipo: "Árbol Eneario",
    nombre: "Árbol 1-2-3"
  },

  18: {
    definicion: {
      descripcion: "Un árbol B es una generalización del árbol 2-3 que permite más valores por nodo y está optimizado para sistemas de almacenamiento.",
      caracteristicas: [
        "Múltiples valores por nodo",
        "Optimizado para almacenamiento",
        "Auto-balanceado",
        "Minimiza accesos a disco"
      ],
    },
    operaciones: {
      insertar: "La inserción mantiene el árbol balanceado y puede dividir nodos",
      editar: "La edición preserva el orden y estructura del árbol",
      consultar: "Búsqueda eficiente incluso con gran cantidad de datos",
      eliminar: "Eliminación mantiene el balance y puede fusionar nodos"
    },
    complejidad: {
      analisis: "Todas las operaciones en O(log n), optimizadas para minimizar operaciones de I/O"
    },
    tipo: "Árbol Eneario",
    nombre: "Árbol B"
  },

  19: {
    definicion: {
      descripcion: "Un árbol B+ es una variante del árbol B donde todos los valores están en las hojas y los nodos internos solo contienen valores de índice.",
      caracteristicas: [
        "Valores solo en hojas",
        "Hojas enlazadas entre sí",
        "Mejor para rangos de búsqueda",
        "Optimizado para bases de datos"
      ],
    },
    operaciones: {
      insertar: "La inserción mantiene valores en hojas y actualiza índices",
      editar: "La edición solo afecta a las hojas",
      consultar: "Búsqueda eficiente y óptima para rangos",
      eliminar: "Eliminación mantiene estructura y enlaces entre hojas"
    },
    complejidad: {
      analisis: "Operaciones en O(log n), con mejor rendimiento para búsquedas secuenciales"
    },
    tipo: "Árbol Eneario",
    nombre: "Árbol B+"
  }
};