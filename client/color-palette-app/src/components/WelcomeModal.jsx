import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import logo from '../assets/images/logo_inverted_upscaled.jpg';

function WelcomeModal() {
  const [isOpen, setIsOpen] = useState(true);
  
  const closeModal = () => {
    setIsOpen(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white rounded-lg shadow-xl max-w-md w-full"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25 }}
          >
            <div className="p-6">
              <div className="flex items-center justify-center mb-4">
                <img src={logo} alt="Palettable Logo" className="h-32 w-auto" />
              </div>
              <h2 className="font-display text-2xl text-beige-900 mb-4 text-center">Welcome to Palettable!</h2>
              
              <div className="space-y-4 text-beige-800">
                <p>
                  This app helps you create, preview, and save beautiful color palettes for your design projects.
                </p>
                
                <div className="space-y-2">
                  <h3 className="font-medium text-beige-900">How to use:</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>The main area shows your selected template with the current color palette applied</li>
                    <li>Use the left sidebar to browse and upload templates</li>
                    <li>Use the right sidebar to browse and generate color palettes</li>
                    <li>The bottom bar shows your current color palette and lets you edit colors</li>
                  </ul>
                </div>
                
                <p>
                  Get started by selecting a template or generating a new color palette!
                </p>
              </div>
              
              <div className="mt-6 flex justify-end">
                <motion.button
                  onClick={closeModal}
                  className="px-4 py-2 bg-beige-700 text-white rounded-md cursor-pointer"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Get Started
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default WelcomeModal;
