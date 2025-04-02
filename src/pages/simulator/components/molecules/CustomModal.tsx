import { useState } from "react";
import { CustomModalProps } from "../../../../types";
import { AnimatedButtonModal } from "../../../../shared/components/AnimatedButtonModal";

export function CustomModal({
    title,
    description,
    structure,
    example,
    children,
    onClose,
}: CustomModalProps) {
    const [isOpen, setIsOpen] = useState(false);

    const openModal = () => setIsOpen(true);
    const closeModal = () => {
        setIsOpen(false);
        if (onClose) onClose(); // Llama a la función pasada cuando se cierra el modal
    };

    return (
        <>
            <div onClick={openModal} className="cursor-pointer">
                {children}
            </div>

            {isOpen && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
                    <div className="bg-white border border-red-300 rounded-2xl shadow-2xl p-6 w-11/12 sm:w-4/5 md:w-2/3 lg:w-[30%] max-w-lg">
                        <div className="flex flex-col items-center">
                            <h2 className="text-2xl font-extrabold text-red-600 drop-shadow-sm mb-4">
                                {title}
                            </h2>
                            <div className="text-sm sm:text-base text-gray-800 space-y-3">
                                <p>
                                    <span className="font-semibold text-red-500">
                                        🧠 Funcionalidad:
                                    </span>{" "}
                                    {description}
                                </p>
                                <p>
                                    <span className="font-semibold text-red-500">
                                        🛠️ Estructura del comando:
                                    </span>{" "}
                                    {structure}
                                </p>
                                <p>
                                    <span className="font-semibold text-red-500">
                                        📌 Ejemplo de uso:
                                    </span>{" "}
                                    {example}
                                </p>
                            </div>
                        </div>

                        <div className="mt-6 text-center">
                            <AnimatedButtonModal
                                bgColor="#ef233c"
                                text="Aceptar"
                                onClick={closeModal}
                            />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
