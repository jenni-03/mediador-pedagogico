import img1 from "../../../../../assets/images/operacion_encolar_1.png";

export function OperationCola() {
    return (
        <div className="py-4 px-10">
            <h1 className="text-2xl font-extrabold mb-1 text-white">
                OPERACIONES
            </h1>
            <h1 className="text-sm text-red-400 mb-3">Cola</h1>
            <hr className="mt-2 mb-4 border-red-500 border-t-2" />
            <div className="text-sm text-gray-300 leading-6">
                <h1 className="text-2xl font-bold text-red-500 mb-3">
                    Encolar (Enqueue)
                </h1>
                <p className="mb-5">
                    Es la operación que agrega un elemento al final de la cola.
                    Si la cola tiene espacio disponible, el nuevo elemento se
                    almacena en la posición indicada por rear y este índice se
                    incrementa.
                </p>
                <img
                    src={img1}
                    alt="img 1"
                    className="mx-auto w-40 sm:w-96 md:w-96 lg:w-[40rem]"
                />
                <p className="my-3 font-bold">Pasos del proceso:</p>
                <ul className="space-y-3">
                    <li>
                        ✨ Verificar si la cola está llena (en caso de tamaño
                        fijo). Si está llena, se lanza un error de
                        desbordamiento (overflow).
                    </li>
                    <li>
                        ✨ Si la cola está vacía (front == -1), inicializar
                        front = 0.
                    </li>
                    <li>✨ Incrementar rear en 1 (rear = rear + 1).</li>
                    <li>✨ Insertar el nuevo elemento en queue [rear].</li>
                </ul>
            </div>
            <div className="text-sm text-gray-300 leading-6">
                <h1 className="text-2xl font-bold text-red-500 my-4">
                    Decolar (Dequeue)
                </h1>
                <p className="mb-5">
                    Es la operación que elimina el primer elemento de la cola.
                    Se accede al elemento en la posición front, se elimina y
                    front se incrementa en 1.
                </p>
                <p className="my-3 font-bold">Pasos del proceso:</p>
                <ul className="space-y-3">
                    <li>
                        ✨ Verificar si la cola está vacía (front == -1 o front
                        rear). Si está vacía, se lanza un error de
                        subdesbordamiento (underflow).
                    </li>
                    <li>
                        ✨ Guardar el elemento en queue[front] para devolverlo.
                    </li>
                    <li>✨ Incrementar front en 1 (front = front + 1).</li>
                    <li>
                        ✨ Si front supera rear, restablecer la cola (front =
                        rear = -1).
                    </li>
                </ul>
            </div>
            <div className="text-sm text-gray-300 leading-6">
                <h1 className="text-2xl font-bold text-red-500 my-4">
                    Consulta del Frente (Front/Peek)
                </h1>
                <p className="mb-5">
                    Es la operación que permite ver el primer elemento de la
                    cola sin eliminarlo.
                </p>
                <p className="my-3 font-bold">Pasos del proceso:</p>
                <ul className="space-y-3">
                    <li>✨ Verificar si la cola está vacía (front == -1).</li>
                    <li>
                        ✨ Devolver el valor en queue[front] sin modificar la
                        estructura.
                    </li>
                </ul>
            </div>
            <div className="text-sm text-gray-300 leading-6">
                <h1 className="text-2xl font-bold text-red-500 my-4">
                    Consulta del Final (Rear/Peek Rear)
                </h1>
                <p className="mb-5">
                    Es la operación que permite ver el último elemento de la
                    cola sin eliminarlo.
                </p>
                <p className="my-3 font-bold">Pasos del proceso:</p>
                <ul className="space-y-3">
                    <li>✨ Verificar si la cola está vacía (front == -1).</li>
                    <li>
                        ✨ Devolver el valor en queue[front] sin modificar la
                        estructura.
                    </li>
                </ul>
            </div>
        </div>
    );
}
