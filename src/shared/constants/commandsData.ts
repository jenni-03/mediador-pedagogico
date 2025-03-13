export const commandsData: Record<string, any> = {
    secuencia: {
        buttons: [
            { title: "Create", description: "Crear un nodo...", estructura: "Create valor", ejemplo: "Create 1" },
            { title: "Insert", description: "Insertar un nodo...", estructura: "Insert valor", ejemplo: "Insert 1" },
            { title: "Delete", description: "Borrar un nodo...", estructura: "Delete valor", ejemplo: "Delete 1" },
            { title: "Search", description: "Buscar el nodo...", estructura: "Search valor", ejemplo: "Search 1" },
            { title: "Update", description: "Actualizar el nodo...", estructura: "Update posición nuevo-valor", ejemplo: "Update 1 10"},
            { title: "Clean", description: "Borrar la estructura...", estructura: "Clean", ejemplo: "Clean" },
        ]
    },
    lista_simple: {
        buttons: [
            { title: "Create", description: "Crear una lista vacía o con un valor inicial...", estructura: "Create valor", ejemplo: "Create 1" },
            { title: "Insert_First", description: "Insertar al inicio...", estructura: "Insert_First valor", ejemplo: "Insert_First 1" },
            { title: "Insert_Last", description: "Insertar al final...", estructura: "Insert_Last valor", ejemplo: "Insert_Last 1" },
            { title: "Insert_At", description: "Insertar en una posición específica...", estructura: "Insert_At valor", ejemplo: "Insert_At 1" },
            { title: "Delete", description: "Eliminar un nodo...", estructura: "Delete valor", ejemplo: "Delete 1" },
            { title: "Search", description: "Buscar un nodo...", estructura: "Search valor", ejemplo: "Search 1" },
            { title: "Update", description: "Actualizar un nodo...", estructura: "Update valor", ejemplo: "Update 1" },
            { title: "Clean", description: "Borrar la lista...", estructura: "Clean", ejemplo: "Clean" },
            { title: "Traverse", description: "Recorrer la lista...", estructura: "Traverse valor", ejemplo: "Traverse 1" },
        ]
    },
    lista_doble: {
        buttons: [
            { title: "Create", description: "Crear una lista doblemente enlazada...", estructura: "Create valor", ejemplo: "Create 1" },
            { title: "Insert_First", description: "Insertar al inicio...", estructura: "Insert_First valor", ejemplo: "Insert_First 1" },
            { title: "Insert_Last", description: "Insertar al final...", estructura: "Insert_Last valor", ejemplo: "Insert_Last 1" },
            { title: "Insert_At", description: "Insertar en una posición específica...", estructura: "Insert_At valor", ejemplo: "Insert_At 1" },
            { title: "Delete", description: "Eliminar un nodo...", estructura: "Delete valor", ejemplo: "Delete 1" },
            { title: "Search", description: "Buscar un nodo...", estructura: "Search valor", ejemplo: "Search 1" },
            { title: "Update", description: "Actualizar un nodo...", estructura: "Update valor", ejemplo: "Update 1" },
            { title: "Clean", description: "Borrar la lista...", estructura: "Clean", ejemplo: "Clean" },
            { title: "Traverse_F", description: "Recorrer la lista hacia adelante...", estructura: "Traverse_F valor", ejemplo: "Traverse_F 1" },
            { title: "Traverse_B", description: "Recorrer la lista hacia atrás...", estructura: "Traverse_B valor", ejemplo: "Traverse_B 1" },
        ]
    },
    lista_circular: {
        buttons: [
            { title: "Create", description: "Crear una lista circular...", estructura: "Create valor", ejemplo: "Create 1" },
            { title: "Insert_First", description: "Insertar al inicio...", estructura: "Insert_First valor", ejemplo: "Insert_First 1" },
            { title: "Insert_Last", description: "Insertar al final...", estructura: "Insert_Last valor", ejemplo: "Insert_Last 1" },
            { title: "Insert_At", description: "Insertar en una posición específica...", estructura: "Insert_At valor", ejemplo: "Insert_At 1" },
            { title: "Delete", description: "Eliminar un nodo...", estructura: "Delete valor", ejemplo: "Delete 1" },
            { title: "Search", description: "Buscar un nodo...", estructura: "Search valor", ejemplo: "Search 1" },
            { title: "Update", description: "Actualizar un nodo...", estructura: "Update valor", ejemplo: "Update 1" },
            { title: "Clean", description: "Borrar la lista...", estructura: "Clean", ejemplo: "Clean" },
            { title: "Traverse", description: "Recorrer la lista...", estructura: "Traverse valor", ejemplo: "Traverse 1" },
        ]
    },
    lista_circular_doble: {
        buttons: [
            { title: "Create", description: "Crear una lista circular doblemente enlazada...", estructura: "Create valor", ejemplo: "Create 1" },
            { title: "Insert_First", description: "Insertar al inicio...", estructura: "Insert_First valor", ejemplo: "Insert_First 1" },
            { title: "Insert_Last", description: "Insertar al final...", estructura: "Insert_Last valor", ejemplo: "Insert_Last 1" },
            { title: "Insert_At", description: "Insertar en una posición específica...", estructura: "Insert_At valor", ejemplo: "Insert_At 1" },
            { title: "Delete", description: "Eliminar un nodo...", estructura: "Delete valor", ejemplo: "Delete 1" },
            { title: "Search", description: "Buscar un nodo...", estructura: "Search valor", ejemplo: "Search 1" },
            { title: "Update", description: "Actualizar un nodo...", estructura: "Update valor", ejemplo: "Update 1" },
            { title: "Clean", description: "Borrar la lista...", estructura: "Clean", ejemplo: "Clean" },
            { title: "Traverse_F", description: "Recorrer la lista hacia adelante...", estructura: "Traverse_F valor", ejemplo: "Traverse_F 1" },
            { title: "Traverse_B", description: "Recorrer la lista hacia atrás...", estructura: "Traverse_B valor", ejemplo: "Traverse_B 1" },
        ]
    },
    pila: {
        buttons: [
            { title: "Push", description: "Apilar un elemento...", estructura: "Push valor", ejemplo: "Push 1" },
            { title: "Pop", description: "Desapilar un elemento...", estructura: "Pop valor", ejemplo: "Pop 1" },
            { title: "Top", description: "Obtener el elemento superior...", estructura: "Top valor", ejemplo: "Top 1" },
            { title: "Clean", description: "Vaciar la pila...", estructura: "Clean", ejemplo: "Clean" },
        ]
    },
    cola: {
        buttons: [
            { title: "Enqueue", description: "Encolar un elemento...", estructura: "Enqueue valor", ejemplo: "Enqueue 1" },
            { title: "Dequeue", description: "Desencolar un elemento...", estructura: "Dequeue valor", ejemplo: "Dequeue 1" },
            { title: "Front", description: "Obtener el primer elemento...", estructura: "Front valor", ejemplo: "Front 1" },
            { title: "Rear", description: "Obtener el último elemento...", estructura: "Rear valor", ejemplo: "Rear 1" },
            { title: "Clean", description: "Vaciar la cola...", estructura: "Clean", ejemplo: "Clean" },
        ]
    },
    cola_de_prioridad: {
        buttons: [
            { title: "Enqueue", description: "Encolar un elemento con prioridad...", estructura: "Enqueue valor", ejemplo: "Enqueue 1" },
            { title: "Dequeue", description: "Desencolar el elemento con mayor prioridad...", estructura: "Dequeue valor", ejemplo: "Dequeue 1" },
            { title: "Front", description: "Obtener el primer elemento...", estructura: "Front valor", ejemplo: "Front 1" },
            { title: "Rear", description: "Obtener el último elemento...", estructura: "Rear valor", ejemplo: "Rear 1" },
            { title: "Clean", description: "Vaciar la cola de prioridad...", estructura: "Clean", ejemplo: "Clean" },
        ]
    },
    tabla_hash: {
        buttons: [
            { title: "Insert", description: "Insertar un elemento con clave y valor...", estructura: "Insert valor", ejemplo: "Insert 1" },
            { title: "Update", description: "Actualizar un valor existente...", estructura: "Update valor", ejemplo: "Update 1" },
            { title: "Delete", description: "Eliminar un elemento por su clave...", estructura: "Delete valor", ejemplo: "Delete 1" },
            { title: "Search", description: "Buscar un valor por su clave...", estructura: "Search valor", ejemplo: "Search 1" },
            { title: "Contains", description: "Verificar si una clave existe...", estructura: "Contains valor", ejemplo: "Contains 1" },
            { title: "Resize", description: "Redimensionar la tabla hash...", estructura: "Resize valor", ejemplo: "Resize 1" },
            { title: "Clean", description: "Borrar la tabla hash...", estructura: "Clean", ejemplo: "Clean" },
            { title: "Traverse", description: "Recorrer todos los elementos...", estructura: "Traverse valor", ejemplo: "Traverse 1" },
        ]
    },
    
    bst: {
        buttons: [
            { title: "Insert", description: "Insertar un nodo en el BST...", estructura: "Insert valor", ejemplo: "Insert 1" },
            { title: "Delete", description: "Eliminar un nodo del BST...", estructura: "Delete valor", ejemplo: "Delete 1" },
            { title: "Search", description: "Buscar un nodo en el BST...", estructura: "Search valor", ejemplo: "Search 1" },
            { title: "Traverse", description: "Recorrer el BST en diferentes órdenes...", estructura: "Traverse valor", ejemplo: "Traverse 1" },
            { title: "FindMin", description: "Encontrar el mínimo...", estructura: "FindMin valor", ejemplo: "FindMin 1" },
            { title: "FindMax", description: "Encontrar el máximo...", estructura: "FindMax valor", ejemplo: "FindMax 1" },
            { title: "Clean", description: "Borrar el BST...", estructura: "Clean", ejemplo: "Clean" },
        ]
    },
    
    avl: {
        buttons: [
            { title: "Insert", description: "Insertar un nodo en el AVL...", estructura: "Insert valor", ejemplo: "Insert 1" },
            { title: "Delete", description: "Eliminar un nodo del AVL...", estructura: "Delete valor", ejemplo: "Delete 1" },
            { title: "Search", description: "Buscar un nodo en el AVL...", estructura: "Search valor", ejemplo: "Search 1" },
            { title: "Traverse", description: "Recorrer el AVL en diferentes órdenes...", estructura: "Traverse valor", ejemplo: "Traverse 1" },
            { title: "FindMin", description: "Encontrar el mínimo...", estructura: "FindMin valor", ejemplo: "FindMin 1" },
            { title: "FindMax", description: "Encontrar el máximo...", estructura: "FindMax valor", ejemplo: "FindMax 1" },
            { title: "Balance", description: "Balancear el árbol AVL...", estructura: "Balance valor", ejemplo: "Balance 1" },
            { title: "Clean", description: "Borrar el AVL...", estructura: "Clean", ejemplo: "Clean" },
        ]
    },
    
    roji_negro: {
        buttons: [
            { title: "Insert", description: "Insertar un nodo en el árbol Rojo-Negro...", estructura: "Insert valor", ejemplo: "Insert 1" },
            { title: "Delete", description: "Eliminar un nodo del árbol Rojo-Negro...", estructura: "Delete valor", ejemplo: "Delete 1" },
            { title: "Search", description: "Buscar un nodo en el árbol Rojo-Negro...", estructura: "Search valor", ejemplo: "Search 1" },
            { title: "Traverse", description: "Recorrer el árbol Rojo-Negro...", estructura: "Traverse valor", ejemplo: "Traverse 1" },
            { title: "FindMin", description: "Encontrar el mínimo...", estructura: "FindMin valor", ejemplo: "FindMin 1" },
            { title: "FindMax", description: "Encontrar el máximo...", estructura: "FindMax valor", ejemplo: "FindMax 1" },
            { title: "Clean", description: "Borrar el árbol Rojo-Negro...", estructura: "Clean", ejemplo: "Clean" },
        ]
    },
    
    splay: {
        buttons: [
            { title: "Insert", description: "Insertar un nodo en el árbol Splay...", estructura: "Insert valor", ejemplo: "Insert 1" },
            { title: "Delete", description: "Eliminar un nodo del árbol Splay...", estructura: "Delete valor", ejemplo: "Delete 1" },
            { title: "Search", description: "Buscar un nodo en el árbol Splay...", estructura: "Search valor", ejemplo: "Search 1" },
            { title: "Splay", description: "Realizar la operación Splay...", estructura: "Splay valor", ejemplo: "Splay 1" },
            { title: "Clean", description: "Borrar el árbol Splay...", estructura: "Clean", ejemplo: "Clean" },
        ]
    },

    heap: {
        buttons: [
            { title: "Insert", description: "Insertar un elemento en el Heap...", estructura: "Insert valor", ejemplo: "Insert 1" },
            { title: "Delete", description: "Eliminar un elemento del Heap...", estructura: "Delete valor", ejemplo: "Delete 1" },
            { title: "ExtractMin", description: "Extraer el mínimo del Heap...", estructura: "ExtractMin valor", ejemplo: "ExtractMin 1" },
            { title: "ExtractMax", description: "Extraer el máximo del Heap...", estructura: "ExtractMax valor", ejemplo: "ExtractMax 1" },
            { title: "Heapify", description: "Aplicar Heapify...", estructura: "Heapify valor", ejemplo: "Heapify 1" },
            { title: "Clean", description: "Borrar el Heap...", estructura: "Clean", ejemplo: "Clean" },
        ]
    },
    
    arbol_eneario: {
        buttons: [
            { title: "Insert", description: "Insertar un nodo en el árbol N-ario...", estructura: "Insert valor", ejemplo: "Insert 1" },
            { title: "Delete", description: "Eliminar un nodo del árbol N-ario...", estructura: "Delete valor", ejemplo: "Delete 1" },
            { title: "Search", description: "Buscar un nodo en el árbol N-ario...", estructura: "Search valor", ejemplo: "Search 1" },
            { title: "Traverse", description: "Recorrer el eneario en diferentes órdenes...", estructura: "Traverse valor", ejemplo: "Traverse 1" },
            { title: "Clean", description: "Borrar el árbol N-ario...", estructura: "Clean", ejemplo: "Clean" },
        ]
    },
    
    arbol_b: {
        buttons: [
            { title: "Insert", description: "Insertar un nodo en el árbol B...", estructura: "Insert valor", ejemplo: "Insert 1" },
            { title: "Delete", description: "Eliminar un nodo del árbol B...", estructura: "Delete valor", ejemplo: "Delete 1" },
            { title: "Search", description: "Buscar un nodo en el árbol B...", estructura: "Search valor", ejemplo: "Search 1" },
            { title: "Traverse", description: "Recorrer el Árbol b en diferentes órdenes...", estructura: "Traverse valor", ejemplo: "Traverse 1" },
            { title: "Clean", description: "Borrar el árbol B...", estructura: "Clean", ejemplo: "Clean" },
        ]
    },
    
    arbol_b_plus: {
        buttons: [
            { title: "Insert", description: "Insertar un nodo en el árbol B+...", estructura: "Insert valor", ejemplo: "Insert 1" },
            { title: "Delete", description: "Eliminar un nodo del árbol B+...", estructura: "Delete valor", ejemplo: "Delete 1" },
            { title: "Search", description: "Buscar un nodo en el árbol B+...", estructura: "Search valor", ejemplo: "Search 1" },
            { title: "Traverse", description: "Recorrer el Árbol b+ en diferentes órdenes...", estructura: "Traverse valor", ejemplo: "Traverse 1" },
            { title: "Clean", description: "Borrar el árbol B+...", estructura: "Clean", ejemplo: "Clean" },
        ]
    }
};