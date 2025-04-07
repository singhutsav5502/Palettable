import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ColorPicker from "./ColorPicker";

function ColorPaletteBar({
  palette,
  onGenerateRandom,
  onSave,
  onOpenPalettes,
  onSelectPalette
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [paletteName, setPaletteName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [editablePalette, setEditablePalette] = useState(null);

  // Initialize editable palette when the actual palette changes
  useEffect(() => {
    if (palette) {
      setEditablePalette({ ...palette });
    }
  }, [palette]);

  const handleSave = async () => {
    setIsSaving(true);
    await onSave(paletteName);
    setPaletteName("");
    setIsSaving(false);
  };

  const handleColorChange = (index, newColor) => {
    if (!editablePalette) return;

    const newColors = [...editablePalette.colors];
    newColors[index] = newColor;

    setEditablePalette({
      ...editablePalette,
      colors: newColors,
    });

    // Update the actual palette in the parent component
    onSelectPalette({
      ...palette,
      colors: newColors,
    });
  };

  if (!palette || !editablePalette) return null;

  return (
    <motion.div
      className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-beige-200"
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 rounded-full hover:bg-beige-100"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-5 w-5 text-beige-800 transform transition-transform ${
                  isExpanded ? "rotate-180" : ""
                }`}
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            <h3 className="font-display text-lg text-beige-900">
              {editablePalette.name}
            </h3>
          </div>

          <div className="flex items-center">
            <div className="flex mr-4">
              {editablePalette.colors.map((color, index) => (
                <motion.div
                  key={index}
                  className="w-8 h-8 rounded-md shadow-sm mx-1"
                  style={{ backgroundColor: color }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  title={color}
                />
              ))}
            </div>

            <div className="flex space-x-2">
              <motion.button
                onClick={onGenerateRandom}
                className="px-3 py-1 bg-beige-600 text-white rounded-md text-sm"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Random
              </motion.button>

              <motion.button
                onClick={onOpenPalettes}
                className="px-3 py-1 bg-beige-700 text-white rounded-md text-sm"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Browse Palettes
              </motion.button>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              className="py-4 border-t border-beige-200"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex flex-wrap items-center gap-4">
                {editablePalette.colors.map((color, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <ColorPicker
                      color={color}
                      onChange={(newColor) =>
                        handleColorChange(index, newColor)
                      }
                    />
                    <input
                      type="text"
                      value={color}
                      onChange={(e) => handleColorChange(index, e.target.value)}
                      className="w-20 text-center border border-beige-300 rounded-md px-2 py-1 text-sm bg-beige-50 mt-2"
                      onClick={(e) => e.target.select()}
                    />
                  </div>
                ))}

                <div className="ml-auto flex items-center gap-3">
                  <input
                    type="text"
                    value={paletteName}
                    onChange={(e) => setPaletteName(e.target.value)}
                    placeholder="Palette name"
                    className="border border-beige-300 rounded-md px-3 py-2 bg-beige-50 focus:ring-2 focus:ring-beige-500 focus:border-transparent"
                  />

                  <motion.button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="px-4 py-2 bg-beige-800 text-white rounded-md disabled:opacity-50"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {isSaving ? "Saving..." : "Save Palette"}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export default ColorPaletteBar;
