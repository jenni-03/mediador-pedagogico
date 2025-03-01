import { CommandProps } from "../../../types";

export function ButtonCommandsComponent({ label, tooltip }: CommandProps) {
    return (
        <div
            className="flex items-center justify-center gap-1 rounded-2xl border-2 border-gray-300 bg-gray-100 px-3 py-1 
shadow-[6px_6px_10px_#b8b8b8,-6px_-6px_10px_#ffffff] transition duration-200 active:shadow-[inset_4px_4px_6px_#b8b8b8,inset_-4px_-4px_6px_#ffffff] cursor-pointer"
        >
            <span className="text-sm font-medium text-gray-700">{label}</span>
            <i title={tooltip} className="pi pi-info-circle text-gray-500"></i>
        </div>
    );
}
