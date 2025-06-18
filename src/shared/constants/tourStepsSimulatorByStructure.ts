import { TourStep } from "./tourDescriptions";

export const tourStepsByStructure: Record<string, TourStep[]> = {
    secuencia: [
        {
            type: "info",
            description: `Para entrar en contexto, imagina una estantería con compartimentos numerados y limitados. 
                    Cada compartimento puede guardar un solo objeto, y no puedes agregar más de los que caben. 
                    Esta es la idea detrás de una secuencia.`,
        },
        {
            type: "info",
            description: `Formalmente, una secuencia es una estructura de datos lineal de tamaño fijo que almacena elementos en un orden específico, 
                    permitiendo acceder a ellos mediante su posición o índice.`,
        },
    ],
    pila: [
        {
            type: "info",
            description: `Imagina una pila de platos en una cocina. Solo puedes colocar un plato encima del último que agregaste, 
                        y solo puedes retirar el plato que está en la parte superior. No puedes sacar uno del medio sin quitar primero los que están encima. 
                        Esa es la idea detrás de una pila.`,
        },
        {
            type: "info",
            description: `Formalmente, una pila es una estructura de datos lineal que sigue el principio LIFO (Last In, First Out), 
                        es decir, el último elemento que se inserta es el primero en salir. Solo se permite el acceso al elemento en el tope de la pila.`,
        },
    ],
    cola: [
        {
            type: "info",
            description: `Visualicemos una fila de personas esperando para comprar una entrada de cine. Las personas se forman en el orden en que llegan y solo
                        pueden llegar a comprar su entrada en ese mismo orden, sin saltarse ni adelantar a otros. A medida que cada persona compra su entrada, 
                        el siguiente en la fila se mueve hacia adelante. Esa es la idea detrás de una cola.`,
        },
        {
            type: "info",
            description: `Formalmente, una cola es una estrucura de datos lineal que sigue el principio FIFO (First In, First Out), 
                        donde el primer elemento en ingresar es también el primero en ser removido. Los elementos se agregan al final de la cola
                        y se eliminan al principio, asegurando un orden de procesamiento justo y predecible.`,
        },
    ],
    "cola de prioridad": [
        {
            type: "info",
            description: `Imagina una sala de emergencias donde los pacientes no son atendidos por orden de llegada, sino según la gravedad de su condición. 
                        Un paciente en estado crítico será atendido antes que alguien con una dolencia menor, incluso si llegó después. 
                        Esa es la idea básica detrás de una cola de prioridad.`,
        },
        {
            type: "info",
            description: `Una cola de prioridad es una estructura de datos donde cada elemento tiene una prioridad asociada. 
                        A diferencia de una cola tradicional (FIFO), los elementos se ingresan a la cola según su prioridad, no su orden de llegada. 
                        El elemento con la mayor prioridad es el primero en ser procesado.`,
        },
        {
            type: "info",
            description: `Técnicamente, al insertar un elemento (enqueue), este se coloca en una posición determinada por su prioridad.
                        Al eliminar un elemento (dequeue), se remueve el que tenga la prioridad más alta.`,
        },
    ],
    lista_simplemente_enlazada: [
        {
            type: "info",
            description: `Imagina que estás en una búsqueda del tesoro. No te dan un mapa con todas las ubicaciones a la vez. En su lugar, comienzas con una sola pista. 
                        Esta primera pista contiene una pequeña parte del acertijo y, lo más importante, te dice dónde encontrar la siguiente pista.
                        Al llegar a esa segunda ubicación, encuentras otro fragmento del acertijo y la ubicación de la tercera pista.`,
        },
        {
            type: "info",
            description: `Continúas este proceso, siguiendo el rastro de una pista a la siguiente, hasta que llegas a la última, 
                        que te revela la ubicación del tesoro. Solo puedes avanzar en una dirección: de tu pista actual a la siguiente. No hay forma de saber cuál fue la pista anterior basándote en la que tienes en la mano.
                        Esa es la idea detrás de una lista simplemente enlazada.`
        },
        {
            type: "info",
            description: `Formalmente, una lista simplemente enlazada es una estructura de datos dinámica y lineal compuesta por una secuencia de elementos llamados nodos.
                        Cada nodo contiene un valor (información a almacenar) y un único puntero a la dirección del siguiente nodo. Para saber donde empezar, se mantiene una referencia al primer nodo, 
                        conocido como cabeza de la lista. El último nodo de la lista es especial, su puntero no apunta a nada, indicando el final de la cadena.`,
        },
    ],
    lista_doblemente_enlazada: [
        {
            type: "info",
            description: `Pensemos en un tren de pasajeros. Cada vagón está conectado con el que tiene delante y con el que tiene detrás. 
                        Si estás en un vagón, puedes caminar hacia el siguiente para ir hacia la locomotora o caminar hacia el vagón anterior para ir hacia el final del tren.`,
        },
        {
            type: "info",
            description: `Cada vagón conoce a su vecino inmediato en ambas direcciones. Esto te da la libertad de moverte por todo el tren hacia adelante o hacia atrás sin tener que volver al inicio. 
                        Si quisieras desenganchar un vagón, solo necesitarias saber cuáles son sus 2 vecinos directos (el de adelante y el de atrás) para volver a conectar la cadena sin romper el tren.`
        },
        {
            type: "info",
            description: `Formalmente, una lista doblemente enlazada, al igual que su contraparte simple, es una estructura de datos dinámica y lineal compuesta por una secuencia nodos.
                        Cada nodo contiene un valor, un puntero al siguiente nodo y otro puntero que apunta al nodo anterior en la secuencia.
                        Esta estructura de doble enlace permite que la lista sea recorrida de manera eficiente en ambas direcciones: Desde la cabeza hasta la cola y visceversa.`,
        },
    ],
};

