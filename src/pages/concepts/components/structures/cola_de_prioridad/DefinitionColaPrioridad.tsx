import img1 from "../../../../../assets/images/definicion_cola_prioridad_1.jpg";
export function DefinitionColaPrioridad() {
    return (
        <div className="py-4 px-10">
            <h1 className="text-2xl font-extrabold mb-1 text-white">COLA DE PRIORIDAD</h1>
            <h1 className="text-sm text-red-400 mb-4">Estructura Lineal</h1>
            <hr className="mt-2 mb-4 border-red-500 border-t-2" />
            <div className="text-sm text-gray-300 leading-6">
                <h1 className="text-xl font-bold text-red-500 mb-3">Descripción</h1>
                <p className="mb-5">
                    Las colas de prioridad es una extensión de la estructura de
                    datos Cola. Se basan en el orden de salida de sus elementos:
                    en el orden de llegada y orden de prioridad; asi un elemento
                    que ingresa a la cola se posicionará al final del segmento
                    de elementos de su misma prioridad. Las colas de prioridad
                    permiten alterar el orden de salida de los elementos de una
                    cola:
                </p>
                <h1 className="mb-5">
                    ✨ No es necesario seguir un orden FIFO.
                </h1>
                <h1 className="mb-5">
                    ✨ El orden se puede basar en una función de comparación.
                </h1>
                <p className="mb-5">
                    Las operaciones de las colas de prioridad son las mismas que
                    las de las colas con un comportamiento diferente. Una cola
                    de prioridad es una cola a cuyos elementos se les ha
                    asignado una prioridad, de forma que el orden en que los
                    elementos son procesados sigue las siguientes reglas:
                </p>
                <h1 className="mb-5">
                    ✨ El elemento con mayor prioridad es procesado primero.
                </h1>
                <h1 className="mb-5">
                    ✨ Dos elementos con la misma prioridad son procesados según
                    el orden en que fueron introducidos en la cola.
                </h1>
                <h1 className="mb-5">
                    Así, si tenemos que la prioridad más alta es 0, y la más
                    baja es 3, la estructura se vería así:
                </h1>
                <img src={img1} alt="img 1" />
                <h1 className="mb-5">
                    La cola de prioridad cuenta con las mismas rutinas que la
                    estructura de cola genérica, con la salvedad que al encolar
                    elementos y desencolar elementos se debe de tomar en cuenta
                    su prioridad para su posicionamiento.
                </h1>
            </div>
        </div>
    );
}
