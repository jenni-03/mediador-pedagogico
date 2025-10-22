import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { HiOutlineChip } from "react-icons/hi";
import { FaProjectDiagram } from "react-icons/fa";
import { TiArrowForward } from "react-icons/ti";
import { Modal } from "./Modal"; // importa tu Modal

export function Introduction() {
  const [modalOpen, setModalOpen] = useState<string | null>(null);

  const handleOpen = (type: string) => setModalOpen(type);
  const handleClose = () => setModalOpen(null);

  return (
    <div
      id="introduction-section"
      className="scroll-mt-20 sm:scroll-mt-16 md:scroll-mt-16 lg:scroll-mt-8 w-full min-h-screen bg-[#0f0f0f] text-white flex items-center justify-center py-10"
    >
      <div className="max-w-[1300px] w-full px-6 space-y-12">
        {/* Texto principal */}
        <div className="space-y-6 text-center lg:text-left">
          <div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight">
              Simuladores para el estudio de las
            </h1>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-red-500 leading-tight">
              Estructuras de Datos
            </h1>
          </div>

          <p className="text-lg text-gray-300 max-w-4xl mx-auto lg:mx-0">
            Aquí encontrarás simuladores que te permiten visualizar en tiempo
            real cómo funcionan y se organizan las estructuras de datos y su
            memoria, a través de simulaciones interactivas.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Card 1 */}
          <motion.div
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className="relative group bg-gradient-to-br from-[#1a1a1a] to-[#222] border border-red-600/40 rounded-2xl p-8 shadow-[0_0_20px_rgba(255,0,0,0.18)]
               transition-all flex flex-col h-full"
          >
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-red-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>

            <div className="relative z-10 flex-1 space-y-4">
              <FaProjectDiagram size={36} className="text-red-400" />
              <h2 className="text-2xl font-bold text-white">
                Simulador de Memoria
              </h2>
              <p className="text-gray-300 text-sm">
                Explora, de forma visual e interactiva, cómo se almacenan y
                transforman los datos en memoria. Explora, de forma visual e
                interactiva, cómo se almacenan y transforman los datos en
                memoria. Declara variables, observa su dirección, tipo, tamaño
                en bytes y valor, y practica operaciones como: Convertir tipos,
                actualizar, consultar y borrar.
              </p>
            </div>

            <div className="relative z-10 mt-6 flex justify-between">
              {/* Botón Ver Más */}
              <motion.button
                onClick={() => handleOpen("memoria")}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-800 text-white font-medium text-sm rounded-xl shadow-md hover:bg-gray-700 transition"
              >
                Ver Más
              </motion.button>

              {/* Botón Ver Simulador */}
              <Link to="/simulador/memoria">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white font-medium text-sm rounded-xl shadow-md hover:bg-red-700 transition"
                >
                  Ver Simulador
                  <TiArrowForward className="text-lg" />
                </motion.button>
              </Link>
            </div>
          </motion.div>

          {/* Card 2 */}
          <motion.div
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className="relative group bg-gradient-to-br from-[#1a1a1a] to-[#222] border border-red-600/40 rounded-2xl p-8 shadow-[0_0_20px_rgba(255,0,0,0.18)]
               transition-all flex flex-col h-full"
          >
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-red-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>

            <div className="relative z-10 flex-1 space-y-4">
              <HiOutlineChip size={36} className="text-red-400" />
              <h2 className="text-2xl font-bold text-white">
                Simuladores de Estructuras de Datos
              </h2>
              <p className="text-gray-300 text-sm">
                Explora estructuras lineales, jerárquicas binarias y n-arias,
                comprendiendo sus operaciones y cómo se manejan en memoria.
              </p>
            </div>

            <div className="relative z-10 mt-6 flex justify-between">
              {/* Botón Ver Más */}
              <motion.button
                onClick={() => handleOpen("estructuras")}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-800 text-white font-medium text-sm rounded-xl shadow-md hover:bg-gray-700 transition"
              >
                Ver Más
              </motion.button>

              {/* Botón Ver Simulador */}
              <motion.button
                onClick={() => {
                  const section = document.getElementById("filters-section");
                  if (section) {
                    section.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    });
                  }
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white font-medium text-sm rounded-xl shadow-md hover:bg-red-700 transition"
              >
                Ver Simuladores
                <TiArrowForward className="text-lg" />
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Modales */}
      <Modal
        isOpen={modalOpen === "memoria"}
        onClose={handleClose}
        title="Simulador de Memoria"
        content={
          <div className="space-y-6 text-gray-200 leading-relaxed">
            <p>
              Este simulador muestra la{" "}
              <span className="font-semibold text-red-400">
                organización de la memoria por segmentos
              </span>{" "}
              y el ciclo de vida de los datos:{" "}
              <span className="italic text-gray-300">
                declaración → dirección simbólica → tamaño → valor →
                conversión/actualización
              </span>
              .
            </p>

            <p>
              Cada entrada se identifica con una dirección con prefijo por tipo
              (
              <code className="bg-red-900/40 text-red-300 px-2 py-0.5 rounded-lg font-mono text-sm">
                4x001
              </code>{" "}
              para <code className="text-blue-400">int</code>,{" "}
              <code className="bg-blue-900/40 text-blue-300 px-2 py-0.5 rounded-lg font-mono text-sm">
                6x00A
              </code>{" "}
              para <code className="text-green-400">float</code>,{" "}
              <code className="bg-purple-900/40 text-purple-300 px-2 py-0.5 rounded-lg font-mono text-sm">
                ax0F2
              </code>{" "}
              para <code className="text-pink-400">array</code>), lo que
              facilita buscar y operar desde la consola.
            </p>

            <h3 className="text-xl font-bold text-white border-l-4 border-red-500 pl-3">
              Qué puedes hacer
            </h3>
            <ul className="list-disc list-inside space-y-2 text-gray-300">
              <li>
                Declarar variables primitivas, cadenas, arreglos u objetos y ver
                su representación en tarjetas.
              </li>
              <li>
                Consultar tipo y tamaño reales (
                <span className="italic text-gray-400">en bytes</span>) y la
                dirección asignada.
              </li>
              <li>
                Actualizar valores y convertir entre tipos compatibles
                observando efectos como redondeo o pérdida de precisión.
              </li>
              <li>
                Borrar direcciones y limpiar la memoria para nuevos escenarios.
              </li>
              <li>
                Usar la consola o el panel de comandos con ayudas y ejemplos
                integrados.
              </li>
            </ul>

            <h3 className="text-xl font-bold text-white border-l-4 border-red-500 pl-3">
              Ejemplos
            </h3>
            <div className="space-y-2 font-mono text-sm bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4 rounded-xl shadow-lg border border-gray-700">
              <p className="text-green-400">int x = 3;</p>
              <p className="text-yellow-300">size address 4x001</p>
              <p className="text-blue-400">convert address 4x001 to long</p>
              <p className="text-purple-400">update address 4x001 value 42</p>
              <p className="text-red-400">delete address 4x001</p>
            </div>

            <p className="mt-4 text-gray-300">
              Con estas operaciones puedes practicar cómo los datos se{" "}
              <span className="text-green-400 font-semibold">almacenan</span>,
              se{" "}
              <span className="text-blue-400 font-semibold">transforman</span> y
              se <span className="text-red-400 font-semibold">eliminan</span> en
              memoria, todo de forma interactiva y visual.
            </p>
          </div>
        }
      />

      <Modal
        isOpen={modalOpen === "estructuras"}
        onClose={handleClose}
        title="Simuladores de Estructuras de Datos"
        content={
          <div className="space-y-6 text-gray-200 leading-relaxed">
            <p>
              El{" "}
              <span className="text-red-400 font-semibold">
                Simulador de Estructuras de Datos
              </span>{" "}
              es una herramienta educativa diseñada para que estudiantes y
              docentes puedan
              <span className="text-blue-400"> visualizar</span>,
              <span className="text-green-400"> comprender</span> y
              <span className="text-yellow-400"> experimentar</span> con el
              funcionamiento interno de diferentes estructuras clásicas de la
              computación.
            </p>

            <p>
              En lugar de limitarse a definiciones teóricas, el simulador
              permite
              <span className="font-semibold text-purple-400">
                {" "}
                manipular estructuras en tiempo real
              </span>
              : insertar, eliminar, buscar y recorrer elementos mientras se
              muestran
              <span className="italic text-gray-300">
                {" "}
                animaciones paso a paso
              </span>{" "}
              que reflejan lo que ocurre “dentro” de la estructura.
            </p>

            <h3 className="text-xl font-bold text-white border-l-4 border-red-500 pl-3">
              🔑 Características principales
            </h3>
            <ul className="list-disc list-inside space-y-2 text-gray-300">
              <li>
                <span className="text-green-400 font-semibold">
                  Visualización dinámica:
                </span>{" "}
                cada operación genera animaciones claras que muestran cómo
                cambian nodos y enlaces.
              </li>
              <li>
                <span className="text-blue-400 font-semibold">
                  Múltiples estructuras soportadas:
                </span>{" "}
                árboles binarios, AVL, Rojo-Negro, B/B+, N-arios, tablas hash,
                colas, pilas y más.
              </li>
              <li>
                <span className="text-yellow-400 font-semibold">
                  Recorridos interactivos:
                </span>{" "}
                se destacan pasos en profundidad y amplitud (preorden, inorden,
                postorden, BFS).
              </li>
              <li>
                <span className="text-purple-400 font-semibold">
                  Etiquetas y metadatos:
                </span>{" "}
                nodos con identificadores, índices u otra info adicional.
              </li>
              <li>
                <span className="text-pink-400 font-semibold">
                  Animaciones pedagógicas:
                </span>{" "}
                inserciones, eliminaciones y actualizaciones con efectos
                intuitivos (pop, pulsos, resaltes).
              </li>
              <li>
                <span className="text-red-400 font-semibold">
                  Entorno amigable:
                </span>{" "}
                interfaz simple con consola integrada para comandos en vivo.
              </li>
            </ul>

            <h3 className="text-xl font-bold text-white border-l-4 border-red-500 pl-3">
              🎓 Beneficios para el aprendizaje
            </h3>
            <ul className="list-disc list-inside space-y-2 text-gray-300">
              <li>
                Transforma procesos abstractos en{" "}
                <span className="text-green-400 font-semibold">
                  experiencias visuales
                </span>
                .
              </li>
              <li>
                Permite{" "}
                <span className="text-blue-400 font-semibold">
                  experimentar sin riesgo
                </span>{" "}
                probando casos en vivo.
              </li>
              <li>
                Apoya a docentes en la explicación de{" "}
                <span className="text-yellow-400 font-semibold">
                  algoritmos complejos
                </span>
                .
              </li>
              <li>
                Fomenta la{" "}
                <span className="text-pink-400 font-semibold">
                  curiosidad y autoaprendizaje
                </span>{" "}
                en los estudiantes.
              </li>
            </ul>

            <h3 className="text-xl font-bold text-white border-l-4 border-red-500 pl-3">
              🌐 Objetivo
            </h3>
            <p>
              El objetivo principal del simulador es
              <span className="text-red-400 font-semibold">
                {" "}
                cerrar la brecha entre la teoría y la práctica
              </span>
              , ofreciendo una experiencia visual e interactiva que haga más
              accesible y entretenido el estudio de las
              <span className="text-blue-400 font-semibold">
                {" "}
                estructuras de datos
              </span>
              , tanto en el aula como de forma autónoma.
            </p>
          </div>
        }
      />
    </div>
  );
}
