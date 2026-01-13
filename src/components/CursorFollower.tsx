"use client";
import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export default function CursorFollower() {
    const [cursorXY, setCursorXY] = useState({ x: -100, y: -100 });
    const [hovered, setHovered] = useState(false);

    const cursorX = useMotionValue(-100);
    const cursorY = useMotionValue(-100);

    const springConfig = { damping: 25, stiffness: 300 };
    const cursorXSpring = useSpring(cursorX, springConfig);
    const cursorYSpring = useSpring(cursorY, springConfig);

    useEffect(() => {
        const moveCursor = (e: MouseEvent) => {
            cursorX.set(e.clientX - 16);
            cursorY.set(e.clientY - 16);
            setCursorXY({ x: e.clientX, y: e.clientY });
        };

        const handleMouseOver = (e: MouseEvent) => {
            if ((e.target as HTMLElement).tagName === 'BUTTON' || (e.target as HTMLElement).tagName === 'A' || (e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('a')) {
                setHovered(true);
            } else {
                setHovered(false);
            }
        };

        window.addEventListener("mousemove", moveCursor);
        window.addEventListener("mouseover", handleMouseOver);

        return () => {
            window.removeEventListener("mousemove", moveCursor);
            window.removeEventListener("mouseover", handleMouseOver);
        };
    }, [cursorX, cursorY]);

    // Hide on touch devices
    if (typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches) return null;

    return (
        <>
            <motion.div
                className="fixed top-0 left-0 w-8 h-8 border border-clay rounded-full pointer-events-none z-[9999]"
                style={{
                    x: cursorXSpring,
                    y: cursorYSpring,
                    opacity: 1,
                    scale: hovered ? 1.5 : 1,
                }}
            />
            <motion.div
                className="fixed top-0 left-0 w-2 h-2 bg-clay rounded-full pointer-events-none z-[9999]"
                style={{
                    x: cursorXSpring,
                    y: cursorYSpring,
                    translateX: 12, // Center dot relative to ring
                    translateY: 12,
                }}
                animate={{ scale: hovered ? 0.5 : 1 }}
            />
        </>
    );
}
