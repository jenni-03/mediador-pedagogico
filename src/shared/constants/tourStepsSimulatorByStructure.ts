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
                "En la consola puedes realizar todas las operaciones de una pila, tales como, apilar (push), desapilar(pop), y consultar el tope de la pila(getTop).",
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
                "Este comando sirve para apilar un 4.",
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
                "Como puedes ver, el tamaño de la pila es 1, ya que se insertó el número 2, que es el primer elemento de esta.",
        },
        {
            id: "memory-visualization",
            type: "element",
            description:
                "Aquí puedes observar cómo se asigna la memoria para almacenar los datos de la pila y cómo se calcula el espacio necesario para cada uno de sus elementos.",
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
