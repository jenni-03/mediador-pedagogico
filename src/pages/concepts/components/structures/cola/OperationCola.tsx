import img1 from "../../../../../assets/images/operacion_secuencia_1.png";
import img2 from "../../../../../assets/images/operacion_secuencia_2.jpg";
import img3 from "../../../../../assets/images/operacion_secuencia_3.jpg";
import img4 from "../../../../../assets/images/operacion_secuencia_4.jpg";
import img5 from "../../../../../assets/images/operacion_secuencia_5.jpg";
import img6 from "../../../../../assets/images/operacion_secuencia_6.jpg";

export function OperationCola() {
    return (
        <div className="py-4 px-10">
            <h1 className="text-2xl font-bold mb-1">OPERACIONES</h1>
            <h1 className="text-sm text-gray-500 mb-3">Secuencia</h1>
            <hr className="mt-2 mb-4 border-red-500 border-t-2" />
            <div>
                <h1 className="text-2xl font-bold mb-3">Insertar</h1>
                <p className="text-gray-700 text-sm mb-5">
                    Para esta operación solo basta con indicar el dato que se
                    desea almacenar en la estructura y esta lo almacena
                    consecutivamente en la posición acorde a la cantidad datos
                    que posee la estrutura, teniendo en cuenta que no se
                    desborde la capacidad de la Secuencia.
                </p>
                <p className="text-sm text-gray-800 mt-3 leading-6">
                    <span className="font-bold">Ejemplo de insertar: </span>
                    Tenemos la secuencia
                </p>
                <img src={img1} alt="img 1" />
                <p className="text-sm text-gray-800 mt-3 leading-6">
                    Se desea insertar el número 25 a la secuencia.
                </p>
                <img src={img2} alt="img 2" />
                <p className="text-sm text-gray-800 mt-3 leading-6">
                    Simplemente se agrega el índice (número en la posición
                    elementos almacenados menos uno)
                </p>
                <img src={img3} alt="img 3" />
            </div>
            <div>
                <h1 className="text-2xl font-bold mb-3">Editar</h1>
                <p className="text-gray-700 text-sm mb-5">
                    En esta operación solo basta con indicar el dato que se
                    desea almacenar en la estructura e indicar la posición que
                    se desea editar de la estructura, esta recorre la cantidad
                    de datos almacenados hasta encontrar la posición de la
                    estructura que se desea modificar y cambia el valor de la
                    posición por el nuevo dato, teniendo en cuenta que la
                    posicion exista y posea un dato almacenado en Secuencia.
                </p>
            </div>
            <div>
                <h1 className="text-2xl font-bold mb-3">Buscar</h1>
                <p className="text-gray-700 text-sm mb-5">
                    Se indica el dato que se desea consultar de la estructura,
                    esta recorre la cantidad de datos almacenados hasta
                    encontrar el dato que se está consultando, teniendo en
                    cuenta que el dato se encuentre almacenado en la Secuencia.
                </p>
            </div>
            <div>
                <h1 className="text-2xl font-bold mb-3">Eliminar</h1>
                <p className="text-gray-700 text-sm mb-5">
                    Se debe indicar el dato que se desea eliminar de la
                    estructura, esta lo borra y consecutivamente de ser
                    necesario reajusta las posiciones de los datos siguientes al
                    dato eliminado, teniendo en cuenta que el dato se encuentre
                    almacenado en la Secuencia.
                </p>
                <p className="text-sm text-gray-800 mt-3 leading-6">
                    <span className="font-bold">Ejemplo de eliminar: </span>
                    Tenemos la Secuencia y se desea eliminar el número 02 de la
                    Secuencia
                </p>
                <img src={img4} alt="img 4" />
                <p className="text-sm text-gray-800 mt-3 leading-6">
                    Al eliminarse el número 02 de la Secuencia automáticamente
                    al poseer elementos posteriores al eliminado hace un
                    corrimiento hacia la izquierda evitando dejar posiciones
                    vacías entre los elementos que almacena la estructura.
                </p>
                <img src={img5} alt="img 5" />
                <p className="text-sm text-gray-800 mt-3 leading-6">
                    Manteniendo las propiedades de la Secuencia, la estructura
                    queda de la siguiente manera:
                </p>
                <img src={img6} alt="img 6" />
            </div>
        </div>
    );
}
