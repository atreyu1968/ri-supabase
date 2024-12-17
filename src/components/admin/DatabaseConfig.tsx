import React, { useState } from 'react';
import { Save, TestTube, AlertCircle, Database, ExternalLink, Server } from 'lucide-react';
import { useDatabaseConfigStore } from '../../stores/databaseConfigStore';
import DatabaseScripts from './database/DatabaseScripts';
import type { DatabaseConfig } from '../../types/admin';
import { DEFAULT_DB_CONFIG } from '../../config/constants';

const DatabaseConfig = () => {
  const { config, updateConfig, testConnection } = useDatabaseConfigStore();
  const [formData, setFormData] = useState<DatabaseConfig>({
    ...DEFAULT_DB_CONFIG,
    ...config,
    settings: {
      ...DEFAULT_DB_CONFIG.settings,
      ...config.settings
    }
  });
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [showScripts, setShowScripts] = useState(false);

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    
    if (!formData.settings.url || !formData.settings.anonKey) {
      setTestResult({
        success: false,
        message: 'La URL y la clave anónima son requeridas'
      });
      setTesting(false);
      return;
    }

    if (!formData.settings.url || !formData.settings.anonKey) {
      setTestResult({
        success: false,
        message: 'La URL y la clave anónima son requeridas'
      });
      setTesting(false);
      return;
    }
    
    try {
      const success = await testConnection(formData);
      setTestResult({
        success,
        message: success
          ? 'Conexión exitosa con Supabase'
          : 'Error al conectar con Supabase. Verifique las credenciales.'
      });
    } catch (error) {
      console.error('Error testing connection:', error);
      setTestResult({
        success: false,
        message: 'Error al probar la conexión. Por favor, inténtelo de nuevo.'
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateConfig(formData);
  };

  const handleOpenSupabase = () => {
    const supabaseUrl = formData.settings.url || 'https://supabase.iesmmg.es';
    window.open(`${supabaseUrl}/project/default`, '_blank');
  };

  const handleOpenSqlEditor = () => {
    const supabaseUrl = formData.settings.url || 'https://supabase.iesmmg.es';
    window.open(`${supabaseUrl}/project/default/sql`, '_blank');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Configuración de Base de Datos
        </h3>
        
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              URL del Servidor
            </label>
            <div className="relative">
              <Database className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <input
                type="url"
              value={formData.settings.url}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                settings: { ...prev.settings, url: e.target.value }
              }))}
              placeholder="https://your-project.supabase.co"
              className="pl-10 w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
            />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Clave Anónima
            </label>
            <input
              type="password"
              value={formData.settings.anonKey}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                settings: { ...prev.settings, anonKey: e.target.value }
              }))}
              placeholder="eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1..."
              className="w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Clave de Servicio
            </label>
            <input
              type="password"
              value={formData.settings.serviceRole}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                settings: { ...prev.settings, serviceRole: e.target.value }
              }))}
              className="w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Esquema
            </label>
            <input
              type="text"
              value={formData.settings.schema}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                settings: { ...prev.settings, schema: e.target.value }
              }))}
              placeholder="public"
              className="w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="col-span-2 space-y-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.enabled}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  enabled: e.target.checked
                }))}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm font-medium text-gray-700">
                Habilitar base de datos
              </span>
            </label>
          </div>
        </div>
      </div>

      {testResult && (
        <div className={`flex items-center gap-2 p-3 rounded-lg ${
          testResult.success ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
        }`}>
          <AlertCircle className="w-5 h-5" />
          <span className="text-sm">{testResult.message}</span>
        </div>
      )}

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={() => setShowScripts(true)}
          className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 border rounded-md"
        >
          <Server className="w-5 h-5" />
          <span>Scripts SQL</span>
        </button>
        
        {formData.enabled && formData.settings.url && (
          <>
            <button
              type="button"
              onClick={handleOpenSupabase}
              className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 border rounded-md"
            >
              <ExternalLink className="w-5 h-5" />
              <span>Panel de Supabase</span>
            </button>
            <button
              type="button"
              onClick={handleOpenSqlEditor}
              className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-green-600 hover:bg-green-50 border rounded-md"
            >
              <Database className="w-5 h-5" />
              <span>Editor SQL</span>
            </button>
          </>
        )}
        
        <button
          type="submit"
          className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
        >
          <Save className="w-5 h-5" />
          <span>Guardar Cambios</span>
        </button>
      </div>
      
      {showScripts && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <DatabaseScripts onClose={() => setShowScripts(false)} />
            </div>
          </div>
        </div>
      )}
    </form>
  );
};

export default DatabaseConfig;