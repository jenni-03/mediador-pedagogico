import { createFileRoute } from "@tanstack/react-router";
import { Complexity } from "../../../pages/concepts/Complexity";

export const Route = createFileRoute("/conceptos/$estructura/complejidad")({
    component: RouteComponent,
});

function RouteComponent() {
    return <Complexity></Complexity>;
}
