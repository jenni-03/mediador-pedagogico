import { createFileRoute } from "@tanstack/react-router";
import { MemorySimulator } from "../../pages/simulator/MemorySimulator";

export const Route = createFileRoute("/simulador/memoria")({
    component: RouteComponent,
});

function RouteComponent() {
    return <MemorySimulator />;
}
