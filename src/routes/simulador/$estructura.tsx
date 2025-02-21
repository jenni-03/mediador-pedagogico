import { createFileRoute } from "@tanstack/react-router";
import { Simulator } from "../../pages/simulator/Simulator";

export const Route = createFileRoute("/simulador/$estructura")({
    component: RouteComponent,
});

function RouteComponent() {
    return <Simulator></Simulator>
}
