import { useState } from "react";
import { CardList } from "./components/CardList";
import { NavBar } from "./components/NavBar";
import { FilterState } from "../../types";
import { data } from "../../shared/constants/data-cards";
import { motion } from "framer-motion";

export function Home() {
    const [filter, setFilter] = useState<FilterState>({
        query: "",
        type: "none",
    });

    return (
        <div className="w-full m-auto bg-[#efeff0] min-h-screen">
            <NavBar filter={filter} setFilter={setFilter} />
            <div className="w-full bg-white">
                <div className="max-w-[1200px] mx-auto px-6 py-4 w-full bg-white border-rounded grid grid-cols-3 gap-4 items-center">
                    {/* Sección de Presentación */}
                    <div className="col-span-2">
                        <p className="text-5xl font-bold">
                            Bienvenidos al Mediador Pedagógico sobre
                        </p>
                        <p className="text-5xl font-bold text-red-600">
                            Estructuras de Datos
                        </p>

                        <div className="rounded-lg mb-8 mt-6">
                            <p className="text-lg mb-4">
                                Aquí podrás encontrar dos tipos de simuladores:
                            </p>

                            <div className="mb-6">
                                <h2 className="text-xl font-semibold text-red-600 mb-2">
                                    Simulador de Memoria
                                </h2>
                                <p>
                                    En este simulador aprenderás cómo se manejan
                                    las direcciones de memoria para todas las
                                    variables existentes en Java, permitiéndote
                                    visualizar cómo se asigna, utiliza y libera
                                    la memoria en tiempo real.
                                </p>
                                <motion.button
                                    style={{ backgroundColor: "#D02222" }}
                                    className="rounded text-white py-2 px-2 text-center mt-4"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    transition={{
                                        type: "spring",
                                        stiffness: 300,
                                        damping: 10,
                                    }}
                                    onClick={() => {}}
                                >
                                    Ver Simulador
                                </motion.button>
                            </div>

                            <div>
                                <h2 className="text-xl font-semibold text-red-600 mb-2">
                                    Simuladores de Estructuras de Datos
                                </h2>
                                <p>
                                    Este simulador abarca estructuras de datos
                                    lineales, árboles binarios y árboles
                                    n-arios. Podrás aprender cómo funcionan sus
                                    operaciones más comunes y cómo se almacenan
                                    y manipulan en la memoria, a continuación
                                    las estructuras de datos disponibles:
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Imagen del Logo */}
                    <div className="flex justify-center items-center">
                        <img
                            className="w-4/4 h-auto"
                            src="/assets/images/logo_ingsistemas.png"
                            alt=""
                        />
                    </div>
                </div>
            </div>
            <CardList data={data} filter={filter} />
        </div>
    );
}
