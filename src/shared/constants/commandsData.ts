export const commandsData: Record<string, any> = {
  secuencia: {
    buttons: [
      {
        title: "create",
        description:
          "Crea una Secuencia de acuerdo a una capacidad predefinida.",
        estructura: "create(capacidad);",
        ejemplo: "create(10);",
      },
      {
        title: "insertLast",
        description: "Inserta un elemento al final de la Secuencia.",
        estructura: "nombreObjeto.insertLast(valor);",
        ejemplo: "se.insertLast(20);",
      },
      {
        title: "get",
        description:
          "Obtiene un elemento dentro de la secuencia dada su posición.",
        estructura: "nombreObjeto.get(posición);",
        ejemplo: "se.get(1);",
      },
      {
        title: "set",
        description:
          "Actualiza un elemento de la secuencia de acuerdo a su posición.",
        estructura: "nombreObjeto.set(posición, nuevo-valor);",
        ejemplo: "se.set(0, 10);",
      },
      {
        title: "search",
        description: "Busca un elemento dentro de la secuencia.",
        estructura: "nombreObjeto.search(valor);",
        ejemplo: "se.search(100);",
      },
      {
        title: "delete",
        description:
          "Elimina un elemento de la secuencia en la posición especificada.",
        estructura: "nombreObjeto.delete(posición);",
        ejemplo: "se.delete(0);",
      },
      {
        title: "clean",
        description: "Borra la estructura secuencia.",
        estructura: "nombreObjeto.clean();",
        ejemplo: "se.clean();",
      },
    ],
  },
  pila: {
    buttons: [
      {
        title: "push",
        description: "Inserta un elemento en la Pila.",
        estructura: `Si el objeto no ha sido instanciado: <strong>push(valor);</strong> 
               Si el objeto ya existe: <strong>nombreObjeto.push(valor);</strong>`,
        ejemplo: "<strong>push(1);</strong> ó <strong>pila.push(1);</strong>",
      },
      {
        title: "pop",
        description: "Elimina un elemento de la Pila.",
        estructura: "pop();",
        ejemplo: "pila.pop();",
      },
      {
        title: "getTop",
        description:
          "Obtiene el elemento que se encuentra en el tope de la Pila.",
        estructura: "getTop();",
        ejemplo: "pila.getTop();",
      },
      {
        title: "clean",
        description: "Vacia la Pila.",
        estructura: "clean();",
        ejemplo: "pila.clean();",
      },
    ],
  },
  cola: {
    buttons: [
      {
        title: "enqueue",
        description: "Agrega un elemento a la Cola.",
        estructura: `Si el objeto no ha sido instanciado: <strong>enqueue(valor);</strong> 
               Si el objeto ya existe: <strong>nombreObjeto.enqueue(valor);</strong>`,
        ejemplo:
          "<strong>enqueue(1);</strong> ó <strong>colaP.enqueue(1);</strong>",
      },
      {
        title: "dequeue",
        description: "Retira el primer elemento que fue insertado en la Cola.",
        estructura: "nombreObjeto.dequeue();",
        ejemplo: "cola.dequeue();",
      },
      {
        title: "getFront",
        description:
          "Obtiene el elemento que se encuentra en el frente de la Cola.",
        estructura: "nombreObjeto.getFront();",
        ejemplo: "cola.getFront();",
      },
      {
        title: "clean",
        description: "Vacia la cola",
        estructura: "nombreObjeto.clean();",
        ejemplo: "cola.clean();",
      },
    ],
  },
  "cola de prioridad": {
    buttons: [
      {
        title: "enqueue",
        description: "Agrega un elemento a la Cola basado en su prioridad.",
        estructura: `Si el objeto no ha sido instanciado: <strong>enqueue(valor, prioridad);</strong> 
               Si el objeto ya existe: <strong>nombreObjeto.enqueue(valor, prioridad);</strong>`,
        ejemplo:
          "<strong>enqueue(1, 1);</strong> ó <strong>colaP.enqueue(1, 1);</strong>",
      },
      {
        title: "dequeue",
        description: "Retira el elemento con mayor prioridad en la Cola.",
        estructura: "nombreObjeto.dequeue();",
        ejemplo: "colaP.dequeue();",
      },
      {
        title: "getFront",
        description:
          "Obtiene el elemento que se encuentra en el frente de la Cola.",
        estructura: "nombreObjeto.getFront();",
        ejemplo: "colaP.getFront();",
      },
      {
        title: "clean",
        description: "Vacia la cola",
        estructura: "nombreObjeto.clean();",
        ejemplo: "colaP.clean();",
      },
    ],
  },
  lista_enlazada: {
    buttons: [
      {
        title: "insertFirst",
        description: "Inserta un elemento al inicio de la Lista.",
        estructura: `Si el objeto no ha sido instanciado: <strong>insertFirst(valor);</strong> 
               Si el objeto ya existe: <strong>nombreObjeto.insertFirst(valor);</strong>`,
        ejemplo:
          "<strong>insertFirst(1);</strong> ó <strong>le.insertFirst(1);</strong>",
      },
      {
        title: "insertLast",
        description: "Inserta un elemento al final de la Lista.",
        estructura: `Si el objeto no ha sido instanciado: <strong>insertLast(valor);</strong> 
               Si el objeto ya existe: <strong>nombreObjeto.insertLast(valor);</strong>`,
        ejemplo:
          "<strong>insertLast(1);</strong> ó <strong>le.insertLast(1);</strong>",
      },
      {
        title: "insertAt",
        description:
          "Inserta un elemento en una posición especifica de la Lista.",
        estructura: `Si el objeto no ha sido instanciado: <strong>insertAt(valor, posición);</strong> 
               Si el objeto ya existe: <strong>nombreObjeto.insertAt(valor, posición);</strong>`,
        ejemplo:
          "<strong>insertAt(2, 1);</strong> ó <strong>le.insertAt(2, 1);</strong>",
      },
      {
        title: "removeFirst",
        description: "Elimina el primer elemento de la lista.",
        estructura: "nombreObjeto.removeFirst();",
        ejemplo: "le.removeFirst();",
      },
      {
        title: "removeLast",
        description: "Elimina el último elemento de la lista.",
        estructura: "nombreObjeto.removeLast();",
        ejemplo: "le.removeLast();",
      },
      {
        title: "removeAt",
        description: "Elimina un elemento de la lista en una posición dada.",
        estructura: "nombreObjeto.removeAt(posición);",
        ejemplo: "le.removeAt(1);",
      },
      {
        title: "search",
        description: "Busca el elemento especificado en la lista.",
        estructura: "nombreObjeto.search(valor);",
        ejemplo: "le.search(1);",
      },
      {
        title: "clean",
        description: "Borra la lista simple",
        estructura: "nombreObjeto.clean();",
        ejemplo: "le.clean();",
      },
    ],
  },
  tabla_hash: {
    buttons: [
      {
        title: "create",
        description: "Crea la tabla hash con N slots",
        estructura: "create(n);",
        ejemplo: "create(10);",
      },
      {
        title: "set",
        description: "Inserta o actualiza un par clave→valor",
        estructura: "nombreObjeto.set(clave,valor);",
        ejemplo: "th.set(25,100);",
      },
      {
        title: "get",
        description: "Recupera el valor asociado a una clave",
        estructura: "nombreObjeto.get(clave);",
        ejemplo: "th.get(25);",
      },
      {
        title: "delete",
        description: "Elimina un par por su clave",
        estructura: "nombreObjeto.delete(clave);",
        ejemplo: "th.delete(25);",
      },
      {
        title: "clean",
        description: "Vacia la tabla hash",
        estructura: "nombreObjeto.clean();",
        ejemplo: "th.clean();",
      },
    ],
  },
  arbol_binario: {
    buttons: [
      {
        title: "insertLeft",
        description:
          "Inserta un nodo como hijo izquierdo de un nodo existente.",
        estructura: `Si el objeto no ha sido instanciado: <strong>insertLeft(padre, valor);</strong> 
               Si el objeto ya existe: <strong>nombreObjeto.insertLeft(padre, valor);</strong>`,
        ejemplo:
          "<strong>insertLeft(1, 2);</strong> ó <strong>arbolBi.insertLeft(1, 2);</strong>",
      },
      {
        title: "insertRight",
        description: "Inserta un nodo como hijo derecho de un nodo existente.",
        estructura: `Si el objeto no ha sido instanciado: <strong>insertRight(padre, valor);</strong> 
               Si el objeto ya existe: <strong>nombreObjeto.insertRight(padre, valor);</strong>`,
        ejemplo:
          "<strong>insertRight(1, 2);</strong> ó <strong>arbolBi.insertRight(1, 2);</strong>",
      },
      {
        title: "delete",
        description: "Elimina un nodo del árbol binario.",
        estructura: "nombreObjeto.delete(valor);",
        ejemplo: "arbolBi.delete(1);",
      },
      {
        title: "search",
        description: "Busca un nodo dentro del árbol binario.",
        estructura: "nombreObjeto.search(valor);",
        ejemplo: "arbolBi.search(3);",
      },
      {
        title: "getPreOrder",
        description: "Obtiene el recorrido en preorden del árbol binario.",
        estructura: "nombreObjeto.getPreOrder();",
        ejemplo: "arbolBi.getPreOrder();",
      },
      {
        title: "getInOrder",
        description: "Obtiene el recorrido en inorden del árbol binario.",
        estructura: "nombreObjeto.getInOrder();",
        ejemplo: "arbolBi.getInOrder();",
      },
      {
        title: "getPostOrder",
        description: "Obtiene el recorrido en postorden del árbol binario.",
        estructura: "nombreObjeto.getPostOrder();",
        ejemplo: "arbolBi.getPostOrder();",
      },
      {
        title: "getLevelOrder",
        description: "Obtiene el recorrido por niveles del árbol binario.",
        estructura: "nombreObjeto.getLevelOrder();",
        ejemplo: "arbolBi.getLevelOrder();",
      },
      {
        title: "clean",
        description: "Borra el árbol binario.",
        estructura: "nombreObjeto.clean();",
        ejemplo: "arbolBi.clean();",
      },
    ],
  },
  arbol_binario_busqueda: {
    buttons: [
      {
        title: "insert",
        description: "Inserta un nodo dentro del árbol binario de búsqueda.",
        estructura: `Si el objeto no ha sido instanciado: <strong>insert(valor);</strong> 
               Si el objeto ya existe: <strong>nombreObjeto.insert(valor);</strong>`,
        ejemplo:
          "<strong>insert(200);</strong> ó <strong>arbolBB.insert(20);</strong>",
      },
      {
        title: "delete",
        description: "Elimina un nodo del árbol binario de búsqueda.",
        estructura: "nombreObjeto.delete(valor);",
        ejemplo: "arbolBB.delete(100);",
      },
      {
        title: "search",
        description: "Busca un nodo dentro del árbol binario de búsqueda.",
        estructura: "nombreObjeto.search(valor);",
        ejemplo: "arbolBB.search(30);",
      },
      {
        title: "getPreOrder",
        description:
          "Obtiene el recorrido en preorden del árbol binario de búsqueda.",
        estructura: "nombreObjeto.getPreOrder();",
        ejemplo: "arbolBB.getPreOrder();",
      },
      {
        title: "getInOrder",
        description:
          "Obtiene el recorrido en inorden del árbol binario de búsqueda.",
        estructura: "nombreObjeto.getInOrder();",
        ejemplo: "arbolBB.getInOrder();",
      },
      {
        title: "getPostOrder",
        description:
          "Obtiene el recorrido en postorden del árbol binario de búsqueda.",
        estructura: "nombreObjeto.getPostOrder();",
        ejemplo: "arbolBB.getPostOrder();",
      },
      {
        title: "getLevelOrder",
        description:
          "Obtiene el recorrido por niveles del árbol binario de búsqueda.",
        estructura: "nombreObjeto.getLevelOrder();",
        ejemplo: "arbolBB.getLevelOrder();",
      },
      {
        title: "clean",
        description: "Borra el árbol binario de búsqueda.",
        estructura: "nombreObjeto.clean();",
        ejemplo: "arbolBB.clean();",
      },
    ],
  },
  arbol_avl: {
    buttons: [
      {
        title: "insert",
        description: "Inserta un valor en el AVL (con rebalanceo automático).",
        estructura: `Si el objeto no ha sido instanciado: <strong>insert(valor);</strong> 
               Si el objeto ya existe: <strong>nombreObjeto.insert(valor);</strong>`,
        ejemplo:
          "<strong>insert(30);</strong> ó <strong>arbolA.insert(30);</strong>",
      },
      {
        title: "delete",
        description: "Elimina un valor del AVL (con rebalanceo automático).",
        estructura: "nombreObjeto.delete(valor);",
        ejemplo: "arbolA.delete(20);",
      },
      {
        title: "search",
        description: "Busca un valor en el AVL.",
        estructura: "nombreObjeto.search(valor);",
        ejemplo: "arbolA.search(25);",
      },
      {
        title: "getPreOrder",
        description: "Obtiene el recorrido en preorden del AVL.",
        estructura: "nombreObjeto.getPreOrder();",
        ejemplo: "arbolA.getPreOrder();",
      },
      {
        title: "getInOrder",
        description: "Obtiene el recorrido en inorden del AVL.",
        estructura: "nombreObjeto.getInOrder();",
        ejemplo: "arbolA.getInOrder();",
      },
      {
        title: "getPostOrder",
        description: "Obtiene el recorrido en postorden del AVL.",
        estructura: "nombreObjeto.getPostOrder();",
        ejemplo: "arbolA.getPostOrder();",
      },
      {
        title: "getLevelOrder",
        description: "Obtiene el recorrido por niveles (BFS) del AVL.",
        estructura: "nombreObjeto.getLevelOrder();",
        ejemplo: "arbolA.getLevelOrder();",
      },
      {
        title: "clean",
        description: "Vacia el árbol AVL.",
        estructura: "nombreObjeto.clean();",
        ejemplo: "arbolA.clean();",
      },
    ],
  },

  arbol_rojinegro: {
    buttons: [
      {
        title: "insert",
        description: "Insertar un nodo en el árbol Rojo-Negro",
        estructura: `Si el objeto no ha sido instanciado: <strong>insert(valor);</strong> 
               Si el objeto ya existe: <strong>nombreObjeto.insert(valor);</strong>`,
        ejemplo:
          "<strong>insert(30);</strong> ó <strong>arbolRN.insert(30);</strong>",
      },
      {
        title: "delete",
        description: "Eliminar un nodo del árbol Rojo-Negro",
        estructura: "nombreObjeto.delete(valor);",
        ejemplo: "arbolRN.delete(1);",
      },
      {
        title: "search",
        description: "Buscar un nodo en el árbol Rojo-Negro",
        estructura: "nombreObjeto.search(valor);",
        ejemplo: "arbolRN.search(1);",
      },
      {
        title: "clean",
        description: "Borrar el árbol Rojo-Negro",
        estructura: "nombreObjeto.clean();",
        ejemplo: "arbolRN.clean();",
      },
      {
        title: "getPreOrder",
        description: "Obtiene el recorrido en preorden del árbol RojiNegro.",
        estructura: "nombreObjeto.getPreOrder();",
        ejemplo: "arbolRN.getPreOrder();",
      },
      {
        title: "getInOrder",
        description: "Obtiene el recorrido en inorden del árbol RojiNegro.",
        estructura: "nombreObjeto.getInOrder();",
        ejemplo: "arbolRN.getInOrder();",
      },
      {
        title: "getPostOrder",
        description: "Obtiene el recorrido en postorden del árbol RojiNegro.",
        estructura: "nombreObjeto.getPostOrder();",
        ejemplo: "arbolRN.getPostOrder();",
      },
      {
        title: "getLevelOrder",
        description:
          "Obtiene el recorrido por niveles (BFS) del árbol RojiNegro.",
        estructura: "nombreObjeto.getLevelOrder();",
        ejemplo: "arbolRN.getLevelOrder();",
      },
      {
        title: "clean",
        description: "Vacia el árbol AVL.",
        estructura: "nombreObjeto.clean();",
        ejemplo: "arbolRN.clean();",
      },
    ],
  },
  splay: {
    buttons: [
      {
        title: "insert",
        description: "Insertar un nodo en el árbol Splay",
        estructura: "nombreObjeto.insert(valor);",
        ejemplo: "arbolS.insert(1);",
      },
      {
        title: "delete",
        description: "Eliminar un nodo del árbol Splay",
        estructura: "nombreObjeto.delete(valor);",
        ejemplo: "arbolS.delete(1);",
      },
      {
        title: "search",
        description: "Buscar un nodo en el árbol Splay",
        estructura: "nombreObjeto.search(valor);",
        ejemplo: "arbolS.search(1);",
      },
      {
        title: "splay",
        description: "Realizar la operación Splay",
        estructura: "nombreObjeto.splay(valor);",
        ejemplo: "arbolS.splay(1);",
      },
      {
        title: "clean",
        description: "Borrar el árbol Splay",
        estructura: "nombreObjeto.clean();",
        ejemplo: "arbolS.clean();",
      },
    ],
  },
  heap: {
    buttons: [
      {
        title: "insert",
        description: "Insertar un elemento en el Heap",
        estructura: "nombreObjeto.insert(valor);",
        ejemplo: "arbolH.insert(1);",
      },
      {
        title: "delete",
        description: "Eliminar un elemento del Heap",
        estructura: "nombreObjeto.delete(valor);",
        ejemplo: "arbolH.delete(1);",
      },
      {
        title: "extractMin",
        description: "Extraer el mínimo del Heap",
        estructura: "nombreObjeto.extractMin();",
        ejemplo: "arbolH.extractMin();",
      },
      {
        title: "extractMax",
        description: "Extraer el máximo del Heap",
        estructura: "nombreObjeto.extractMax();",
        ejemplo: "arbolH.extractMax();",
      },
      {
        title: "heapify",
        description: "Aplicar Heapify",
        estructura: "nombreObjeto.heapify();",
        ejemplo: "arbolH.heapify();",
      },
      {
        title: "clean",
        description: "Borrar el Heap",
        estructura: "nombreObjeto.clean();",
        ejemplo: "arbolH.clean();",
      },
    ],
  },

  arbol_nario: {
    buttons: [
      {
        title: "createRoot",
        description: "Crea la raíz del árbol N-ario si aún no existe.",
        estructura: `Si el objeto no ha sido instanciado: <strong>createRoot(valor);</strong> 
               Si el objeto ya existe: <strong>nombreObjeto.createRoot(valor);</strong>`,
        ejemplo:
          "<strong>createRoot(10);</strong> ó <strong>nario.createRoot(10);</strong>",
      },
      {
        title: "insertChild",
        description:
          "Inserta un hijo bajo un padre (por id). Opcionalmente puedes indicar la posición 'index' (0-based) para fijar su lugar entre los hijos.",
        estructura: "nombreObjeto.insertChild(parentId, valor, index?);",
        ejemplo:
          'nario.insertChild("node-a", 25);  // al final\nnario.insertChild("node-a", 30, 0);  // en posición 0',
      },
      {
        title: "deleteNode",
        description: "Elimina un nodo (y todo su subárbol) por id.",
        estructura: "nombreObjeto.deleteNode(id);",
        ejemplo: 'nario.deleteNode("node-b");',
      },
      {
        title: "moveNode",
        description:
          "Mueve un subárbol a otro padre (por id). Usa 'index' opcional para colocar el nodo en una posición específica entre los hijos del nuevo padre.",
        estructura: "nombreObjeto.moveNode(id, newParentId, index?);",
        ejemplo:
          'nario.moveNode("node-c", "node-a");\nnario.moveNode("node-c", "node-a", 1);',
      },
      {
        title: "updateValue",
        description: "Actualiza el valor almacenado en un nodo por su id.",
        estructura: "nombreObjeto.updateValue(id, nuevoValor);",
        ejemplo: 'nario.updateValue("node-d", 42);',
      },
      {
        title: "search",
        description:
          "Busca el primer nodo cuyo valor coincida (BFS). Resalta el camino encontrado.",
        estructura: "nombreObjeto.search(valor);",
        ejemplo: "nario.search(42);",
      },
      {
        title: "getPreOrder",
        description: "Obtiene el recorrido en preorden (nodo → hijos).",
        estructura: "nombreObjeto.getPreOrder();",
        ejemplo: "nario.getPreOrder();",
      },
      {
        title: "getPostOrder",
        description: "Obtiene el recorrido en postorden (hijos → nodo).",
        estructura: "nombreObjeto.getPostOrder();",
        ejemplo: "nario.getPostOrder();",
      },
      {
        title: "getLevelOrder",
        description: "Obtiene el recorrido por niveles (BFS).",
        estructura: "nombreObjeto.getLevelOrder();",
        ejemplo: "nario.getLevelOrder();",
      },
      {
        title: "clean",
        description: "Vacía por completo el árbol N-ario.",
        estructura: "nombreObjeto.clean();",
        ejemplo: "nario.clean();",
      },
    ],
  },
  arbol_123: {
    buttons: [
      {
        title: "insert",
        description:
          "Inserta un valor en el Árbol 1-2-3 (ajustando nodos y promoviendo claves cuando sea necesario).",
        estructura: `Si el objeto no ha sido instanciado: <strong>insert(valor);</strong> 
               Si el objeto ya existe: <strong>nombreObjeto.insert(valor);</strong>`,
        ejemplo:
          "<strong>insert(30);</strong> ó <strong>arbol123.insert(30);</strong>",
      },
      {
        title: "delete",
        description:
          "Elimina un valor del Árbol 1-2-3 (fusionando o redistribuyendo nodos según el caso).",
        estructura: "nombreObjeto.delete(valor);",
        ejemplo: "arbol123.delete(20);",
      },
      {
        title: "search",
        description: "Busca un valor en el Árbol 1-2-3.",
        estructura: "nombreObjeto.search(valor);",
        ejemplo: "arbol123.search(25);",
      },
      {
        title: "getPreOrder",
        description: "Obtiene el recorrido en preorden del Árbol 1-2-3.",
        estructura: "nombreObjeto.getPreOrder();",
        ejemplo: "arbol123.getPreOrder();",
      },
      {
        title: "getInOrder",
        description: "Obtiene el recorrido en inorden del Árbol 1-2-3.",
        estructura: "nombreObjeto.getInOrder();",
        ejemplo: "arbol123.getInOrder();",
      },
      {
        title: "getPostOrder",
        description: "Obtiene el recorrido en postorden del Árbol 1-2-3.",
        estructura: "nombreObjeto.getPostOrder();",
        ejemplo: "arbol123.getPostOrder();",
      },
      {
        title: "getLevelOrder",
        description: "Obtiene el recorrido por niveles (BFS) del Árbol 1-2-3.",
        estructura: "nombreObjeto.getLevelOrder();",
        ejemplo: "arbol123.getLevelOrder();",
      },
      {
        title: "clean",
        description: "Vacía por completo el Árbol 1-2-3.",
        estructura: "nombreObjeto.clean();",
        ejemplo: "arbol123.clean();",
      },
    ],
  },

  arbol_b: {
    buttons: [
      {
        title: "insert",
        description:
          "Inserta un valor en el Árbol B. Si un nodo se llena, se divide (split) y se promueve la clave media.",
        estructura: `Si el objeto no ha sido instanciado: <strong>insert(valor);</strong>
               Si el objeto ya existe: <strong>arbolB.insert(valor);</strong>`,
        ejemplo:
          "<strong>insert(30);</strong> ó <strong>arbolB.insert(30);</strong>",
      },
      {
        title: "delete",
        description:
          "Elimina un valor del Árbol B. Corrige con redistribución (préstamo) o fusión (merge) si algún nodo queda con pocas claves.",
        estructura: "<strong>arbolB.delete(valor);</strong>",
        ejemplo: "<strong>arbolB.delete(20);</strong>",
      },
      {
        title: "search",
        description:
          "Busca un valor en el Árbol B descendiendo por los intervalos que determinan sus claves.",
        estructura: "<strong>arbolB.search(valor);</strong>",
        ejemplo: "<strong>arbolB.search(25);</strong>",
      },
      {
        title: "getPreOrder",
        description:
          "Obtiene el recorrido en preorden del Árbol B (claves del nodo, luego sus hijos de izquierda a derecha).",
        estructura: "<strong>arbolB.getPreOrder();</strong>",
        ejemplo: "<strong>arbolB.getPreOrder();</strong>",
      },
      {
        title: "getInOrder",
        description:
          "Obtiene el recorrido en inorden del Árbol B (child[0], k0, child[1], k1, ..., child[m]).",
        estructura: "<strong>arbolB.getInOrder();</strong>",
        ejemplo: "<strong>arbolB.getInOrder();</strong>",
      },
      {
        title: "getPostOrder",
        description:
          "Obtiene el recorrido en postorden del Árbol B (todos los hijos y al final las claves del nodo).",
        estructura: "<strong>arbolB.getPostOrder();</strong>",
        ejemplo: "<strong>arbolB.getPostOrder();</strong>",
      },
      {
        title: "getLevelOrder",
        description:
          "Obtiene el recorrido por niveles (BFS) del Árbol B (se encolan nodos y se emiten sus claves en orden).",
        estructura: "<strong>arbolB.getLevelOrder();</strong>",
        ejemplo: "<strong>arbolB.getLevelOrder();</strong>",
      },
      {
        title: "clean",
        description: "Vacía por completo el Árbol B.",
        estructura: "<strong>arbolB.clean();</strong>",
        ejemplo: "<strong>arbolB.clean();</strong>",
      },
    ],
  },

  arbol_b_plus: {
    buttons: [
      {
        title: "insert",
        description:
          "Inserta una clave en el Árbol B+. Siempre se inserta en una hoja. Si la hoja se desborda, se divide (split) y se actualizan los separadores en los nodos internos; se mantienen los punteros hoja↔hoja.",
        estructura: `Si el objeto no ha sido instanciado: <strong>insert(valor);</strong>
               Si el objeto ya existe: <strong>arbolBPlus.insert(valor);</strong>`,
        ejemplo:
          "<strong>insert(30);</strong> ó <strong>arbolBPlus.insert(30);</strong>",
      },
      {
        title: "delete",
        description:
          "Elimina una clave desde su hoja. Si queda por debajo del mínimo, corrige con redistribución (préstamo) o fusión (merge) y actualiza los separadores internos. Puede contraerse la raíz si es necesario.",
        estructura: "<strong>arbolBPlus.delete(valor);</strong>",
        ejemplo: "<strong>arbolBPlus.delete(20);</strong>",
      },
      {
        title: "search",
        description:
          "Busca una clave descendiendo por nodos internos (enrutadores) hasta la hoja y verifica su presencia. En B+ todas las claves reales viven en las hojas.",
        estructura: "<strong>arbolBPlus.search(valor);</strong>",
        ejemplo: "<strong>arbolBPlus.search(25);</strong>",
      },

      /* ─────────────── Propios de B+ ─────────────── */
      {
        title: "range",
        description:
          "Devuelve todas las claves en el intervalo inclusivo [from, to]. Ubica la hoja de ‘from’ y recorre hojas contiguas mediante sus punteros nextLeaf hasta superar ‘to’.",
        estructura: "<strong>arbolBPlus.range(from, to);</strong>",
        ejemplo: "<strong>arbolBPlus.range(15, 42);</strong>",
      },
      {
        title: "scanFrom",
        description:
          "Exploración secuencial hacia la derecha: comienza en ‘start’ (o en la siguiente clave mayor si ‘start’ no existe) y devuelve hasta ‘limit’ elementos recorriendo punteros de hojas.",
        estructura: "<strong>arbolBPlus.scanFrom(start, limit);</strong>",
        ejemplo: "<strong>arbolBPlus.scanFrom(30, 10);</strong>",
      },

      /* ─────────────── Recorridos útiles en UI ─────────────── */
      {
        title: "getInOrder",
        description:
          "Obtiene el recorrido inorden del Árbol B+. En la práctica, emite las claves hoja por hoja siguiendo los enlaces laterales (orden ascendente global).",
        estructura: "<strong>arbolBPlus.getInOrder();</strong>",
        ejemplo: "<strong>arbolBPlus.getInOrder();</strong>",
      },
      {
        title: "getLevelOrder",
        description:
          "Obtiene el recorrido por niveles (BFS) del Árbol B+ sobre la jerarquía (internos y hojas).",
        estructura: "<strong>arbolBPlus.getLevelOrder();</strong>",
        ejemplo: "<strong>arbolBPlus.getLevelOrder();</strong>",
      },

      /* ─────────────── Limpieza ─────────────── */
      {
        title: "clean",
        description:
          "Vacía por completo el Árbol B+ (reinicia hojas e internos).",
        estructura: "<strong>arbolBPlus.clean();</strong>",
        ejemplo: "<strong>arbolBPlus.clean();</strong>",
      },
    ],
  },
  arbol_heap: {
    buttons: [
      {
        title: "insert",
        description: "Insertar un nodo en el árbol heap",
        estructura: `Si el objeto no ha sido instanciado: <strong>insert(valor);</strong> 
               Si el objeto ya existe: <strong>nombreObjeto.insert(valor);</strong>`,
        ejemplo:
          "<strong>insert(1);</strong> ó <strong>arbHeap.insert(1);</strong>",
      },
      {
        title: "delete",
        description: "Eliminar un nodo del árbol heap",
        estructura: "nombreObjeto.delete(valor);",
        ejemplo: "arbHeap.delete(1);",
      },
      {
        title: "deleteR",
        description: "Eliminar el nodo raíz del árbol heap",
        estructura: "nombreObjeto.deleteR(valor);",
        ejemplo: "arbHeap.deleteR(1);",
      },
      {
        title: "search",
        description: "Buscar un nodo en el árbol heap",
        estructura: "nombreObjeto.search(valor);",
        ejemplo: "arbHeap.search(1);",
      },
      {
        title: "peek",
        description: "Ver el nodo raíz del árbol heap",
        estructura: "nombreObjeto.peek(valor);",
        ejemplo: "arbHeap.peek(1);",
      },
      {
        title: "getLevelOrder",
        description: "Obtiene el recorrido por niveles del árbol heap.",
        estructura: "nombreObjeto.getLevelOrder();",
        ejemplo: "arbHeap.getLevelOrder();",
      },
      {
        title: "clean",
        description: "Borrar el árbol heap",
        estructura: "nombreObjeto.clean();",
        ejemplo: "arbHeap.clean();",
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
