import { GroupCommandProps } from "../../../types";
import { ButtonCommandsComponent } from "./ButtonCommandsComponent";

export function GroupCommandsComponent({ buttons }: GroupCommandProps){
    return (
        <div className="flex flex-col space-y-5">
            {buttons.map((button, index) => (
                <ButtonCommandsComponent key={index} label={button.label} tooltip={button.tooltip} />
            ))}
        </div>
    );
}