export const tourStepsCommands: Record<string, TourStep[]> = {
    secuencia: [
        {
            id: "console",
            description:
                "En la consola puedes realizar todas las operaciones de una secuencia, tales como, crear, insertar, eliminar, modificar y consultar.",
            type: "element",
        },
        {
            id: "console",
            type: "action",
        },
        {
            id: "inputConsola",
            text: "create(7);",
            type: "write",
        },
        {
            id: "console",
            description:
                "Este comando sirve para crear una secuencia con un tamaño de 7.",
            type: "element",
        },
        {
            id: "inputConsola",
            type: "enter",
        },
        {
            id: "main-canvas",
            type: "element",
            description:
                "Esta es la estructura secuencia ya creada, ahora puedes usarla para insertar, eliminar o modificar elementos.",
        },
        {
            id: "info-cards",
            type: "element",
            description:
                "Como puedes ver, el tamaño de la secuencia es 0, ya que aún no se ha insertado ningún valor. Sin embargo, tiene capacidad para almacenar hasta 7 elementos, los cuales por ahora son nulos.",
        },
        {
            id: "memory-visualization",
            type: "element",
            description:
                "Aquí puedes observar cómo se asigna la memoria para almacenar los datos de la secuencia y cómo se calcula el espacio necesario para cada uno de sus elementos.",
        },
    ],
    pila: [
        {
            id: "console",
            description:
                "En la consola puedes realizar todas las operaciones de una pila, tales como, apilar (push), desapilar (pop), y consultar el tope de la pila (getTop).",
            type: "element",
        },
        {
            id: "console",
            type: "action",
        },
        {
            id: "inputConsola",
            text: "push(4);",
            type: "write",
        },
        {
            id: "console",
            description:
                "Este comando sirve para apilar un elemento, en este caso, el número 4.",
            type: "element",
        },
        {
            id: "inputConsola",
            type: "enter",
        },
        {
            id: "main-canvas",
            type: "element",
            description:
                "Esta es la estructura pila con su primer elemento, el número 4, ahora puedes usarla para apilar, desapilar y consultar el tope de la pila.",
        },
        {
            id: "info-cards",
            type: "element",
            description:
                "Como puedes ver, el tamaño de la pila es 1, ya que se insertó el número 4, que es el primer elemento de esta.",
        },
        {
            id: "memory-visualization",
            type: "element",
            description:
                "Aquí puedes observar cómo se asigna la memoria para almacenar los datos de la pila y cómo se calcula el espacio necesario para cada uno de sus elementos.",
        },
    ],
    cola: [
        {
            id: "console",
            description:
                "En la consola puedes realizar todas las operaciones de una cola, tales como, encolar (enqueue), decolar (dequeue), y consultar la cabeza de la cola (getFront).",
            type: "element",
        },
        {
            id: "console",
            type: "action",
        },
        {
            id: "inputConsola",
            text: "enqueue(10);",
            type: "write",
        },
        {
            id: "console",
            description:
                "Este comando sirve para encolar un elemento, en este caso, el número 10.",
            type: "element",
        },
        {
            id: "inputConsola",
            type: "enter",
        },
        {
            id: "main-canvas",
            type: "element",
            description:
                "Esta es la estructura cola con su elemento recién encolado, puedes usarla para ejecutar las diferentes operaciones mencionadas anteriormente.",
        },
        {
            id: "info-cards",
            type: "element",
            description:
                "Como puedes ver, el tamaño de la cola es 1, ya que se insertó el número 10, correspondiente al único elemento en esta.",
        },
    ],
    "cola de prioridad": [
        {
            id: "console",
            description:
                "En la consola puedes realizar todas las operaciones de una cola de prioridad, tales como, encolar por prioridad (enqueue), decolar (dequeue), y consultar la cabeza de la cola (getFront).",
            type: "element",
        },
        {
            id: "console",
            type: "action",
        },
        {
            id: "inputConsola",
            text: "enqueue(10,3);",
            type: "write",
        },
        {
            id: "console",
            description:
                "Este comando sirve para encolar un elemento, en este caso, el número 10 con una prioridad de 3.",
            type: "element",
        },
        {
            id: "inputConsola",
            type: "enter",
        },
        {
            id: "main-canvas",
            type: "element",
            description:
                "Esta es la estructura cola de prioridad con su elemento recién encolado, puedes usarla para ejecutar las diferentes operaciones mencionadas anteriormente.",
        },
        {
            id: "info-cards",
            type: "element",
            description:
                "Como puedes ver, el tamaño de la cola es 1, ya que se insertó el número 10, correspondiente al único elemento en esta.",
        },
    ],
    lista_simplemente_enlazada: [
        {
            id: "console",
            description:
                "En la consola puedes realizar todas las operaciones de una lista simple, tales como, inserción y eliminación de elementos desde diferentes posiciones, y consultar si un elemento se encuentra en la lista.",
            type: "element",
        },
        {
            id: "console",
            type: "action",
        },
        {
            id: "inputConsola",
            text: "insertLast(30);",
            type: "write",
        },
        {
            id: "console",
            description:
                "Este comando sirve para insertar un elemento al final de la lista, en este caso, el número 30.",
            type: "element",
        },
        {
            id: "inputConsola",
            type: "enter",
        },
        {
            id: "main-canvas",
            type: "element",
            description:
                "Esta es la lista con su elemento recién insertado, puedes usarla para ejecutar las diferentes operaciones mencionadas anteriormente.",
        },
        {
            id: "info-cards",
            type: "element",
            description:
                "Como puedes ver, el tamaño de la lista es 1, ya que se insertó el número 30, correspondiente al único elemento en esta.",
        },
    ],
    lista_doblemente_enlazada: [
        {
            id: "console",
            description:
                "En la consola puedes realizar todas las operaciones de una lista doble, tales como, inserción y eliminación de elementos desde diferentes posiciones, y consultar si un elemento se encuentra en la lista.",
            type: "element",
        },
        {
            id: "console",
            type: "action",
        },
        {
            id: "inputConsola",
            text: "insertFirst(50);",
            type: "write",
        },
        {
            id: "console",
            description:
                "Este comando sirve para insertar un elemento al inicio de la lista, en este caso, el número 50.",
            type: "element",
        },
        {
            id: "inputConsola",
            type: "enter",
        },
        {
            id: "main-canvas",
            type: "element",
            description:
                "Esta es la lista con su elemento recién insertado, puedes usarla para ejecutar las diferentes operaciones mencionadas anteriormente.",
        },
        {
            id: "info-cards",
            type: "element",
            description:
                "Como puedes ver, el tamaño de la lista es 1, ya que se insertó el número 50, correspondiente al único elemento en esta.",
        },
    ],
};

