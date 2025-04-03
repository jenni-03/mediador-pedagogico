import { createFileRoute } from "@tanstack/react-router";
import { StackSimulator } from "../../pages/simulator/StackSimulator";

export const Route = createFileRoute("/simulador/pila")({
  component: RouteComponent,
});

function RouteComponent() {
  return <StackSimulator></StackSimulator>;
}
