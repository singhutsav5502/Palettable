import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ColorPicker from './ColorPicker';

function ColorHarmonies({ onSelectHarmony }) {
  const [baseColor, setBaseColor] = useState('#3b82f6');
  const [harmonies, setHarmonies] = useState({});

  useEffect(() => {
    generateHarmonies(baseColor);
  }, [baseColor]);

  // Convert hex to HSL
  const hexToHSL = (hex) => {
    // Remove the # if present
    hex = hex.replace(/^#/, '');
    
    // Parse the hex values
    let r = parseInt(hex.substring(0, 2), 16) / 255;
    let g = parseInt(hex.substring(2, 4), 16) / 255;
    let b = parseInt(hex.substring(4, 6), 16) / 255;
    
    // Find min and max RGB values
    let max = Math.max(r, g, b);
    let min = Math.min(r, g, b);
    
    let h, s, l = (max + min) / 2;
    
    if (max === min) {
      h = s = 0; // achromatic
    } else {
      let d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
        default: break;
      }
      
      h /= 6;
    }
    
    return { h: h * 360, s: s * 100, l: l * 100 };
  };

  // Convert HSL to hex
  const hslToHex = (h, s, l) => {
    h /= 360;
    s /= 100;
    l /= 100;
    
    let r, g, b;
    
    if (s === 0) {
      r = g = b = l; // achromatic
    } else {
      const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };
      
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }
    
    const toHex = (x) => {
      const hex = Math.round(x * 255).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };
    
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  };

  // Generate color harmonies
  const generateHarmonies = (color) => {
    const hsl = hexToHSL(color);
    const { h, s, l } = hsl;
    
    // Calculate harmonies
    const complementary = [
      color,
      hslToHex((h + 180) % 360, s, l)
    ];
    
    const analogous = [
      hslToHex((h - 30 + 360) % 360, s, l),
      color,
      hslToHex((h + 30) % 360, s, l)
    ];
    
    const triadic = [
      color,
      hslToHex((h + 120) % 360, s, l),
      hslToHex((h + 240) % 360, s, l)
    ];
    
    const tetradic = [
      color,
      hslToHex((h + 90) % 360, s, l),
      hslToHex((h + 180) % 360, s, l),
      hslToHex((h + 270) % 360, s, l)
    ];
    
    const monochromatic = [
      hslToHex(h, s, Math.max(0, l - 30)),
      hslToHex(h, s, Math.max(0, l - 15)),
      color,
      hslToHex(h, s, Math.min(100, l + 15)),
      hslToHex(h, s, Math.min(100, l + 30))
    ];
    
    setHarmonies({
      complementary,
      analogous,
      triadic,
      tetradic,
      monochromatic
    });
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h3 className="font-display text-lg text-beige-900 mb-4">Color Harmonies</h3>
      
      <div className="mb-4">
        <label className="block mb-2 text-sm font-medium text-beige-800">Base Color</label>
        <div className="flex items-center gap-3">
          <ColorPicker color={baseColor} onChange={setBaseColor} />
          <input
            type="text"
            value={baseColor}
            onChange={(e) => setBaseColor(e.target.value)}
            className="w-24 text-center border border-beige-300 rounded-md px-2 py-1 text-sm bg-beige-50"
          />
        </div>
      </div>
      
      <div className="space-y-4">
        {Object.entries(harmonies).map(([name, colors]) => (
          <div key={name} className="border border-beige-200 rounded-md p-3">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-medium text-beige-800 capitalize">{name}</h4>
              <button
                onClick={() => onSelectHarmony(colors)}
                className="text-sm px-2 py-1 bg-beige-600 text-white rounded-md hover:bg-beige-700"
              >
                Use
              </button>
            </div>
            <div className="flex h-8 rounded-md overflow-hidden">
              {colors.map((color, index) => (
                <div
                  key={index}
                  className="flex-1"
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ColorHarmonies;