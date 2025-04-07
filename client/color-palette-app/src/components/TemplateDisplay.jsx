import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { templateApi } from '../services/api';

function TemplateDisplay({ template, palette }) {
  const iframeRef = useRef(null);

  // Increment view count when template changes
  useEffect(() => {
    if (template?._id) {
      templateApi.viewTemplate(template._id).catch(err => {
        console.error('Error updating template view count:', err);
      });
    }
  }, [template?._id]);

  // Render template with the selected palette
  const renderTemplate = () => {
    if (!template || !palette) return null;
    
    let html = template.html;
    
    // Replace color variables in the template with the selected palette colors
    palette.colors.forEach((color, index) => {
      const regex = new RegExp(`\\{\\{color${index + 1}\\}\\}`, 'g');
      html = html.replace(regex, color);
    });
    
    return html;
  };

  if (!template || !palette) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-beige-700">Select a template and color palette to get started</p>
      </div>
    );
  }

  return (
    <motion.div
      className="max-w-6xl mx-auto h-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="bg-white rounded-lg shadow-lg overflow-hidden h-full">
        <iframe
          ref={iframeRef}
          srcDoc={renderTemplate()}
          title={template.name}
          className="w-full h-full border-0"
          sandbox="allow-scripts"
        />
      </div>
    </motion.div>
  );
}

export default TemplateDisplay;