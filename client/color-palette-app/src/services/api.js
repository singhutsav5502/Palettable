const API_CONFIG = {
  baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
};

// Function to update the base URL if needed
export const updateApiConfig = (newConfig) => {
  Object.assign(API_CONFIG, newConfig);
};

// Generic fetch wrapper with error handling
const fetchApi = async (endpoint, options = {}) => {
  try {
    const url = `${API_CONFIG.baseUrl}/${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API request failed with status ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    throw error;
  }
};

// Palette API calls
export const paletteApi = {
  // Get all palettes
  getAllPalettes: async () => {
    return fetchApi('palettes');
  },
  
  // Create a new palette
  createPalette: async (palette) => {
    return fetchApi('palettes', {
      method: 'POST',
      body: JSON.stringify(palette),
    });
  },
  
  // Like a palette
  likePalette: async (id) => {
    return fetchApi(`palettes/${id}/like`, {
      method: 'PUT',
    });
  },
  
  // Increment view count
  viewPalette: async (id) => {
    return fetchApi(`palettes/${id}/view`, {
      method: 'PUT',
    });
  }
};

// Template API calls
export const templateApi = {
  // Get all templates
  getAllTemplates: async () => {
    return fetchApi('templates');
  },
  
  // Like a template
  likeTemplate: async (id) => {
    return fetchApi(`templates/${id}/like`, {
      method: 'PUT',
    });
  },
  
  // View a template (increment view count)
  viewTemplate: async (id) => {
    return fetchApi(`templates/${id}/view`, {
      method: 'PUT',
    });
  },
  
  // Get template HTML content
  getTemplateHtml: async (id) => {
    const url = `${API_CONFIG.baseUrl}/templates/${id}/html`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch template HTML: ${response.status}`);
    }
    
    return response.text();
  },
  
  // Get template thumbnail URL
  getTemplateThumbnailUrl: (id) => {
    return `${API_CONFIG.baseUrl}/templates/${id}/thumbnail`;
  },
  
  // Upload a template
  uploadTemplate: async (formData) => {
    try {
      const url = `${API_CONFIG.baseUrl}/templates`;
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Upload failed with status ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Template upload error:', error);
      throw error;
    }
  }
};