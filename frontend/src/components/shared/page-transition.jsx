import { motion } from "framer-motion";

export function PageTransition({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14, scale: 0.995 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.995 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}


