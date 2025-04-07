import { motion } from 'framer-motion';

function Error({ message, onRetry }) {
  return (
    <motion.div
      className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md mx-auto"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className="h-16 w-16 text-red-500 mx-auto mb-4" 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
        />
      </svg>
      
      <h2 className="text-2xl font-bold text-beige-900 mb-4">Error</h2>
      <p className="text-beige-800 mb-6">{message}</p>
      
      {onRetry && (
        <motion.button
          className="px-6 py-2 bg-beige-700 text-white rounded-md hover:bg-beige-800"
          onClick={onRetry}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Try Again
        </motion.button>
      )}
    </motion.div>
  );
}

export default Error;