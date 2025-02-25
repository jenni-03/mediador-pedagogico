import { GroupCommandProps } from "../../../types";
import { ButtonCommandsComponent } from "./ButtonCommandsComponent";

export function GroupCommandsComponent({ buttons }: GroupCommandProps) {
    return (
        <div className="grid grid-cols-2 gap-x-8 gap-y-4 w-full">
                {buttons.map((button, index) => (
                    <ButtonCommandsComponent
                        key={index}
                        label={button.label}
                        tooltip={button.tooltip}
                    />
                ))}
        </div>
    );
}
