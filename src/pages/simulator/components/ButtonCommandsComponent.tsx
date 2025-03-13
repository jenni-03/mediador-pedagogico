import { useState } from "react";
import { CommandProps } from "../../../types";
import { CustomModal } from "./CustomModal";

export function ButtonCommandsComponent({ title, description, estructura, ejemplo }: CommandProps) {
    const [isActive, setIsActive] = useState(false);

    return (
        <CustomModal
            title={title.toUpperCase()}
            description={description}
            structure={estructura}
            example={ejemplo}
            onClose={() => setIsActive(false)} // Cuando el modal se cierra, cambia el estado a false
        >
            <div
                className={`flex items-center justify-center gap-1 rounded-2xl border-2 border-gray-300 bg-gray-100 px-3 py-1
                transition duration-200 cursor-pointer ${
                    isActive 
                        ? "shadow-[inset_4px_4px_6px_#b8b8b8,inset_-4px_-4px_6px_#ffffff]" 
                        : "shadow-[6px_6px_10px_#b8b8b8,-6px_-6px_10px_#ffffff]"
                }`}
                onClick={() => setIsActive(true)} // Cambia el estado a true cuando se hace click en el botón
            >
                <span className="text-sm font-medium text-gray-700">{title}</span>
                <i className="pi pi-info-circle text-gray-500"></i>
            </div>
        </CustomModal>
    );
}
