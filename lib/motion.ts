import { Variants } from "framer-motion";

// Spring Physics Configs
export const springTransition = {
  type: "spring" as const,
  stiffness: 300,
  damping: 25,
  mass: 0.8,
};

export const gentleSpring = {
  type: "spring" as const,
  stiffness: 180,
  damping: 20,
};

export const smoothTransition = {
  duration: 0.45,
  ease: [0.21, 0.47, 0.32, 0.98] as const,
};

// Spatial Container Reveal with Staggered Children
export const containerRevealVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
};

// Spatial Item Entrance
export const itemRevealVariants: Variants = {
  hidden: { opacity: 0, y: 24, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: springTransition,
  },
};

// Scroll Section Reveal Variant
export const sectionRevealVariants: Variants = {
  hidden: { opacity: 0, y: 35 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.21, 0.47, 0.32, 0.98],
    },
  },
};

// 3D Spatial Depth Card Hover Variant
export const spatialCardVariants: Variants = {
  initial: {
    rotateX: 0,
    rotateY: 0,
    scale: 1,
    boxShadow: "0 10px 30px -15px rgba(0, 0, 0, 0.3)",
  },
  hover: {
    scale: 1.02,
    y: -4,
    boxShadow: "0 22px 45px -15px rgba(255, 90, 54, 0.22)",
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 20,
    },
  },
  tap: {
    scale: 0.98,
  },
};

// Floating Card Continuous Loop Animation
export const floatingLoopAnimation = {
  y: [0, -10, 0],
  transition: {
    duration: 4,
    repeat: Infinity,
    repeatType: "mirror" as const,
    ease: "easeInOut",
  },
};

export const floatingLoopSecondary = {
  y: [0, 8, 0],
  transition: {
    duration: 4.5,
    repeat: Infinity,
    repeatType: "mirror" as const,
    ease: "easeInOut",
    delay: 0.5,
  },
};

// Grid Item Stagger Container
export const gridContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

// Modal / Dialog Spatial Scale Entrance
export const modalVariants: Variants = {
  hidden: { opacity: 0, scale: 0.92, y: 15 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: springTransition,
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 10,
    transition: { duration: 0.2, ease: "easeOut" },
  },
};

// Drawer Slide-in from Right
export const drawerRightVariants: Variants = {
  hidden: { x: "100%", opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: smoothTransition,
  },
  exit: {
    x: "100%",
    opacity: 0,
    transition: { duration: 0.3, ease: "easeInOut" },
  },
};

