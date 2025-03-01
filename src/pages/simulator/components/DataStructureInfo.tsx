export function DataStructureInfo({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex-[4] flex flex-row border-2 border-gray-300 bg-gray-100 rounded-3xl p-4 w-full overflow-hidden">
            <div className="h-full w-full overflow-auto">{children}</div>
        </div>
    );
}
