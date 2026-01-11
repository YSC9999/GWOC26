import { Variants, TargetAndTransition } from "framer-motion";

export const fadeInUp: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.2, ease: "easeOut" }
    }
};

export const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.05,
            delayChildren: 0.1
        }
    }
};

export const hoverScale: TargetAndTransition = {
    scale: 1.02,
    transition: { duration: 0.05, type: "spring", stiffness: 400, damping: 20 }
};

export const clickTap: TargetAndTransition = {
    scale: 0.98,
    transition: { duration: 0.05, type: "spring", stiffness: 400, damping: 20 }
};

export const instantSpring = {
    type: "spring" as const,
    stiffness: 500,
    damping: 30,
    mass: 0.5,
    duration: 0.1
};

export const pageTransition = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
    transition: { duration: 0.2 }
};
