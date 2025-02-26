import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { D3Array } from "../shared/components/Array";

export const Route = createFileRoute("/prueba")({
    component: RouteComponent,
});

function RouteComponent() {
    // const [array, setArray] = useState<number[]>([1, 2, 3, 4, 5]);

    // const handlePush = () => {
    //     const newItem = array.length ? array[array.length - 1] + 1 : 1;
    //     setArray([...array, newItem]);
    // };

    // const handlePop = () => {
    //     setArray(array.slice(0, -1));
    // };

    // const handleUnshift = () => {
    //     const newItem = array.length ? array[0] - 1 : 1;
    //     setArray([newItem, ...array]);
    // };

    // const handleShift = () => {
    //     setArray(array.slice(1));
    // };

    // return (
    //     <div className="p-4">
    //         <div className="flex space-x-2 mb-4">
    //             <button
    //                 onClick={handlePush}
    //                 className="px-3 py-1 bg-blue-500 text-white rounded"
    //             >
    //                 Push
    //             </button>
    //             <button
    //                 onClick={handlePop}
    //                 className="px-3 py-1 bg-blue-500 text-white rounded"
    //             >
    //                 Pop
    //             </button>
    //             <button
    //                 onClick={handleUnshift}
    //                 className="px-3 py-1 bg-blue-500 text-white rounded"
    //             >
    //                 Unshift
    //             </button>
    //             <button
    //                 onClick={handleShift}
    //                 className="px-3 py-1 bg-blue-500 text-white rounded"
    //             >
    //                 Shift
    //             </button>
    //         </div>
    //         <ul className="space-y-2">
    //             <AnimatePresence>
    //                 {array.map((item) => (
    //                     <motion.li
    //                         key={item}
    //                         initial={{ opacity: 0, y: 10 }}
    //                         animate={{ opacity: 1, y: 0 }}
    //                         exit={{ opacity: 0, y: -10 }}
    //                         transition={{ duration: 0.4 }}
    //                         className="p-2 bg-blue-200 rounded"
    //                     >
    //                         {`Elemento: ${item}`}
    //                     </motion.li>
    //                 ))}
    //             </AnimatePresence>
    //         </ul>
    //     </div>
    // );
    return <D3Array />;
}
