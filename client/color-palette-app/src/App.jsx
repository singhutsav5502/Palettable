import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TemplateDisplay from './components/TemplateDisplay';
import ColorPaletteBar from './components/ColorPaletteBar';
import TemplateSidebar from './components/TemplateSidebar';
import PaletteSidebar from './components/PaletteSidebar';
import Loading from './components/Loading';
import Error from './components/Error';
import WelcomeModal from './components/WelcomeModal';
import { templateApi, paletteApi } from './services/api';
import { ToastProvider, useToast } from './contexts/ToastContext';

function AppContent() {
  // State for templates and palettes
  const [templates, setTemplates] = useState([]);
  const [palettes, setPalettes] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [selectedPalette, setSelectedPalette] = useState(null);
  
  // State for sidebar visibility
  const [isTemplateSidebarOpen, setIsTemplateSidebarOpen] = useState(false);
  const [isPaletteSidebarOpen, setIsPaletteSidebarOpen] = useState(false);
  
  // State for loading and errors
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Get toast function
  const { addToast } = useToast();

  // Fetch templates and palettes on component mount
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [templatesData, palettesData] = await Promise.all([
          templateApi.getAllTemplates(),
          paletteApi.getAllPalettes()
        ]);
        
        setTemplates(templatesData);
        setPalettes(palettesData);
        
        // Set default selections
        if (templatesData.length > 0) {
          setSelectedTemplate(templatesData[0]);
        }
        
        if (palettesData.length > 0) {
          setSelectedPalette(palettesData[0]);
        }
      } catch (err) {
        setError(err.message);
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, []);

  // Generate a random color palette
  const generateRandomPalette = () => {
    const randomColors = Array.from({ length: 5 }, () => {
      const hex = Math.floor(Math.random() * 16777215).toString(16);
      return `#${hex.padStart(6, '0')}`;
    });
    
    setSelectedPalette({
      _id: 'random',
      name: 'Random Palette',
      colors: randomColors,
      likes: 0,
      views: 0
    });
    
    addToast('Random palette generated!', 'info');
  };

  // Save the current palette to the database
  const saveCurrentPalette = async (name) => {
    if (!selectedPalette) return;
    
    try {
      const newPalette = await paletteApi.createPalette({
        name: name || `Palette ${new Date().toLocaleString()}`,
        colors: selectedPalette.colors
      });
      
      setPalettes([newPalette, ...palettes]);
      setSelectedPalette(newPalette);
      addToast('Palette saved successfully!', 'success');
    } catch (err) {
      console.error('Error saving palette:', err);
      addToast(`Failed to save palette: ${err.message}`, 'error');
    }
  };

  // Toggle sidebars
  const toggleTemplateSidebar = () => setIsTemplateSidebarOpen(!isTemplateSidebarOpen);
  const togglePaletteSidebar = () => setIsPaletteSidebarOpen(!isPaletteSidebarOpen);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-beige-100">
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-beige-100">
        <Error 
          message={error} 
          onRetry={() => window.location.reload()} 
        />
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden bg-beige-50 font-sans">
      {/* Welcome Modal */}
      <WelcomeModal />
      
      {/* Main content area */}
      <main className="h-full overflow-auto">
        {selectedTemplate ? (
          <TemplateDisplay 
            template={selectedTemplate} 
            palette={selectedPalette} 
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full">
            <h2 className="text-2xl font-bold text-amber-800 mb-4">No templates available</h2>
            <button
              onClick={toggleTemplateSidebar}
              className="px-6 py-3 bg-amber-700 text-white rounded-md hover:bg-amber-800 transition-colors"
            >
              Browse Templates
            </button>
          </div>
        )}
      </main>

      {/* Bottom floating color palette bar */}
      <ColorPaletteBar 
        palette={selectedPalette}
        onGenerateRandom={generateRandomPalette}
        onSave={saveCurrentPalette}
        onOpenPalettes={togglePaletteSidebar}
        onSelectPalette={setSelectedPalette}
      />

      {/* Template sidebar (left) */}
      <AnimatePresence>
        {isTemplateSidebarOpen && (
          <TemplateSidebar 
            templates={templates}
            selectedTemplate={selectedTemplate}
            onSelectTemplate={setSelectedTemplate}
            onClose={toggleTemplateSidebar}
            setTemplates={setTemplates}
          />
        )}
      </AnimatePresence>

      {/* Palette sidebar (right) */}
      <AnimatePresence>
        {isPaletteSidebarOpen && (
          <PaletteSidebar 
            palettes={palettes}
            selectedPalette={selectedPalette}
            onSelectPalette={setSelectedPalette}
            onClose={togglePaletteSidebar}
            setPalettes={setPalettes}
          />
        )}
      </AnimatePresence>

      {/* Buttons to open sidebars when closed */}
      {!isTemplateSidebarOpen && (
        <motion.button
          className="fixed left-4 top-4 p-3 bg-amber-700 text-white rounded-full shadow-lg hover:bg-amber-800 cursor-pointer"
          onClick={toggleTemplateSidebar}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          aria-label="Open templates"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </motion.button>
      )}

      {!isPaletteSidebarOpen && (
        <motion.button
          className="fixed right-4 top-4 p-3 bg-amber-700 text-white rounded-full shadow-lg hover:bg-amber-800 cursor-pointer"
          onClick={togglePaletteSidebar}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          aria-label="Open palettes"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
          </svg>
        </motion.button>
      )}
    </div>
  );
}

function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}

export default App;