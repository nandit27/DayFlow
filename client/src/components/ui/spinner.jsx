import { cn } from "@/lib/utils";

export const Spinner = ({ className, size = "md" }) => {
    const sizeClasses = {
        sm: "w-4 h-4 border-2",
        md: "w-6 h-6 border-2",
        lg: "w-8 h-8 border-3",
        xl: "w-12 h-12 border-4",
    };

    return (
        <div
            className={cn(
                "border-cyan-400 border-t-transparent rounded-full animate-spin",
                sizeClasses[size],
                className
            )}
        />
    );
};

export const LoadingOverlay = ({ message = "Loading..." }) => {
    return (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-slate-900 rounded-2xl p-8 flex flex-col items-center gap-4 border border-slate-800">
                <Spinner size="xl" />
                <p className="text-white text-lg">{message}</p>
            </div>
        </div>
    );
};
