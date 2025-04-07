import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { templateApi } from '../services/api';
import Loading from './Loading';

function TemplateDisplay({ template, palette }) {
  const iframeRef = useRef(null);
  const [templateHtml, setTemplateHtml] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch HTML content and increment view count when template changes
  useEffect(() => {
    if (template?._id) {
      setLoading(true);
      setError(null);
      
      // Increment view count
      templateApi.viewTemplate(template._id).catch(err => {
        console.error('Error updating template view count:', err);
      });
      
      // Fetch HTML content
      templateApi.getTemplateHtml(template._id)
        .then(html => {
          setTemplateHtml(html);
          setLoading(false);
        })
        .catch(err => {
          console.error('Error fetching template HTML:', err);
          setError('Failed to load template content');
          setLoading(false);
        });
    }
  }, [template?._id]);

  // Render template with the selected palette
  const renderTemplate = () => {
    if (!templateHtml || !palette) return null;
    
    let html = templateHtml;
    
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-red-500">{error}</p>
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