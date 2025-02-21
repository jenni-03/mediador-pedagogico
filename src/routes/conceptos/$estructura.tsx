import { createFileRoute } from "@tanstack/react-router";
import { Concept } from "../../pages/concepts/Concept";

export const Route = createFileRoute("/conceptos/$estructura")({
    component: RouteComponent,
});

function RouteComponent() {
    return <Concept></Concept>;
}
