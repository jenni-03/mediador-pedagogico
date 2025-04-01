export function OperationArbolBinario() {
    return (
        <div className="bg-white text-gray-900 min-h-screen py-10 px-4 md:px-10 lg:px-20">
            <h1 className="text-3xl md:text-4xl font-extrabold text-red-600 mb-1 uppercase">
                Operaciones
            </h1>
            <h2 className="text-sm md:text-base text-gray-600 mb-6">Árbol Binario</h2>
            <hr className="border-t-2 border-red-600 mb-10 w-24 md:w-32" />

            {/* INSERTAR */}
            <section className="mb-12">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">Insertar</h2>
                <p className="text-sm md:text-base text-gray-800 mb-4">
                    Para insertar un nuevo nodo en un árbol binario, se parte desde la raíz y se compara el valor a insertar:
                </p>
                <ul className="list-disc list-inside text-sm md:text-base text-gray-800 space-y-2 mb-6">
                    <li>Si el valor es menor, se recorre el subárbol izquierdo.</li>
                    <li>Si es mayor, se recorre el subárbol derecho.</li>
                    <li>Este proceso se repite hasta encontrar un nodo nulo donde se pueda insertar.</li>
                </ul>
                <p className="text-sm md:text-base text-gray-800 italic">
                    La estructura del árbol se mantiene balanceada si se insertan los nodos de forma ordenada.
                </p>
            </section>

            {/* BUSCAR */}
            <section className="mb-12">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">Buscar</h2>
                <p className="text-sm md:text-base text-gray-800 mb-4">
                    Para buscar un valor en un árbol binario:
                </p>
                <ul className="list-disc list-inside text-sm md:text-base text-gray-800 space-y-2 mb-6">
                    <li>Se compara el valor buscado con el nodo actual.</li>
                    <li>Si coincide, se ha encontrado.</li>
                    <li>Si es menor, se busca en el subárbol izquierdo; si es mayor, en el derecho.</li>
                </ul>
                <p className="text-sm md:text-base text-gray-800 italic">
                    Este proceso tiene eficiencia logarítmica si el árbol está balanceado.
                </p>
            </section>

            {/* EDITAR */}
            <section className="mb-12">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">Editar</h2>
                <p className="text-sm md:text-base text-gray-800 mb-4">
                    Para editar un nodo, se debe primero buscarlo y luego modificar su valor. 
                </p>
                <p className="text-sm md:text-base text-gray-800 mb-4">
                    ⚠️ <span className="text-red-600 font-medium">Importante:</span> cambiar el valor puede alterar la propiedad del árbol binario de búsqueda. 
                    Por lo tanto, en algunos casos es preferible eliminar el nodo y volver a insertarlo con el nuevo valor.
                </p>
            </section>

            {/* ELIMINAR */}
            <section className="mb-12">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">Eliminar</h2>
                <p className="text-sm md:text-base text-gray-800 mb-4">
                    Eliminar un nodo en un árbol binario tiene tres casos:
                </p>
                <ul className="list-disc list-inside text-sm md:text-base text-gray-800 space-y-2 mb-4">
                    <li>🔹 Nodo hoja: simplemente se elimina.</li>
                    <li>🔹 Nodo con un solo hijo: se reemplaza por su hijo.</li>
                    <li>🔹 Nodo con dos hijos: se reemplaza por su sucesor inorden (el menor del subárbol derecho).</li>
                </ul>
                <p className="text-sm md:text-base text-gray-800 italic">
                    Es esencial mantener el orden del árbol tras la eliminación para conservar su eficiencia.
                </p>
            </section>
        </div>
    );
}