export const getTourSteps = (structureType: string): TourStep[] => [
    {
        type: "info",
        description: `¡Bienvenido al simulador de ${structureType}!
                Este espacio está diseñado para ayudarte a comprender de forma visual el funcionamiento de esta estructura de datos. 
                ¿Listo para comenzar?`,
    },
    // pasos específicos
    ...(tourStepsByStructure[structureType] ?? []),
    {
        type: "info",
        description: `¡Genial! Ya que conoces la estructura, es momento de explorar cómo funciona el simulador. 
                A continuación, te mostraremos cada una de las secciones que lo componen y cómo interactúan entre sí.
                Y recuerda, si en algún momento quieres profundizar más sobre esta estructura, siempre puedes visitar su página de conceptos.
        `,
    },
    {
        id: "structure-title",
        type: "element",
        description: `Aquí se muestra el nombre de la estructura que estás simulando. 
                Los signos "<>" indican el tipo de dato que puede almacenar la estructura (enteros).`,
    },
    {
        id: "structure-info",
        type: "element",
        description: `En esta sección verás información clave de la estructura y otras propiedades importantes.
                Además, aquí se representa cómo se asigna la memoria para almacenar los datos.`,
    },
    {
        id: "main-canvas",
        type: "element",
        description: `Esta sección corresponde al lienzo principal del simulador. 
                Aquí podrás visualizar cómo se comporta la estructura al ejecutar las diferentes operaciones disponibles.`,
    },
    {
        id: "command-buttons",
        type: "element",
        description: `Aquí verás los comandos disponibles para interactuar con la estructura.
                Cada botón representa una operación propia de la estructura y al hacer click en él, 
                se mostrará información útil sobre el funcionamiento y la sintáxis correcta de ese comando para su ejecución en la consola.`,
    },
    {
        id: "console",
        type: "element",
        description: `La consola es el medio principal de interacción con la estructura, en ella podrás escribir los comandos
                para manipular la estructura y recibir retroalimentación sobre su ejecución como advertencias o errores.`,
    },
    ...(tourStepsCommands[structureType] ?? []),
    {
        id: "execution-code",
        type: "element",
        description: `En esta sección se mostrará el fragmento de código que corresponde a cada operación realizada.
                Esto te ayudará a comprender cómo se traduce cada acción en código real.`,
    },
    {
        type: "info",
        description: `¡Todo listo! Ahora es tu turno de experimentar, probar comandos y descubrir cómo se comporta la estructura. ¡Diviértete aprendiendo!.`,
    },
];
