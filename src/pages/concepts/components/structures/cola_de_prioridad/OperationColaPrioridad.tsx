import img1 from "../../../../../assets/images/operacion_encolar_1.png";

export function OperationColaPrioridad() {
    return (
        <div className="py-4 px-10">
            <h1 className="text-2xl font-bold mb-1">OPERACIONES</h1>
            <h1 className="text-sm text-gray-500 mb-3">Secuencia</h1>
            <hr className="mt-2 mb-4 border-red-500 border-t-2" />
            <div>
                <h1 className="text-2xl font-bold mb-3">
                    Encolar (Insertar un elemento con prioridad)
                </h1>
                <p className="text-gray-700 text-sm mb-5">
                    La operación de encolar (enqueue) agrega un nuevo elemento a
                    la cola con una prioridad específica.
                </p>
                <img
                    src={img1}
                    alt="img 1"
                    className="mx-auto w-40 sm:w-96 md:w-96"
                />
                <p className="text-sm text-gray-800 my-3 font-bold leading-6">
                    Pasos del proceso:
                </p>
                <ul className="space-y-3">
                    <li className="text-sm text-gray-800 leading-6">
                        ✨ Se recibe un elemento junto con su nivel de
                        prioridad.
                    </li>
                    <li className="text-sm text-gray-800 leading-6">
                        ✨ Se inserta el elemento en la posición correcta según
                        su prioridad.
                    </li>
                    <li className="text-sm text-gray-800 leading-6">
                        ✨ Si dos elementos tienen la misma prioridad, se
                        mantiene el orden de llegada (FIFO dentro del mismo
                        nivel de prioridad).
                    </li>
                </ul>
                <h1 className="text-xl font-bold my-4">
                    🔹Implementación con lista ordenada
                </h1>
                <p className="text-gray-700 text-sm">
                    Insertar en la posición correcta, manteniendo la ordenación
                    por prioridad.
                </p>
                <h1 className="text-xl font-bold my-4">
                    🔹Complejidad temporal
                </h1>
                <p className="text-gray-700 text-sm">
                    O(n) (peor caso, insertar en la posición correcta).
                </p>
            </div>
            <div>
                <h1 className="text-2xl font-bold my-4">
                    Decolar (Eliminar el elemento con mayor prioridad)
                </h1>
                <p className="text-gray-700 text-sm mb-5">
                    La operación de decolar (dequeue) extrae y devuelve el
                    elemento con la prioridad más alta.
                </p>
                <p className="text-sm text-gray-800 my-3 font-bold leading-6">
                    Pasos del proceso:
                </p>
                <ul className="space-y-3">
                    <li className="text-sm text-gray-800 leading-6">
                        ✨ Se identifica el elemento con la mayor prioridad.
                    </li>
                    <li className="text-sm text-gray-800 leading-6">
                        ✨ Se elimina dicho elemento de la cola.
                    </li>
                    <li className="text-sm text-gray-800 leading-6">
                        ✨ Si hay varios elementos con la misma prioridad, se
                        elimina el que entró primero (FIFO).
                    </li>
                </ul>
                <h1 className="text-xl font-bold my-4">
                    🔹Implementación con lista ordenada
                </h1>
                <p className="text-gray-700 text-sm">
                    Se elimina el primer elemento O(1).
                </p>
                <h1 className="text-xl font-bold my-4">
                    🔹Complejidad temporal
                </h1>
                <p className="text-gray-700 text-sm mb-5">O(1).</p>
            </div>
            <div>
                <h1 className="text-2xl font-bold my-4">
                    Consulta del Frente (Front/Peek)
                </h1>
                <p className="text-gray-700 text-sm mb-5">
                    Esta operación permite obtener el elemento con la mayor
                    prioridad sin eliminarlo.
                </p>
                <p className="text-sm text-gray-800 my-3 font-bold leading-6">
                    Pasos del proceso:
                </p>
                <ul className="space-y-3">
                    <li className="text-sm text-gray-800 leading-6">
                        ✨ Se busca el elemento con mayor prioridad en la cola.
                    </li>
                    <li className="text-sm text-gray-800 leading-6">
                        ✨ Se devuelve sin modificar la estructura.
                    </li>
                </ul>
                <h1 className="text-xl font-bold my-4">
                    🔹Implementación con lista ordenada
                </h1>
                <p className="text-gray-700 text-sm">
                    Acceder al primer elemento O(1).
                </p>
                <h1 className="text-xl font-bold my-4">
                    🔹Complejidad temporal
                </h1>
                <p className="text-gray-700 text-sm mb-5">O(1).</p>
            </div>
            <div>
                <h1 className="text-2xl font-bold my-4">
                    Consulta del Final (Rear/Peek Rear)
                </h1>
                <p className="text-gray-700 text-sm mb-5">
                    Permite obtener el elemento con menor prioridad sin
                    eliminarlo.
                </p>
                <p className="text-sm text-gray-800 my-3 font-bold leading-6">
                    Pasos del proceso:
                </p>
                <ul className="space-y-3">
                    <li className="text-sm text-gray-800 leading-6">
                        ✨ Se busca el elemento con prioridad más baja.
                    </li>
                    <li className="text-sm text-gray-800 leading-6">
                        ✨ Se devuelve sin modificar la estructura.
                    </li>
                </ul>
                <h1 className="text-xl font-bold my-4">
                    🔹Implementación con lista ordenada
                </h1>
                <p className="text-gray-700 text-sm">
                    Acceder al último  elemento O(1).
                </p>
                <h1 className="text-xl font-bold my-4">
                    🔹Complejidad temporal
                </h1>
                <p className="text-gray-700 text-sm mb-5">O(1).</p>
            </div>
        </div>
    );
}
