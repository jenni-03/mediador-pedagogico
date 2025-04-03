import { createFileRoute } from '@tanstack/react-router'
import { StructureSimulator } from '../../pages/simulator/StructureSimulator'

export const Route = createFileRoute('/simulador/$estructura')({
  component: RouteComponent,
})

function RouteComponent() {
  return <StructureSimulator></StructureSimulator>
}
