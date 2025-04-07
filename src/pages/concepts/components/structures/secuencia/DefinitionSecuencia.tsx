import img1 from "../../../../../assets/images/definicion_secuencia_1.jpg";
import img2 from "../../../../../assets/images/definicion_secuencia_2.jpg";

export function DefinitionSecuencia() {
  return (
    <div className="py-6 px-8 sm:px-12 bg-[#0f0f0f] text-white leading-relaxed">
      <h1 className="text-3xl font-extrabold text-white mb-1">SECUENCIA</h1>
      <h2 className="text-base text-red-500 mb-3 font-semibold">
        Estructura Lineal
      </h2>
      <hr className="mt-2 mb-6 border-t-2 border-red-500" />

      <div>
        {/* Descripción */}
        <h3 className="text-2xl font-bold text-red-500 mb-3">Descripción</h3>
        <p className="text-sm text-gray-300 mb-4">
          Son estructuras de datos que, una vez definidas, no pueden ser
          cambiadas por otras de diferente naturaleza o tamaño. No se pueden
          usar en problemas donde se requiera un tamaño dinámico al momento de
          la ejecución.
        </p>
        <p className="text-sm text-gray-300 mb-6">
          Una Secuencia es una lista contigua de datos del mismo tipo,
          accesibles por índice, y representa un vector en Java. Es una
          estructura estática lineal con tamaño fijo, que almacena elementos de
          forma sucesiva en memoria.
        </p>
        <img
          src={img1}
          alt="img 1"
          className="rounded-xl mb-6 border border-gray-700"
        />

        {/* Características */}
        <h3 className="text-2xl font-bold text-red-500 mb-3">
          Características
        </h3>
        <p className="text-sm text-gray-300 mb-4">
          Almacena datos de forma consecutiva, sin espacios nulos entre la
          primera y última posición ocupada. Esto permite examinar elementos sin
          recorrer toda su capacidad.
        </p>
        <p className="text-sm text-gray-300 mb-4">
          Puede almacenar N elementos del mismo tipo, y acceder a cada uno por
          índice. Así se distinguen:
        </p>
        <p className="text-sm text-gray-300 mb-2">
          ✨ Elementos (valores almacenados)
        </p>
        <p className="text-sm text-gray-300 mb-6">
          ✨ Índices (referencias a los elementos)
        </p>

        <img
          src={img2}
          alt="img 2"
          className="rounded-xl mb-6 border border-gray-700"
        />

        {/* Lista de puntos */}
        <ul className="space-y-3 mb-6">
          {[
            "En la ejecución del programa, se reservan tantas posiciones como el tamaño definido de la Secuencia, siendo cada posición del tamaño requerido por el tipo de dato de la estructura.",
            "El primer elemento de una Secuencia tiene obligatoriamente índice 0.",
            "Si una Secuencia tiene como máximo n elementos, el último se referenciará con el índice n-1.",
            "En cuanto a las dimensiones de la Secuencia pueden ser: Unidimensional, Bidimensional, Multidimensional.",
          ].map((texto, index) => (
            <li key={index} className="text-sm text-gray-300 leading-6">
              ✨ {texto}
            </li>
          ))}
        </ul>

        <p className="text-sm text-gray-300 mb-6">
          <span className="font-semibold text-white">SEED</span> trabaja con la
          dimensión unidimensional por ser la más relevante. A partir de ella,
          el estudiante puede implementar otras más complejas si lo considera
          necesario.
        </p>

        {/* Secuencia unidimensional */}
        <h3 className="text-2xl font-bold text-red-500 mb-3">
          Secuencia unidimensional
        </h3>
        <p className="text-sm text-gray-300 mb-4">
          Es un conjunto de elementos del mismo tipo.
        </p>

        {[
          "Declaración: Tipo nombre_Secuencia[Tamaño];",
          "Tipo: Hace referencia al tipo de los datos contenidos en el vector.",
          "Tamaño: Hace referencia al número de elementos máximos que puede contener la Secuencia. OJO: Este tamaño se define al crear la estructura y no puede modificarse a lo largo de la operabilidad de la misma.",
        ].map((element, index) => {
          const partes = element.split(":");
          return (
            <p key={index} className="text-sm text-gray-300 mb-2">
              <span className="font-bold text-white">{partes[0]}:</span>
              {partes.slice(1).join(":")}
            </p>
          );
        })}
      </div>
    </div>
  );
}
