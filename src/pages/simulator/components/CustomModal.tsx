import { useState } from "react";
import { CustomModalProps } from "../../../types";
import { AnimatedButtonModal } from "../../../shared/components/AnimatedButtonModal";

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
                <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                    <div
                        className="rounded-2xl p-6 w-10/12 md:w-1/2 lg:w-1/4
                        bg-white/20 backdrop-blur-md border border-white/30 shadow-lg"
                    >
                        <div className="flex flex-col items-center">
                            <h2 className="text-2xl font-bold mb-4 text-black">
                                {title}
                            </h2>
                        </div>
                        <p className="mb-2 text-black">
                            <strong>Funcionalidad:</strong> {description}
                        </p>
                        <p className="mb-2 text-black">
                            <strong>Estructura del comando:</strong> {structure}
                        </p>
                        <p className="mb-4 text-black">
                            <strong>Ejemplo de uso:</strong> {example}
                        </p>
                        <div className="text-center">
                            <AnimatedButtonModal
                                bgColor="#ef233c"
                                text="Aceptar"
                                onClick={closeModal}
                            ></AnimatedButtonModal>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
