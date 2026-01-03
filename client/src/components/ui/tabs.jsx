import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

export const Tabs = ({ tabs, containerClassName, activeTabClassName, tabClassName, contentClassName }) => {
    const [active, setActive] = useState(tabs[0]);
    const [hovering, setHovering] = useState(false);

    const moveSelectedTabToTop = (idx) => {
        const newTabs = [...tabs];
        const selectedTab = newTabs.splice(idx, 1);
        newTabs.unshift(selectedTab[0]);
        setActive(newTabs[0]);
    };

    return (
        <>
            <div
                className={cn(
                    "flex flex-row items-center justify-start [perspective:1000px] relative overflow-auto sm:overflow-visible no-visible-scrollbar max-w-full w-full",
                    containerClassName
                )}
            >
                {tabs.map((tab, idx) => (
                    <button
                        key={tab.title}
                        onClick={() => {
                            moveSelectedTabToTop(idx);
                        }}
                        onMouseEnter={() => setHovering(true)}
                        onMouseLeave={() => setHovering(false)}
                        className={cn("relative px-4 py-2 rounded-full", tabClassName)}
                        style={{
                            transformStyle: "preserve-3d",
                        }}
                    >
                        {active.value === tab.value && (
                            <motion.div
                                layoutId="clickedbutton"
                                transition={{ type: "spring", bounce: 0.3, duration: 0.6 }}
                                className={cn(
                                    "absolute inset-0 bg-gray-200 dark:bg-zinc-800 rounded-full",
                                    activeTabClassName
                                )}
                            />
                        )}

                        <span className="relative block text-black dark:text-white">
                            {tab.title}
                        </span>
                    </button>
                ))}
            </div>
            <AnimatePresence mode="wait">
                <motion.div
                    key={active.value}
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -10, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className={cn("mt-8", contentClassName)}
                >
                    {active.content}
                </motion.div>
            </AnimatePresence>
        </>
    );
};
