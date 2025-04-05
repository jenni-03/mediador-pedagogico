import { GroupCommandProps } from "../../../../types";
import { ButtonCommandsComponent } from "../atoms/ButtonCommandsComponent";

export function GroupCommandsComponent({ buttons }: GroupCommandProps) {
    return (
        <div className="flex-1 flex items-center flex-col rounded-xl">
            <span className="w-full text-center font-semibold text-white bg-[#3a3a5a] border border-gray-600 mb-3 px-3 py-1 rounded-xl">
                COMANDOS DISPONIBLES
            </span>
            <div className="grid grid-cols-3 gap-x-8 gap-y-4 w-full">
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
