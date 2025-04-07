import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { templateApi } from '../services/api';

function TemplateSidebar({ templates, selectedTemplate, onSelectTemplate, onClose, setTemplates }) {
  const [activeTab, setActiveTab] = useState('browse');
  const [sortBy, setSortBy] = useState('likes');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Upload form state
  const [templateName, setTemplateName] = useState('');
  const [htmlFile, setHtmlFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [autoGenerateThumbnail, setAutoGenerateThumbnail] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewHtml, setPreviewHtml] = useState('');
  
  const fileInputRef = useRef(null);

  // Filter and sort templates
  const filteredTemplates = templates.filter(template => 
    template.name.toLowerCase().includes(searchQuery.toLowerCase())
  ).sort((a, b) => {
    if (sortBy === 'likes') return b.likes - a.likes;
    if (sortBy === 'views') return b.views - a.views;
    if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
    return 0;
  });

  // Handle template file change
  const handleHtmlFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setHtmlFile(file);
      
      // Preview the HTML
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreviewHtml(event.target.result);
      };
      reader.readAsText(file);
    }
  };

  // Handle thumbnail file change
  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setThumbnailFile(file);
    }
  };

  // Handle template upload
  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (!templateName || !htmlFile || (!thumbnailFile && !autoGenerateThumbnail)) {
      alert('Please fill in all required fields');
      return;
    }
    
    setUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('name', templateName);
      formData.append('html', htmlFile);
      
      if (thumbnailFile) {
        formData.append('thumbnail', thumbnailFile);
      }
      
      formData.append('autoGenerateThumbnail', autoGenerateThumbnail.toString());
      
      const newTemplate = await templateApi.uploadTemplate(formData);
      
      // Add the new template to the list
      setTemplates([newTemplate, ...templates]);
      
      // Reset form
      setTemplateName('');
      setHtmlFile(null);
      setThumbnailFile(null);
      setAutoGenerateThumbnail(false);
      setPreviewHtml('');
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      // Switch to browse tab and select the new template
      setActiveTab('browse');
      onSelectTemplate(newTemplate);
      
      alert('Template uploaded successfully!');
    } catch (error) {
      alert(`Failed to upload template: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  // Like a template
  const handleLikeTemplate = async (id) => {
    try {
      await templateApi.likeTemplate(id);
      
      // Update the templates list
      setTemplates(templates.map(template => 
        template._id === id ? { ...template, likes: template.likes + 1 } : template
      ));
    } catch (error) {
      console.error('Error liking template:', error);
    }
  };

  return (
    <motion.div
      className="fixed left-0 top-0 bottom-0 w-80 bg-white shadow-lg border-r border-beige-200 z-10 overflow-hidden"
      initial={{ x: -320 }}
      animate={{ x: 0 }}
      exit={{ x: -320 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b border-beige-200 flex justify-between items-center">
          <h2 className="font-display text-xl text-beige-900">Templates</h2>
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
            className={`flex-1 py-3 font-medium ${activeTab === 'upload' ? 'text-beige-900 border-b-2 border-beige-700' : 'text-beige-600'}`}
            onClick={() => setActiveTab('upload')}
          >
            Upload
          </button>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'browse' ? (
            <div className="p-4">
              {/* Search and sort */}
              <div className="mb-4 space-y-3">
                <input
                  type="text"
                  placeholder="Search templates..."
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
              
              {/* Templates list */}
              <div className="space-y-4">
                {filteredTemplates.length > 0 ? (
                  filteredTemplates.map(template => (
                    <motion.div
                      key={template._id}
                      className={`border rounded-lg overflow-hidden cursor-pointer ${
                        selectedTemplate?._id === template._id ? 'ring-2 ring-beige-700' : ''
                      }`}
                      onClick={() => onSelectTemplate(template)}
                      whileHover={{ y: -3 }}
                    >
                      <div className="relative">
                        <img
                          src={`${import.meta.env.VITE_API_URL || ''}${template.thumbnail}`}
                          alt={template.name}
                          className="w-full h-32 object-cover"
                        />
                      </div>
                      <div className="p-3">
                        <h3 className="font-medium text-beige-900 mb-1">{template.name}</h3>
                        <div className="flex justify-between text-sm text-beige-600">
                          <span>{template.views} views</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleLikeTemplate(template._id);
                            }}
                            className="flex items-center gap-1 hover:text-beige-900"
                          >
                            <span>❤️</span>
                            <span>{template.likes}</span>
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-8 text-beige-600">
                    No templates found
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-4">
              <form onSubmit={handleUpload} className="space-y-4">
                <div>
                  <label className="block mb-1 font-medium text-beige-800">Template Name</label>
                  <input
                    type="text"
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    className="w-full px-3 py-2 border border-beige-300 rounded-md bg-beige-50 focus:ring-2 focus:ring-beige-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block mb-1 font-medium text-beige-800">HTML Template</label>
                  <p className="text-xs text-beige-600 mb-1">
                    {`Use {{color1}}, {{color2}}, etc. as variables for palette colors`}
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".html"
                    onChange={handleHtmlFileChange}
                    className="w-full px-3 py-2 border border-beige-300 rounded-md bg-beige-50 file:mr-3 file:py-1 file:px-3 file:border-0 file:rounded-md file:bg-beige-600 file:text-white"
                    required
                  />
                </div>
                
                <div className="flex items-center">
                  <input
                    id="auto-generate"
                    type="checkbox"
                    checked={autoGenerateThumbnail}
                    onChange={() => setAutoGenerateThumbnail(!autoGenerateThumbnail)}
                    className="w-4 h-4 text-beige-700 border-beige-300 rounded focus:ring-beige-500"
                  />
                  <label htmlFor="auto-generate" className="ml-2 text-sm text-beige-800">
                    Auto-generate thumbnail
                  </label>
                </div>
                
                <div className={autoGenerateThumbnail ? "opacity-50 pointer-events-none" : ""}>
                  <label className="block mb-1 font-medium text-beige-800">
                    Thumbnail Image {autoGenerateThumbnail && "(Auto-generated)"}
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleThumbnailChange}
                    className="w-full px-3 py-2 border border-beige-300 rounded-md bg-beige-50 file:mr-3 file:py-1 file:px-3 file:border-0 file:rounded-md file:bg-beige-600 file:text-white"
                    disabled={autoGenerateThumbnail}
                    required={!autoGenerateThumbnail}
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={uploading}
                  className="w-full py-2 bg-beige-700 text-white rounded-md hover:bg-beige-800 disabled:opacity-50"
                >
                  {uploading ? 'Uploading...' : 'Upload Template'}
                </button>
              </form>
              
              {previewHtml && (
                <div className="mt-4">
                  <h3 className="font-medium text-beige-800 mb-2">Preview</h3>
                  <div className="border border-beige-300 rounded-md overflow-hidden">
                    <iframe
                      srcDoc={previewHtml}
                      title="Template Preview"
                      className="w-full h-48 border-0"
                      sandbox="allow-scripts"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default TemplateSidebar;