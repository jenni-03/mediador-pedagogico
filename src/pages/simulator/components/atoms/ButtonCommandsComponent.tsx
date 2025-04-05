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
            onClose={() => setIsActive(false)}
        >
            <div
                onClick={() => setIsActive(true)}
                className={`flex items-center justify-center px-4 py-1 text-xs sm:text-sm font-semibold rounded-full border transition-all duration-300 cursor-pointer
                    ${
                        isActive
                            ? "bg-[#373750] border-[#55557a] text-white shadow-md"
                            : "bg-[#2a2a40] border-gray-600 text-gray-300 hover:bg-[#3b3b59] hover:text-white"
                    }`}
            >
                {title}
            </div>
        </CustomModal>
    );
    
}
