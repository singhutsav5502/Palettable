import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

function ColorPicker({ color, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentColor, setCurrentColor] = useState(color);
  const pickerRef = useRef(null);

  useEffect(() => {
    setCurrentColor(color);
  }, [color]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleColorChange = (e) => {
    const newColor = e.target.value;
    setCurrentColor(newColor);
    onChange(newColor);
  };

  const presetColors = [
    '#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', 
    '#03a9f4', '#00bcd4', '#009688', '#4caf50', '#8bc34a', '#cddc39', 
    '#ffeb3b', '#ffc107', '#ff9800', '#ff5722', '#795548', '#607d8b',
    '#000000', '#ffffff'
  ];

  return (
    <div className="relative" ref={pickerRef}>
      <motion.div
        className="w-10 h-10 rounded-md shadow-md cursor-pointer"
        style={{ backgroundColor: currentColor }}
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      />
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="absolute z-20 mt-2 p-3 bg-white rounded-lg shadow-xl border border-beige-200 h-auto w-[200px]"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <input
              type="color"
              value={currentColor}
              onChange={handleColorChange}
              className="w-full h-10 mb-3"
            />
            
            <div className="grid grid-cols-5 gap-2">
              {presetColors.map((presetColor, index) => (
                <motion.div
                  key={index}
                  className="w-6 h-6 rounded-md cursor-pointer"
                  style={{ backgroundColor: presetColor }}
                  onClick={() => {
                    setCurrentColor(presetColor);
                    onChange(presetColor);
                  }}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                />
              ))}
            </div>
            
            <input
              type="text"
              value={currentColor}
              onChange={(e) => {
                setCurrentColor(e.target.value);
                onChange(e.target.value);
              }}
              className="w-full mt-3 px-2 py-1 text-sm border border-beige-300 rounded-md"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ColorPicker;
