import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/simulador/$estructura")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/simulador/$estructura"!</div>;
}
