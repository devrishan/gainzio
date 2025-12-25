import type { MotionProps } from "framer-motion";

export const viewport: MotionProps["viewport"] = { once: true, amount: 0.3 };

export const fadeInUp: MotionProps["variants"] = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0 },
};

export const fadeIn: MotionProps["variants"] = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

export const stagger: MotionProps["variants"] = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
    },
  },
};

