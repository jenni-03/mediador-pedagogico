import { GroupCommandProps } from "../../../../types";
import { ButtonCommandsComponent } from "../atoms/ButtonCommandsComponent";

export function GroupCommandsComponent({ buttons }: GroupCommandProps) {
  return (
    <div
      data-tour="command-buttons"
      className="flex-1 flex items-center flex-col rounded-xl"
    >
      <span
        className="
            w-full text-center 
            font-extrabold text-transparent 
            bg-clip-text bg-gradient-to-r from-[#D72638] via-[#E0E0E0] to-[#A0A0A0]
            text-lg sm:text-xl tracking-wide 
            border-b border-[#2E2E2E] pb-2 mb-4
        "
      >
        Comandos Disponibles
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
