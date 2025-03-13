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
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white rounded-2xl p-4 w-10/12 md:w-1/2 lg:w-1/3">
                        <h2 className="text-2xl font-bold mb-4 text-center">
                            {title}
                        </h2>
                        <p className="mb-2">
                            <strong>Funcionalidad:</strong> {description}
                        </p>
                        <p className="mb-2">
                            <strong>Estructura del comando:</strong> {structure}
                        </p>
                        <p className="mb-4">
                            <strong>Ejemplo de uso:</strong> {example}
                        </p>
                        <div className="text-center">
                            <AnimatedButtonModal
                                // bgColor="#b064d4"
                                bgColor="#ffffff"
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
