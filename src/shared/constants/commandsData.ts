export const commandsData: Record<string, any> = {
    secuencia: {
        buttons: [
            { label: "Create", tooltip: "Crear un nodo..." },
            { label: "Insert", tooltip: "Insertar un nodo..." },
            { label: "Delete", tooltip: "Borrar un nodo..." },
            { label: "Search", tooltip: "Buscar el nodo..." },
            { label: "Update", tooltip: "Actualizar el nodo..." },
            { label: "Clean", tooltip: "Borrar la estructura..." },
        ]
    },
    lista_simple: {
        buttons: [
            { label: "Create", tooltip: "Crear una lista vacía o con un valor inicial..." },
            { label: "Insert_First", tooltip: "Insertar al inicio..." },
            { label: "Insert_Last", tooltip: "Insertar al final..." },
            { label: "Insert_At", tooltip: "Insertar en una posición específica..." },
            { label: "Delete", tooltip: "Eliminar un nodo..." },
            { label: "Search", tooltip: "Buscar un nodo..." },
            { label: "Update", tooltip: "Actualizar un nodo..." },
            { label: "Clean", tooltip: "Borrar la lista..." },
            { label: "Traverse", tooltip: "Recorrer la lista..." },
        ]
    },
    lista_doble: {
        buttons: [
            { label: "Create", tooltip: "Crear una lista doblemente enlazada..." },
            { label: "Insert_First", tooltip: "Insertar al inicio..." },
            { label: "Insert_Last", tooltip: "Insertar al final..." },
            { label: "Insert_At", tooltip: "Insertar en una posición específica..." },
            { label: "Delete", tooltip: "Eliminar un nodo..." },
            { label: "Search", tooltip: "Buscar un nodo..." },
            { label: "Update", tooltip: "Actualizar un nodo..." },
            { label: "Clean", tooltip: "Borrar la lista..." },
            { label: "Traverse_F", tooltip: "Recorrer la lista hacia adelante..." },
            { label: "Traverse_B", tooltip: "Recorrer la lista hacia atrás..." },
        ]
    },
    lista_circular: {
        buttons: [
            { label: "Create", tooltip: "Crear una lista circular..." },
            { label: "Insert_First", tooltip: "Insertar al inicio..." },
            { label: "Insert_Last", tooltip: "Insertar al final..." },
            { label: "Insert_At", tooltip: "Insertar en una posición específica..." },
            { label: "Delete", tooltip: "Eliminar un nodo..." },
            { label: "Search", tooltip: "Buscar un nodo..." },
            { label: "Update", tooltip: "Actualizar un nodo..." },
            { label: "Clean", tooltip: "Borrar la lista..." },
            { label: "Traverse", tooltip: "Recorrer la lista..." },
        ]
    },
    lista_circular_doble: {
        buttons: [
            { label: "Create", tooltip: "Crear una lista circular doblemente enlazada..." },
            { label: "Insert_First", tooltip: "Insertar al inicio..." },
            { label: "Insert_Last", tooltip: "Insertar al final..." },
            { label: "Insert_At", tooltip: "Insertar en una posición específica..." },
            { label: "Delete", tooltip: "Eliminar un nodo..." },
            { label: "Search", tooltip: "Buscar un nodo..." },
            { label: "Update", tooltip: "Actualizar un nodo..." },
            { label: "Clean", tooltip: "Borrar la lista..." },
            { label: "Traverse_F", tooltip: "Recorrer la lista hacia adelante..." },
            { label: "Traverse_B", tooltip: "Recorrer la lista hacia atrás..." },
        ]
    },
    pila: {
        buttons: [
            { label: "Push", tooltip: "Apilar un elemento..." },
            { label: "Pop", tooltip: "Desapilar un elemento..." },
            { label: "Top", tooltip: "Obtener el elemento superior..." },
            { label: "Clean", tooltip: "Vaciar la pila..." },
        ]
    },
    cola: {
        buttons: [
            { label: "Enqueue", tooltip: "Encolar un elemento..." },
            { label: "Dequeue", tooltip: "Desencolar un elemento..." },
            { label: "Front", tooltip: "Obtener el primer elemento..." },
            { label: "Rear", tooltip: "Obtener el último elemento..." },
            { label: "Clean", tooltip: "Vaciar la cola..." },
        ]
    },
    cola_de_prioridad: {
        buttons: [
            { label: "Enqueue", tooltip: "Encolar un elemento con prioridad..." },
            { label: "Dequeue", tooltip: "Desencolar el elemento con mayor prioridad..." },
            { label: "Front", tooltip: "Obtener el primer elemento..." },
            { label: "Rear", tooltip: "Obtener el último elemento..." },
            { label: "Clean", tooltip: "Vaciar la cola de prioridad..." },
        ]
    },
    tabla_hash: {
        buttons: [
            { label: "Insert", tooltip: "Insertar un elemento con clave y valor..." },
            { label: "Update", tooltip: "Actualizar un valor existente..." },
            { label: "Delete", tooltip: "Eliminar un elemento por su clave..." },
            { label: "Search", tooltip: "Buscar un valor por su clave..." },
            { label: "Contains", tooltip: "Verificar si una clave existe..." },
            { label: "Resize", tooltip: "Redimensionar la tabla hash..." },
            { label: "Clean", tooltip: "Borrar la tabla hash..." },
            { label: "Traverse", tooltip: "Recorrer todos los elementos..." },
        ]
    },
    
    bst: {
        buttons: [
            { label: "Insert", tooltip: "Insertar un nodo en el BST..." },
            { label: "Delete", tooltip: "Eliminar un nodo del BST..." },
            { label: "Search", tooltip: "Buscar un nodo en el BST..." },
            { label: "Traverse", tooltip: "Recorrer el BST en diferentes órdenes..." },
            { label: "FindMin", tooltip: "Encontrar el mínimo..." },
            { label: "FindMax", tooltip: "Encontrar el máximo..." },
            { label: "Clean", tooltip: "Borrar el BST..." },
        ]
    },
    
    avl: {
        buttons: [
            { label: "Insert", tooltip: "Insertar un nodo en el AVL..." },
            { label: "Delete", tooltip: "Eliminar un nodo del AVL..." },
            { label: "Search", tooltip: "Buscar un nodo en el AVL..." },
            { label: "Traverse", tooltip: "Recorrer el AVL en diferentes órdenes..." },
            { label: "FindMin", tooltip: "Encontrar el mínimo..." },
            { label: "FindMax", tooltip: "Encontrar el máximo..." },
            { label: "Balance", tooltip: "Balancear el árbol AVL..." },
            { label: "Clean", tooltip: "Borrar el AVL..." },
        ]
    },
    
    roji_negro: {
        buttons: [
            { label: "Insert", tooltip: "Insertar un nodo en el árbol Rojo-Negro..." },
            { label: "Delete", tooltip: "Eliminar un nodo del árbol Rojo-Negro..." },
            { label: "Search", tooltip: "Buscar un nodo en el árbol Rojo-Negro..." },
            { label: "Traverse", tooltip: "Recorrer el árbol Rojo-Negro..." },
            { label: "FindMin", tooltip: "Encontrar el mínimo..." },
            { label: "FindMax", tooltip: "Encontrar el máximo..." },
            { label: "Clean", tooltip: "Borrar el árbol Rojo-Negro..." },
        ]
    },
    
    splay: {
        buttons: [
            { label: "Insert", tooltip: "Insertar un nodo en el árbol Splay..." },
            { label: "Delete", tooltip: "Eliminar un nodo del árbol Splay..." },
            { label: "Search", tooltip: "Buscar un nodo en el árbol Splay..." },
            { label: "Splay", tooltip: "Realizar la operación Splay..." },
            { label: "Clean", tooltip: "Borrar el árbol Splay..." },
        ]
    },

    heap: {
        buttons: [
            { label: "Insert", tooltip: "Insertar un elemento en el Heap..." },
            { label: "Delete", tooltip: "Eliminar un elemento del Heap..." },
            { label: "ExtractMin", tooltip: "Extraer el mínimo del Heap..." },
            { label: "ExtractMax", tooltip: "Extraer el máximo del Heap..." },
            { label: "Heapify", tooltip: "Aplicar Heapify..." },
            { label: "Clean", tooltip: "Borrar el Heap..." },
        ]
    },
    
    arbol_eneario: {
        buttons: [
            { label: "Insert", tooltip: "Insertar un nodo en el árbol N-ario..." },
            { label: "Delete", tooltip: "Eliminar un nodo del árbol N-ario..." },
            { label: "Search", tooltip: "Buscar un nodo en el árbol N-ario..." },
            // { label: "TraversePreorder", tooltip: "Recorrer en Preorden..." },
            // { label: "TraversePostorder", tooltip: "Recorrer en Postorden..." },
            // { label: "TraverseLevelorder", tooltip: "Recorrer por niveles..." },
            { label: "Traverse", tooltip: "Recorrer el eneario en diferentes órdenes..." },
            { label: "Clean", tooltip: "Borrar el árbol N-ario..." },
        ]
    },
    
    arbol_b: {
        buttons: [
            { label: "Insert", tooltip: "Insertar un nodo en el árbol B..." },
            { label: "Delete", tooltip: "Eliminar un nodo del árbol B..." },
            { label: "Search", tooltip: "Buscar un nodo en el árbol B..." },
            // { label: "TraverseLevelorder", tooltip: "Recorrer por niveles..." },
            // { label: "TraverseInorder", tooltip: "Recorrer en Inorden..." },
            { label: "Traverse", tooltip: "Recorrer el Árbol b en diferentes órdenes..." },
            { label: "Clean", tooltip: "Borrar el árbol B..." },
        ]
    },
    
    arbol_b_plus: {
        buttons: [
            { label: "Insert", tooltip: "Insertar un nodo en el árbol B+..." },
            { label: "Delete", tooltip: "Eliminar un nodo del árbol B+..." },
            { label: "Search", tooltip: "Buscar un nodo en el árbol B+..." },
            { label: "Traverse", tooltip: "Recorrer el Árbol b+ en diferentes órdenes..." },
            // { label: "TraverseLevelorder", tooltip: "Recorrer por niveles..." },
            // { label: "TraverseInorder", tooltip: "Recorrer en Inorden..." },
            { label: "Clean", tooltip: "Borrar el árbol B+..." },
        ]
    }
};
