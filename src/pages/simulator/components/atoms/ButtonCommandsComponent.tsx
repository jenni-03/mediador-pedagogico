import { useState } from "react";
import { CommandProps } from "../../../../types";
import { CustomModal } from "../molecules/CustomModal";

export function ButtonCommandsComponent({
    title,
    description,
    estructura,
    ejemplo,
}: CommandProps) {
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
                onClick={() => setIsActive(true)}
                className={`flex items-center justify-center px-4 py-1 text-xs sm:text-sm font-semibold rounded-full border transition-all duration-300 ${
                    isActive === true
                        ? "bg-red-100 border-red-400 text-red-700 shadow"
                        : "bg-white border-gray-300 text-gray-700 hover:bg-red-50 hover:text-red-600"
                }
        `}
            >
                {title}
            </div>
        </CustomModal>
    );
}
