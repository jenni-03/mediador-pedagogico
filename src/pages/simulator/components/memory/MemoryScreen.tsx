import { useState } from "react";
import { MemoryDisplay } from "./MemoryDisplay";
import { FaSearch } from "react-icons/fa";
import { TestCasesModal } from "./TestCasesModal";
import { Consola } from "../../../../shared/utils/RAM/Consola";

interface MemoryScreenProps {
    consolaRef: React.RefObject<Consola>;
    memoryState: Record<string, any[]>;
    setMemoryState: (newState: Record<string, any[]>) => void;
}

export function MemoryScreen({ consolaRef, memoryState, setMemoryState }: MemoryScreenProps) {
    const [selectedSegment, setSelectedSegment] = useState<string>("int");
    const [searchTerm, setSearchTerm] = useState("");
    const [showModal, setShowModal] = useState(false);

    return (
        <div className="w-full flex flex-col items-center px-4 mt-4 sm:mt-6 relative">
            <div
                className="
                    w-full max-w-6xl h-[75vh]
                    bg-white
                    border-8 border-red-500
                    rounded-lg
                    shadow-[0px_0px_25px_rgba(255,0,0,0.5)]
                    flex flex-col
                    relative
                    overflow-hidden
                "
            >
                {/* 📢 Cabecera con título y barra de búsqueda */}
                <div
                    className="
                        sticky top-0 left-0 w-full
                        bg-white
                        p-4
                        z-20
                        text-center
                        border-b border-red-500
                        flex flex-col items-center
                    "
                >
                    <h3 className="text-black text-2xl font-bold tracking-wider">
                        {selectedSegment.toUpperCase()} MEMORY SEGMENT
                    </h3>

                    <div className="flex items-center gap-4 w-full max-w-lg mt-3">
                        <div
                            className="
                                flex items-center
                                bg-gray-100
                                px-3 py-2
                                rounded-md
                                border border-gray-300
                                shadow-md
                                flex-1
                            "
                        >
                            <FaSearch className="text-gray-500 mr-2" />
                            <input
                                type="text"
                                placeholder="Buscar dirección..."
                                className="
                                    bg-transparent
                                    text-black
                                    text-sm
                                    outline-none
                                    placeholder-gray-500
                                    w-full
                                "
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button
                            onClick={() => setShowModal(true)}
                            className="
                                px-4 py-2
                                text-sm font-bold
                                uppercase
                                bg-red-500
                                hover:bg-red-600
                                text-white
                                rounded-md
                                shadow-lg
                                transition-all
                                duration-300
                                border-b-4 border-red-700
                                hover:shadow-[0px_0px_15px_rgba(255,0,0,0.8)]
                            "
                        >
                            ⚡ Casos de Prueba
                        </button>
                    </div>
                </div>

                {/* 📜 Contenedor de memoria con scroll interno */}
                <div className="w-full flex-1 overflow-y-auto px-2 pb-4 scrollbar-thin scrollbar-thumb-red-400 scrollbar-track-gray-200">
                    <MemoryDisplay
                        segment={selectedSegment}
                        searchTerm={searchTerm}
                        consolaRef={consolaRef}
                        memoryState={memoryState}
                    />
                </div>

                {/* 🎮 Tab Bar con colores para tipos de datos */}
                <div className="w-full bg-gray-100 p-2 flex flex-wrap justify-center gap-4 border-t border-red-500">
                    {["boolean", "char", "byte", "short", "int", "long", "float", "double", "string"].map((seg) => (
                        <button
                            key={seg}
                            onClick={() => setSelectedSegment(seg)}
                            className={`
                                px-3 py-2
                                text-sm font-bold
                                uppercase
                                rounded-md
                                transition-all
                                duration-300
                                ${
                                    selectedSegment === seg
                                        ? "text-red-600 border-b-4 border-red-500"
                                        : "text-black hover:text-red-600"
                                }
                            `}
                        >
                            {seg.toUpperCase()}
                        </button>
                    ))}
                    <span className="mx-2 text-gray-400">|</span>
                    {["array"].map((seg) => (
                        <button
                            key={seg}
                            onClick={() => setSelectedSegment(seg)}
                            className={`
                                px-3 py-2
                                text-sm font-bold
                                uppercase
                                rounded-md
                                transition-all
                                duration-300
                                ${
                                    selectedSegment === seg
                                        ? "text-red-600 border-b-4 border-red-500"
                                        : "text-black hover:text-red-600"
                                }
                            `}
                        >
                            {seg.toUpperCase()}
                        </button>
                    ))}
                    <span className="mx-2 text-gray-400">|</span>
                    {["object"].map((seg) => (
                        <button
                            key={seg}
                            onClick={() => setSelectedSegment(seg)}
                            className={`
                                px-3 py-2
                                text-sm font-bold
                                uppercase
                                rounded-md
                                transition-all
                                duration-300
                                ${
                                    selectedSegment === seg
                                        ? "text-red-600 border-b-4 border-red-500"
                                        : "text-black hover:text-red-600"
                                }
                            `}
                        >
                            {seg.toUpperCase()}
                        </button>
                    ))}
                </div>
            </div>

            {/* 📌 MODAL PARA CASOS DE PRUEBA */}
            {showModal && (
                <TestCasesModal
                    consolaRef={consolaRef}
                    setMemoryState={setMemoryState}
                    closeModal={() => setShowModal(false)}
                />
            )}
        </div>
    );
}
