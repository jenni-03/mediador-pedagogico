import { GroupCommandProps } from "../../../types";
import { ButtonCommandsComponent } from "./ButtonCommandsComponent";

export function GroupCommandsComponent({ buttons }: GroupCommandProps) {
    return (
        <div className="flex-[1] flex items-center flex-col rounded-xl">
            {/* <span
                className="w-full text-center font-medium rounded-2xl border-2 border-gray-300 bg-gray-100 mb-3 px-3 py-1 
                text-red-500"
            > */}
            <span
                className="w-full text-center font-medium rounded-2xl bg-red-600 mb-3 px-3 py-1 
                text-white"
            >
                COMANDOS DISPONIBLES
            </span>
            <div className="grid grid-cols-2 gap-x-8 gap-y-4 w-full">
                {buttons.map((button, index) => (
                    <ButtonCommandsComponent
                        key={index}
                        title={button.title}
                        description={button.description}
                        estructura={button.estructura}
                        ejemplo={button.ejemplo}
                    />
                ))}
            </div>
        </div>
    );
}