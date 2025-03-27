import img1 from "../../../../../assets/images/definicion_secuencia_1.jpg";
import img2 from "../../../../../assets/images/definicion_secuencia_2.jpg";
export function DefinitionSecuencia() {
    return (
        <div className="py-4 px-10">
            <h1 className="text-2xl font-bold mb-1">SECUENCIA</h1>
            <h1 className="text-sm text-gray-500 mb-3">Estructura Lineal</h1>
            <hr className="mt-2 mb-4 border-red-500 border-t-2" />
            <div>
                <h1 className="text-xl font-bold mb-3">Descripción</h1>
                <p className="text-gray-800 text-sm mb-5 leading-6">
                    Son estructuras de datos que, una vez definidas, no pueden
                    ser cambiadas por otras de otra naturaleza, o de diferente
                    tamaño. Este tipo de estructuras no se pueden utilizar para
                    problemas donde se requiera un tamaño de almacenamiento
                    variable al momento de la ejecución.
                </p>
                <p className="text-gray-800 text-sm mb-5 leading-6">
                    Una Secuencia es una lista contigua (físicamente inclusive)
                    de datos del mismo tipo que son accesibles por un índice, es
                    la representación dentro del componente de un vector en
                    lenguaje JAVA. Esta estructura se encuentra clasificada como
                    estática lineal, debido a que el tamaño definido al crear la
                    Estructura no se modifica y representa un espacio de
                    almacenamiento de datos denominados elementos que se
                    encuentran almacenados de forma sucesiva dentro de la
                    estructura.
                </p>
                <img src={img1} alt="img 1" />
                <h1 className="text-xl font-bold mb-3">Características</h1>
                <p className="text-gray-800 text-sm mb-5 leading-6">
                    Almacena sus datos de manera consecutiva, por lo que entre
                    la primera posición de la Secuencia (posición cero) y la
                    última posición (última posición donde exista un dato) no se
                    encuentran posiciones nulas, lo que si puede ocurrir en un
                    vector tradicional donde no necesariamente los datos son
                    almacenados secuencialmente. Esta característica permite
                    examinar los datos almacenados dentro de la Secuencia sin
                    tener que recorrer toda la capacidad de la estructura.
                </p>
                <p className="text-gray-800 text-sm mb-5 leading-6">
                    Puede almacenar a N elementos del mismo tipo, permite
                    seleccionar a cada uno de ellos. Así se distinguen dos
                    partes:
                </p>
                <h1 className="text-gray-800 text-sm mb-5 leading-6">
                    ✨ Elementos (valores que se almacenan en c/u de las
                    casillas)
                </h1>
                <h1 className="text-gray-800 text-sm mb-5 leading-6">
                    ✨ Los índices (Permiten hacer referencia a los elementos).
                </h1>
                <img src={img2} alt="img 1" />
                <ul className="space-y-3">
                    {[
                        "En la ejecución del programa, se reservan tantas posiciones como el tamaño definido de la Secuencia, siendo cada posición del tamaño requerido por el tipo de dato de la estructura.",
                        "El primer elemento de una Secuencia tiene obligatoriamente índice 0.",
                        "Si una Secuencia tiene como máximo n elementos, el último elemento se referenciará con el índice n-1.",
                        "En cuanto a las dimensiones de la Secuencia pueden ser: Unidimensional, Bidimensional, Multidimensional.",
                    ].map((texto, index) => (
                        <li
                            key={index}
                            className="text-sm text-gray-800 leading-6"
                        >
                            ✨ {texto}
                        </li>
                    ))}
                </ul>
                <p className="text-gray-800 text-sm mt-3 leading-6">
                    SEED trabaja la dimensión unidimensional debido a que es la
                    estructura simple que posee más relevancia y del
                    funcionamiento de estas el estudiante puede implementar de
                    creer necesario las demás dimensiones.
                </p>
                <p>
                    <h1 className="text-xl font-bold my-4">
                        Secuencia unidimensional
                    </h1>
                    <p className="text-gray-800 text-sm mt-3 leading-6">
                        Es un conjunto de elementos del mismo tipo.
                    </p>
                    {[
                        "Declaración: Tipo nombre_Secuencia[Tamaño];",
                        "Tipo: Hace referencia al tipo de los datos contenidos en el vector.",
                        "Tamaño: Hace referencia al número de elementos máximos que puede contener la Secuencia. OJO: Este tamaño se define al crear la estructura y no puede modificarse a lo largo de la operabilidad de la misma.",
                    ].map((element: string, index: number) => {
                        const partes: string[] = element.split(":"); // Divide en dos partes

                        return (
                            <p
                                key={index}
                                className="text-sm text-gray-800 mt-3 leading-6"
                            >
                                <span className="font-bold">{partes[0]}:</span>
                                {partes.slice(1).join(":")}
                            </p>
                        );
                    })}
                </p>
            </div>
        </div>
    );
}
