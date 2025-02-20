import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/simulador/$estructura")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="h-screen flex flex-col">
      <div>
        <h1 className="font-bold text-3xl text-center mt-2">NOMBRE ESTRUCTURA</h1>
      </div>
      <div className="flex-1 bg-gray-200 mx-5 my-3 flex flex-col rounded-xl">
        <div className="flex-[2] flex flex-row rounded-xl my-3 mx-3">
          <div className="flex-[2] bg-blue-400 rounded-3xl mr-2">

          </div>
          <div className="flex-[1] bg-blue-200 rounded-xl ml-2">
          </div>
        </div>
        <div className="flex-[1] flex flex-row rounded-xl mb-3 mx-3">
          <div className=" flex-1 bg-blue-300 mr-2 rounded-xl">

          </div>
          <div className="flex-1 bg-blue-500 ml-2 rounded-xl">

          </div>
        </div>
      </div>
    </div>
  );
}
