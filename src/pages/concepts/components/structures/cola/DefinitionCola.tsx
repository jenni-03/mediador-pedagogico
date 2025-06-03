import img1 from "../../../../../assets/images/definicion_cola_1.jpg";

export function DefinitionCola() {
    return (
        <div className="py-4 px-10">
            <h1 className="text-2xl font-extrabold mb-1 text-white">COLA</h1>
            <h1 className="text-sm text-red-400 mb-4">Estructura Lineal</h1>
            <hr className="mt-2 mb-4 border-red-500 border-t-2" />
            <div className="text-sm text-gray-300 leading-6">
                <h1 className="text-xl font-bold text-red-500 mb-3">Descripción</h1>
                <p className="mb-5">
                    Las colas son un conjunto de elementos caracterizadas porque
                    las operaciones de inserción y borrado se realizan sobre
                    extremos opuestos de la estructura. La inserción se produce
                    en el "final", mientras que el borrado se realiza en el otro
                    extremo, el "inicio". Las restricciones definidas para una
                    cola hacen que el primer elemento que se inserta en ella
                    sea, igualmente, el primero en ser extraido de la
                    estructura. Si una serie de elementos A, B, C, D, E se
                    insertan en una cola en ese mismo orden, entonces los
                    elementos irán saliendo de la cola en el ordenen que
                    entraron. Por esa razón son llamadas FIFO (First In First
                    Out), es decir, “el primero que entra es el primero que
                    sale”.
                </p>
                <img src={img1} alt="img 1" />
                <p className="mb-5">
                    Las colas, al igual que las pilas, resultan de aplicación
                    habitual en muchos problemas informáticos. Quizás la
                    aplicación más común de las colas es la organización de
                    tareas de un ordenador. En general, los trabajos enviados a
                    un ordenador son "encolados" por éste, para ir procesando
                    secuencialmente todos los trabajos en el mismo orden en que
                    se reciben. Cuando el ordenador recibe el encargo de
                    realizar una tarea, ésta es almacenada al final de la cola
                    de trabajos. En el momento que la tarea que estaba
                    realizando el procesador acaba, éste selecciona la tarea
                    situada al principio de la cola para ser ejecutada a
                    continuación. Todo esto suponiendo la ausencia de
                    prioridades en los trabajos. En caso contrario, existirá una
                    cola para cada prioridad. Del mismo modo, es necesaria una
                    cola, por ejemplo, a la hora de gestionar eficientemente los
                    trabajos que deben ser enviados a una impresora (o a casi
                    cualquier dispositvo conectado a un ordenador). De esta
                    manera, el ordenador controla el envio de trabajos al
                    dispositivo, no enviando un trabajo hasta que la impresora
                    no termine con el anterior.
                </p>
                <h1 className="text-xl font-bold text-red-500 mb-3">COLA SIMPLE</h1>
                <p className="mb-5">
                    Se inserta por un sitio y se saca por otro, en el caso de la
                    cola simple se inserta por el final y se saca por el
                    principio. Para gestionar este tipo de cola hay que recordar
                    siempre cual es el siguiente elemento que se va a leer y
                    cual es el último elemento que se ha introducido.
                </p>
            </div>
        </div>
    );
}
