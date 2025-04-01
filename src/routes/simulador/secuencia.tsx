import { createFileRoute } from "@tanstack/react-router";
import { SequenceSimulator } from "../../pages/simulator/SequenceSimulator";

export const Route = createFileRoute("/simulador/secuencia")({
    component: RouteComponent,
});

function RouteComponent() {
    return <SequenceSimulator></SequenceSimulator>;
}
