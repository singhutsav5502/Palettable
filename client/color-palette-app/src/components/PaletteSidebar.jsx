import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { paletteApi } from '../services/api';
import ColorHarmonies from './ColorHarmonies';
import { useToast } from '../contexts/ToastContext';

function PaletteSidebar({ palettes, selectedPalette, onSelectPalette, onClose, setPalettes }) {
  const [activeTab, setActiveTab] = useState('browse');
  const [sortBy, setSortBy] = useState('likes');
  const [searchQuery, setSearchQuery] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCount, setGeneratedCount] = useState(5);
  const { addToast } = useToast();
  
  // Filter and sort palettes
  const filteredPalettes = palettes.filter(palette => 
    palette.name.toLowerCase().includes(searchQuery.toLowerCase())
  ).sort((a, b) => {
    if (sortBy === 'likes') return b.likes - a.likes;
    if (sortBy === 'views') return b.views - a.views;
    if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
    return 0;
  });

  // Generate a new random palette
  const generateRandomPalette = () => {
    const randomColors = Array.from({ length: generatedCount }, () => {
      const hex = Math.floor(Math.random() * 16777215).toString(16);
      return `#${hex.padStart(6, '0')}`;
    });
    
    const randomPalette = {
      _id: 'random',
      name: 'Random Palette',
      colors: randomColors,
      likes: 0,
      views: 0
    };
    
    onSelectPalette(randomPalette);
    addToast('Random palette generated!', 'info');
  };

  // Handle harmony selection
  const handleSelectHarmony = (colors) => {
    const harmonyPalette = {
      _id: 'harmony',
      name: 'Harmony Palette',
      colors,
      likes: 0,
      views: 0
    };
    
    onSelectPalette(harmonyPalette);
    addToast('Harmony palette applied!', 'info');
  };

  // Save the current random palette
  const saveRandomPalette = async () => {
    if (!selectedPalette || (selectedPalette._id !== 'random' && selectedPalette._id !== 'harmony')) return;
    
    setIsGenerating(true);
    
    try {
      const newPalette = await paletteApi.createPalette({
        name: `${selectedPalette._id === 'harmony' ? 'Harmony' : 'Random'} Palette ${new Date().toLocaleTimeString()}`,
        colors: selectedPalette.colors
      });
      
      setPalettes([newPalette, ...palettes]);
      onSelectPalette(newPalette);
      
      addToast('Palette saved successfully!', 'success');
    } catch (error) {
      console.error('Error saving palette:', error);
      addToast('Failed to save palette', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  // Like a palette
  const handleLikePalette = async (id) => {
    try {
      await paletteApi.likePalette(id);
      
      // Update the palettes list
      setPalettes(palettes.map(palette => 
        palette._id === id ? { ...palette, likes: palette.likes + 1 } : palette
      ));
      
      addToast('Palette liked!', 'success');
    } catch (error) {
      console.error('Error liking palette:', error);
      addToast('Failed to like palette', 'error');
    }
  };

  return (
    <motion.div
      className="fixed right-0 top-0 bottom-0 w-80 bg-white shadow-lg border-l border-beige-200 z-10 overflow-hidden"
      initial={{ x: 320 }}
      animate={{ x: 0 }}
      exit={{ x: 320 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b border-beige-200 flex justify-between items-center">
          <h2 className="font-display text-xl text-beige-900">Color Palettes</h2>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-beige-100"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-beige-800" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        
        {/* Tabs */}
        <div className="flex border-b border-beige-200">
          <button
            className={`flex-1 py-3 font-medium ${activeTab === 'browse' ? 'text-beige-900 border-b-2 border-beige-700' : 'text-beige-600'}`}
            onClick={() => setActiveTab('browse')}
          >
            Browse
          </button>
          <button
            className={`flex-1 py-3 font-medium ${activeTab === 'generate' ? 'text-beige-900 border-b-2 border-beige-700' : 'text-beige-600'}`}
            onClick={() => setActiveTab('generate')}
          >
            Generate
          </button>
          <button
            className={`flex-1 py-3 font-medium ${activeTab === 'harmonies' ? 'text-beige-900 border-b-2 border-beige-700' : 'text-beige-600'}`}
            onClick={() => setActiveTab('harmonies')}
          >
            Harmonies
          </button>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            {activeTab === 'browse' && (
              <motion.div
                key="browse"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="p-4"
              >
                {/* Search and sort */}
                <div className="mb-4 space-y-3">
                  <input
                    type="text"
                    placeholder="Search palettes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-3 py-2 border border-beige-300 rounded-md bg-beige-50 focus:ring-2 focus:ring-beige-500 focus:border-transparent"
                  />
                  
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-3 py-2 border border-beige-300 rounded-md bg-beige-50 focus:ring-2 focus:ring-beige-500 focus:border-transparent"
                  >
                    <option value="likes">Sort by Most Liked</option>
                    <option value="views">Sort by Most Viewed</option>
                    <option value="newest">Sort by Newest</option>
                  </select>
                </div>
                
                {/* Palettes list */}
                <div className="space-y-4">
                  {filteredPalettes.length > 0 ? (
                    filteredPalettes.map(palette => (
                      <motion.div
                        key={palette._id}
                        className={`border rounded-lg overflow-hidden cursor-pointer ${
                          selectedPalette?._id === palette._id ? 'ring-2 ring-beige-700' : ''
                        }`}
                        onClick={() => {
                          if (palette._id && palette._id !== 'random' && palette._id !== 'harmony') {
                            paletteApi.viewPalette(palette._id)
                              .then(() => {
                                setPalettes(prevPalettes => 
                                  prevPalettes.map(p => 
                                    p._id === palette._id ? {...p, views: p.views + 1} : p
                                  )
                                );
                              })
                              .catch(err => console.error('Error updating palette view count:', err));
                          }
                          onSelectPalette(palette);
                        }}
                        whileHover={{ y: -3 }}
                      >
                        <div className="p-3">
                          <h3 className="font-medium text-beige-900 mb-2">{palette.name}</h3>
                          <div className="flex h-10 rounded-md overflow-hidden mb-2">
                            {palette.colors.map((color, index) => (
                              <div
                                key={index}
                                className="flex-1"
                                style={{ backgroundColor: color }}
                                title={color}
                              />
                            ))}
                          </div>
                          <div className="flex justify-between text-sm text-beige-600">
                            <span>{new Date(palette.createdAt).toLocaleDateString()}</span>
                            <div className="flex items-center gap-3">
                              <span>{palette.views} views</span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleLikePalette(palette._id);
                                }}
                                className="flex items-center gap-1 hover:text-beige-900"
                              >
                                <span>❤️</span>
                                <span>{palette.likes}</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-beige-600">
                      No palettes found
                    </div>
                  )}
                </div>
              </motion.div>
            )}
            
            {activeTab === 'generate' && (
              <motion.div
                key="generate"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="p-4"
              >
                <div className="space-y-4">
                  <div>
                    <label className="block mb-2 font-medium text-beige-800">Number of Colors</label>
                    <select
                      value={generatedCount}
                      onChange={(e) => setGeneratedCount(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-beige-300 rounded-md bg-beige-50 focus:ring-2 focus:ring-beige-500 focus:border-transparent"
                    >
                      {[3, 4, 5, 6].map(num => (
                        <option key={num} value={num}>{num} Colors</option>
                      ))}
                    </select>
                  </div>
                  
                  <motion.button
                    onClick={generateRandomPalette}
                    className="w-full py-2 bg-beige-600 text-white rounded-md hover:bg-beige-700"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Generate Random Palette
                  </motion.button>
                  
                  {(selectedPalette?._id === 'random' || selectedPalette?._id === 'harmony') && (
                    <motion.button
                      onClick={saveRandomPalette}
                      disabled={isGenerating}
                      className="w-full py-2 bg-beige-700 text-white rounded-md hover:bg-beige-800 disabled:opacity-50"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {isGenerating ? 'Saving...' : 'Save Current Palette'}
                    </motion.button>
                  )}
                  
                  {selectedPalette && (
                    <div className="mt-6">
                      <h3 className="font-medium text-beige-800 mb-3">Current Palette</h3>
                      <div className="border rounded-lg p-3">
                        <div className="flex h-10 rounded-md overflow-hidden mb-2">
                          {selectedPalette.colors.map((color, index) => (
                            <div
                              key={index}
                              className="flex-1"
                              style={{ backgroundColor: color }}
                              title={color}
                            />
                          ))}
                        </div>
                        <div className="text-sm text-beige-600">
                          {selectedPalette.name}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
            
            {activeTab === 'harmonies' && (
              <motion.div
                key="harmonies"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="p-4"
              >
                <ColorHarmonies onSelectHarmony={handleSelectHarmony} />
                
                {selectedPalette?._id === 'harmony' && (
                  <motion.button
                    onClick={saveRandomPalette}
                    disabled={isGenerating}
                    className="w-full py-2 mt-4 bg-beige-700 text-white rounded-md hover:bg-beige-800 disabled:opacity-50"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isGenerating ? 'Saving...' : 'Save Current Harmony'}
                  </motion.button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

export default PaletteSidebar;