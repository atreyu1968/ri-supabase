import React, { useState, useEffect } from 'react';
import { Upload, Save } from 'lucide-react';
import { useBrandingStore } from '../../stores/brandingStore';
import type { BrandingConfig as BrandingConfigType } from '../../types/admin';
import { DEFAULT_LOGO_URL } from '../../config/constants';

const BrandingConfig = () => {
  const { config, updateConfig } = useBrandingStore();
  const [formData, setFormData] = useState<BrandingConfigType>(config);
  const [logoPreview, setLogoPreview] = useState<string | null>(config.logoUrl);
  const [faviconPreview, setFaviconPreview] = useState<string | null>(config.faviconUrl);

  // Preview colors without applying them
  const previewColors = (colors: typeof formData.colors) => {
    const root = document.documentElement;
    root.style.setProperty('--preview-primary', colors.primary);
    root.style.setProperty('--preview-secondary', colors.secondary);
    root.style.setProperty('--preview-accent', colors.accent);
  };

  // Reset color preview
  const resetPreview = () => {
    const root = document.documentElement;
    root.style.removeProperty('--preview-primary');
    root.style.removeProperty('--preview-secondary');
    root.style.removeProperty('--preview-accent');
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setLogoPreview(base64);
        setFormData(prev => ({ ...prev, logoUrl: base64 }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFaviconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setFaviconPreview(base64);
        setFormData(prev => ({ ...prev, faviconUrl: base64 }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateConfig(formData);
    resetPreview();
  };

  const predefinedThemes = [
    {
      name: 'Default',
      colors: {
        primary: '#2563eb',
        secondary: '#4b5563',
        accent: '#8b5cf6',
      },
    },
    {
      name: 'Ocean',
      colors: {
        primary: '#0891b2',
        secondary: '#334155',
        accent: '#06b6d4',
      },
    },
    {
      name: 'Forest',
      colors: {
        primary: '#059669',
        secondary: '#374151',
        accent: '#10b981',
      },
    },
    {
      name: 'Sunset',
      colors: {
        primary: '#db2777',
        secondary: '#4a044e',
        accent: '#e11d48',
      },
    },
    {
      name: 'Autumn',
      colors: {
        primary: '#d97706',
        secondary: '#78350f',
        accent: '#ea580c',
      },
    }
  ];

  const applyTheme = (theme: typeof predefinedThemes[0]) => {
    const newColors = theme.colors;
    setFormData(prev => ({ ...prev, colors: newColors }));
    previewColors(newColors);
  };

  // Clean up preview on unmount
  useEffect(() => {
    return () => resetPreview();
  }, []);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Identidad Visual
        </h3>
        
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Logo
            </label>
            <div className="flex items-center space-x-4">
              {logoPreview && (
                <img
                  src={logoPreview}
                  alt="Logo preview"
                  className="h-16 w-auto"
                  onError={(e) => {
                    const img = e.target as HTMLImageElement;
                    img.src = DEFAULT_LOGO_URL;
                  }}
                />
              )}
              <label className="flex items-center space-x-2 px-4 py-2 border rounded-md cursor-pointer hover:bg-gray-50">
                <Upload className="w-5 h-5 text-gray-500" />
                <span className="text-sm text-gray-700">Subir Logo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Favicon
            </label>
            <div className="flex items-center space-x-4">
              {faviconPreview && (
                <img
                  src={faviconPreview}
                  alt="Favicon preview"
                  className="h-8 w-8"
                />
              )}
              <label className="flex items-center space-x-2 px-4 py-2 border rounded-md cursor-pointer hover:bg-gray-50">
                <Upload className="w-5 h-5 text-gray-500" />
                <span className="text-sm text-gray-700">Subir Favicon</span>
                <input
                  type="file"
                  accept="image/x-icon,image/png"
                  onChange={handleFaviconChange}
                  className="hidden"
                />
              </label>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Recomendado: PNG 32x32px o ICO
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fuente Principal
            </label>
            <select
              value={formData.font}
              onChange={(e) => setFormData(prev => ({ ...prev, font: e.target.value }))}
              className="w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="inter">Inter</option>
              <option value="roboto">Roboto</option>
              <option value="opensans">Open Sans</option>
              <option value="lato">Lato</option>
            </select>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Colores
        </h3>
        
        <div className="grid grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Color Principal
            </label>
            <input
              type="color"
              value={formData.colors.primary}
              onChange={(e) => {
                const newColors = {
                  ...formData.colors,
                  primary: e.target.value
                };
                setFormData(prev => ({
                  ...prev,
                  colors: newColors
                }));
                previewColors(newColors);
              }}
              className="w-full h-10 rounded-md cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Color Secundario
            </label>
            <input
              type="color"
              value={formData.colors.secondary}
              onChange={(e) => {
                const newColors = {
                  ...formData.colors,
                  secondary: e.target.value
                };
                setFormData(prev => ({
                  ...prev,
                  colors: newColors
                }));
                previewColors(newColors);
              }}
              className="w-full h-10 rounded-md cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Color de Acento
            </label>
            <input
              type="color"
              value={formData.colors.accent}
              onChange={(e) => {
                const newColors = {
                  ...formData.colors,
                  accent: e.target.value
                };
                setFormData(prev => ({
                  ...prev,
                  colors: newColors
                }));
                previewColors(newColors);
              }}
              className="w-full h-10 rounded-md cursor-pointer"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Temas Predefinidos
        </h3>
        
        <div className="grid grid-cols-3 gap-4">
          {predefinedThemes.map((theme) => (
            <button
              key={theme.name}
              type="button"
              onClick={() => applyTheme(theme)}
              className="p-4 border rounded-lg hover:bg-gray-50 transition-all duration-200"
            >
              <div className="text-sm font-medium mb-2">{theme.name}</div>
              <div className="flex space-x-2">
                {Object.values(theme.colors).map((color, index) => (
                  <div
                    key={index}
                    className="w-6 h-6 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Save className="w-5 h-5" />
          <span>Guardar Cambios</span>
        </button>
      </div>
    </form>
  );
};

export default BrandingConfig;