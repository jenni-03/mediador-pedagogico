import img1 from "../../../../../assets/images/definicion_ls_1.jpg";
import img2 from "../../../../../assets/images/definicion_ls_2.jpg";
import img3 from "../../../../../assets/images/definicion_ls_3.jpg";
import img4 from "../../../../../assets/images/definicion_ls_4.jpg";
import img5 from "../../../../../assets/images/definicion_ls_5.jpg";
import img6 from "../../../../../assets/images/definicion_ls_6.jpg";
import img7 from "../../../../../assets/images/definicion_ls_7.jpg";
import img8 from "../../../../../assets/images/definicion_ls_8.jpg";

export function DefinitionListaSimple() {
  return (
    <div className="py-4 px-10">
      <h1 className="text-2xl font-bold mb-1">LISTA SIMPLE ENLAZADA</h1>
      <h1 className="text-sm text-gray-500 mb-3">Estructura Lineal</h1>
      <hr className="mt-2 mb-4 border-red-500 border-t-2" />
      <div>
        <h1 className="text-xl font-bold mb-3">Descripción</h1>
        <p className="text-gray-800 text-sm mb-5 leading-6">
          Estructura conformada por un elemento fundamental denominado Nodo. El
          Nodo es un elemento que contiene la información y la dirección del
          siguiente elemento, el primer elemento creado se le denomina cabeza y
          es la referencia para el desarrollo de las diversas acciones en la
          Lista.
        </p>
        <p className="text-gray-800 text-sm mb-5 leading-6">
          Para comprender de una mejor manera el concepto de Listas Simples es
          necesario, primeramente, conocer la estructura básica de un nodo. En
          general un nodo consta de dos partes:
        </p>
        <img src={img1} alt="img 1" />
        <h1 className="text-gray-800 text-sm mb-5 leading-6">
          ✨ Un campo Información que será del tipo de datos que se quiera
          almacenar en la lista
        </h1>
        <h1 className="text-gray-800 text-sm mb-5 leading-6">
          ✨ Un puntero sig, que se utiliza para establecer el enlace con otro
          nodo de la lista. que será del tipo de datos que se quiera almacenar
          en la lista. Si el nodo fuera el último de la lista, este campo tendrá
          como valor: NULL (vacío). Al emplearse el campo puntero sig para
          relacionar dos nodos, no será necesario almacenar físicamente a los
          nodos en espacios contiguos.
        </h1>
        <p className="text-gray-800 text-sm mt-3 leading-6">
          Una lista enlazada, en su forma mas simple, es una colección de nodos
          que juntos forman un orden lineal. El ordenamiento esta determinado de
          tal forma que cada nodo es un objeto que guarda una referencia a un
          elemento y una referencia, llamado siguiente, a otro nodo. La idea
          principal es que se cree un nuevo nodo, se pone su enlace siguiente
          para que se referencie al mismo objeto que la cabeza, y entonces se
          pone que la cabeza apunte al nuevo nodo.
        </p>
        <img src={img2} alt="img 2" />
        <p className="text-gray-800 text-sm mt-3 leading-6">
          Podría parecer extraño tener un nodo que referencia a otro nodo, pero
          tal esquema trabaja fácilmente. La referencia siguiente dentro de un
          nodo puede ser vista como un enlace o apuntador a otro nodo. De igual
          nodo, moverse de un nodo a otro siguiendo una referencia al siguiente
          es conocida como salto de enlace o salto de apuntador.
        </p>
        <p className="text-gray-800 text-sm mt-3 leading-6">
          Como en un arreglo, una lista simple enlazada guarda sus elementos en
          un cierto orden. Este orden está determinado por la cadenas de enlaces
          siguientes yendo desde cada nodo a su sucesor en la lista. A
          diferencia de un arreglo, una lista simple enlazada no tiene un tamaño
          fijo predeterminado, y usa espacio proporcional al número de sus
          elementos. Asimismo, no se emplean números índices para los nodos en
          una lista enlazada. Por lo tanto, no se puede decir sólo por examinar
          un nodo si este es el segundo, quinto u otro nodo en la lista.
        </p>
        <p className="text-gray-800 text-sm mt-3 leading-6">
          <span className="font-bold">Ejemplo de Insertar:</span> {""}
          Se inserta en una Lista Simple los números 10, 1, 23, 2, 12.
        </p>
        <img src={img3} alt="img 1" />
        <img src={img4} alt="img 1" />
        <p className="text-gray-800 text-sm mt-3 leading-6">
          De esta manera la Lista Simple queda:
        </p>
        <img src={img5} alt="img 1" />
        <p className="text-gray-800 text-sm mt-3 leading-6">
          <span className="font-bold">Ejemplo de Eliminar:</span> {""}
          Teniendo la Lista Simple:
        </p>
        <img src={img6} alt="img 1" />
        <p className="text-gray-800 text-sm mt-3 leading-6">
          Se desea eliminar el 11 de la Lista Simple, se modifica el puntero sig
          del nodo anterior por el hacia el nodo siguiente del nodo que se
          eliminó.
        </p>
        <img src={img7} alt="img 1" />
        <p className="text-gray-800 text-sm mt-3 leading-6">
          Quedando la Lista Simple:
        </p>
        <img src={img8} alt="img 1" />
      </div>
    </div>
  );
}
