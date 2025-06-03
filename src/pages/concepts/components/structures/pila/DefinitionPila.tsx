import img1 from "../../../../../assets/images/definicion_pila_1.jpg";

export function DefinitionPila() {
    return (
        <div className="py-4 px-10">
            <h1 className="text-2xl font-extrabold mb-1 text-white">PILA</h1>
            <h1 className="text-sm text-red-400 mb-4">Estructura Lineal</h1>
            <hr className="mt-2 mb-4 border-red-500 border-t-2" />
            <div className="text-sm text-gray-300 leading-6">
                <h1 className="text-xl font-bold text-red-500 mb-3">
                    Descripción
                </h1>
                <p className="mb-5">
                    Una pila es una coleccion de datos que representa una
                    estructura lineal de datos en que se puede agregar o quitar
                    elementos únicamente por uno de los dos extremos. En
                    consecuencia, los elementos de una pila se eliminan en el
                    orden inverso al que se insertaron. Debido a está
                    característica, se le conoce como estructura LIFO (last
                    input, first output).
                </p>
                <p className="mb-5">
                    Las pilas son estructuras de datos que tienes dos
                    operaciones básicas: apilar(para insertar un elemento) y
                    desapilar(para extraer un elemento). Su característica
                    fundamental es que al extraer se obtiene siempre el último
                    elemento que acaba de insertarse. Por esta razón también se
                    conocen como estructuras de datos LIFO (del inglés Last In
                    First Out). Una posible implementación mediante listas
                    enlazadas sería insertando y extrayendo siempre por el
                    principio de la lista.
                </p>
                <img src={img1} alt="img 1" />
            </div>
        </div>
    );
}
