import img1 from "../../../../../assets/images/operacion_encolar_1.png";

export function OperationCola() {
    return (
        <div className="py-4 px-10">
            <h1 className="text-2xl font-bold mb-1">OPERACIONES</h1>
            <h1 className="text-sm text-gray-500 mb-3">Secuencia</h1>
            <hr className="mt-2 mb-4 border-red-500 border-t-2" />
            <div>
                <h1 className="text-2xl font-bold mb-3">Encolar (Enqueue)</h1>
                <p className="text-gray-700 text-sm mb-5">
                    Es la operación que agrega un elemento al final de la cola.
                    Si la cola tiene espacio disponible, el nuevo elemento se
                    almacena en la posición indicada por rear y este índice se
                    incrementa.
                </p>
                <img src={img1} alt="img 1" className="mx-auto w-40 sm:w-96 md:w-96"/>
                <p className="text-sm text-gray-800 my-3 font-bold leading-6">
                    Pasos del proceso:
                </p>
                <ul className="space-y-3">
                    <li className="text-sm text-gray-800 leading-6">
                        ✨ Verificar si la cola está llena (en caso de tamaño
                        fijo). Si está llena, se lanza un error de
                        desbordamiento (overflow).
                    </li>
                    <li className="text-sm text-gray-800 leading-6">
                        ✨ Si la cola está vacía (front == -1), inicializar
                        front = 0.
                    </li>
                    <li className="text-sm text-gray-800 leading-6">
                        ✨ Incrementar rear en 1 (rear = rear + 1).
                    </li>
                    <li className="text-sm text-gray-800 leading-6">
                        ✨ Insertar el nuevo elemento en queue [rear].
                    </li>
                </ul>
            </div>
            <div>
                <h1 className="text-2xl font-bold my-4">Decolar (Dequeue)</h1>
                <p className="text-gray-700 text-sm mb-5">
                    Es la operación que elimina el primer elemento de la cola.
                    Se accede al elemento en la posición front, se elimina y
                    front se incrementa en 1.
                </p>
                <p className="text-sm text-gray-800 my-3 font-bold leading-6">
                    Pasos del proceso:
                </p>
                <ul className="space-y-3">
                    <li className="text-sm text-gray-800 leading-6">
                        ✨ Verificar si la cola está vacía (front == -1 o front
                        rear). Si está vacía, se lanza un error de
                        subdesbordamiento (underflow).
                    </li>
                    <li className="text-sm text-gray-800 leading-6">
                        ✨ Guardar el elemento en queue[front] para devolverlo.
                    </li>
                    <li className="text-sm text-gray-800 leading-6">
                        ✨ Incrementar front en 1 (front = front + 1).
                    </li>
                    <li className="text-sm text-gray-800 leading-6">
                        ✨ Si front supera rear, restablecer la cola (front =
                        rear = -1).
                    </li>
                </ul>
            </div>
            <div>
                <h1 className="text-2xl font-bold my-4">
                    Consulta del Frente (Front/Peek)
                </h1>
                <p className="text-gray-700 text-sm mb-5">
                    Es la operación que permite ver el primer elemento de la
                    cola sin eliminarlo.
                </p>
                <p className="text-sm text-gray-800 my-3 font-bold leading-6">
                    Pasos del proceso:
                </p>
                <ul className="space-y-3">
                    <li className="text-sm text-gray-800 leading-6">
                        ✨ Verificar si la cola está vacía (front == -1).
                    </li>
                    <li className="text-sm text-gray-800 leading-6">
                        ✨ Devolver el valor en queue[front] sin modificar la
                        estructura.
                    </li>
                </ul>
            </div>
            <div>
                <h1 className="text-2xl font-bold my-4">
                    Consulta del Final (Rear/Peek Rear)
                </h1>
                <p className="text-gray-700 text-sm mb-5">
                    Es la operación que permite ver el último elemento de la
                    cola sin eliminarlo.
                </p>
                <p className="text-sm text-gray-800 my-3 font-bold leading-6">
                    Pasos del proceso:
                </p>
                <ul className="space-y-3">
                    <li className="text-sm text-gray-800 leading-6">
                        ✨ Verificar si la cola está vacía (front == -1).
                    </li>
                    <li className="text-sm text-gray-800 leading-6">
                        ✨ Devolver el valor en queue[front] sin modificar la
                        estructura.
                    </li>
                </ul>
            </div>
        </div>
    );
}
