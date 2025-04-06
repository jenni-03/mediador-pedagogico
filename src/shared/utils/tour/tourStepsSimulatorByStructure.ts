import { Step } from "react-joyride";

export const tourStepsByStructure: Record<string, Step[]> = {
    secuencia: [
        {
            target: 'body',
            placement: 'center',
            content: `Para entrar en contexto, imagina una estantería con compartimentos numerados y limitados. 
                    Cada compartimento puede guardar un solo objeto, y no puedes agregar más de los que caben. 
                    Esta es la idea detrás de una secuencia.`,
        },
        {
            target: 'body',
            placement: 'center',
            content: `Formalmente, una secuencia es una estructura de datos lineal de tamaño fijo que almacena elementos en un orden específico, 
                    permitiendo acceder a ellos mediante su posición o índice.`,
        }
    ]
};

export const getTourSteps = (structureType: string): Step[] => [
    {
        target: 'body',
        placement: 'center',
        content: `¡Bienvenido al simulador de ${structureType}!
                Este espacio está diseñado para ayudarte a comprender de forma visual el funcionamiento de esta estructura de datos. 
                ¿Listo para comenzar?`,
        isFixed: true,
    },
    // pasos específicos
    ...(tourStepsByStructure[structureType] ?? []),
    {
        target: 'body',
        placement: 'center',
        content: `¡Genial! Ya que conoces la estructura, es momento de explorar cómo funciona el simulador. 
                A continuación, te mostraremos cada una de las secciones que lo componen y cómo interactúan entre sí.
                Y recuerda, si en algún momento quieres profundizar más sobre esta estructura, siempre puedes visitar su página de conceptos.
        `,
    },
    {
        target: '#structure-title',
        content: `Aquí se muestra el nombre de la estructura que estás simulando. 
                Los signos "<>" indican el tipo de dato que puede almacenar la estructura (enteros).`,
    },
    {
        target: '#structure-info',
        content: `En esta sección verás información clave de la estructura y otras propiedades importantes.
                Además, aquí se representa cómo se asigna la memoria para almacenar los datos.`,
    },
    {
        target: '#main-canvas',
        content: `Esta sección corresponde al lienzo principal del simulador. 
                Aquí podrás visualizar cómo se comporta la estructura al ejecutar las diferentes operaciones disponibles.`,
    },
    {
        target: "#command-buttons",
        content: `Aquí verás los comandos disponibles para interactuar con la estructura.
                Cada botón representa una operación propia de la estructura y al hacer clic en él, 
                se mostrará información útil sobre el funcionamiento y la sintáxis correcta de ese comando para su ejecución en la consola.`,
    },
    {
        target: '#console',
        content: `La consola es el medio principal de interacción con la estructura, en ella podrás escribir los comandos
                para manipular la estructura y recibir retroalimentación sobre su ejecución como advertencias o errores.`,
    },
    {
        target: '#execution-code',
        content: `En esta sección se mostrará el fragmento de código que corresponde a cada operación realizada.
                Esto te ayudará a comprender cómo se traduce cada acción en código real.`,
    },
    {
        target: 'body',
        placement: 'center',
        content: `¡Todo listo! Ahora es tu turno de experimentar, probar comandos y descubrir cómo se comporta la estructura. ¡Diviértete aprendiendo!.`,
    },
];