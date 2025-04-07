import { motion } from 'framer-motion';

function Loading() {
  return (
    <div className="flex items-center justify-center h-full">
      <motion.div
        className="w-16 h-16 border-t-4 border-beige-700 rounded-full"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
}

export default Loading;