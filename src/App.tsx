import { RouterProvider, createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import "primeicons/primeicons.css";
import { AnimationProvider } from "./shared/context/AnimationProvider";

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
    interface Register {
        router: typeof router;
    }
}

function App() {
    return (
        <>
            <AnimationProvider>
                <RouterProvider router={router} />
            </AnimationProvider>
        </>
    );
}

export default App;
