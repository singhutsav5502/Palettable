import { motion } from 'framer-motion';

function AnimatedHeader({ children, className = '' }) {
  return (
    <motion.h2
      className={`text-2xl font-bold mb-4 font-display ${className}`}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {children}
    </motion.h2>
  );
}

export default AnimatedHeader;