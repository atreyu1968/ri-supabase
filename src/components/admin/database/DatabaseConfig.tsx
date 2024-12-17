import React, { useState } from 'react';
import { Save, TestTube, AlertCircle, Database, Play } from 'lucide-react';
import { useDatabaseConfigStore } from '../../../stores/databaseConfigStore';
import DatabaseStatus from './DatabaseStatus';
import DatabaseSetup from './DatabaseSetup';
import type { DatabaseConfig } from '../../../types/admin';

const DatabaseConfig = () => {
  const { config, updateConfig, testConnection } = useDatabaseConfigStore();
  const [formData, setFormData] = useState<DatabaseConfig>(config);
  const [testing, setTesting] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    
    try {
      const success = await testConnection();
      setTestResult({
        success,
        message: success 
          ? 'Conexión exitosa' 
          : 'La base de datos no está disponible actualmente'
      });
    } catch (error) {
      setTestResult({
        success: false,
        message: 'La base de datos no está disponible actualmente'
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateConfig(formData);
  };

  return (
    <div className="space-y-8">
      <DatabaseStatus />

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Configuración de Base de Datos
            <button
              onClick={() => setShowSetup(true)}
              className="ml-4 px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-lg"
            >
              Configurar Tablas
            </button>
          </h3>
          
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL del Servidor
              </label>
              <input
                type="text"
                value={formData.settings.url}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  settings: { ...prev.settings, url: e.target.value }
                }))}
                className="w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Clave Anónima (anon key)
              </label>
              <input
                type="password"
                value={formData.settings.anonKey}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  settings: { ...prev.settings, anonKey: e.target.value }
                }))}
                className="w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Clave de Servicio (service_role key)
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

            <div className="col-span-2">
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
            onClick={handleTestConnection}
            disabled={testing}
            className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 border rounded-md disabled:opacity-50"
          >
            <TestTube className="w-5 h-5" />
            <span>{testing ? 'Probando...' : 'Probar Conexión'}</span>
          </button>

          {formData.enabled && (
            <a
              href="https://supabase.iesmmg.es"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 border rounded-md"
            >
              <Database className="w-5 h-5" />
              <span>Abrir Panel de Supabase</span>
            </a>
          )}
          
          <button
            type="submit"
            className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
          >
            <Save className="w-5 h-5" />
            <span>Guardar Cambios</span>
          </button>
        </div>
      </form>

      {showSetup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <DatabaseSetup onComplete={() => setShowSetup(false)} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DatabaseConfig;