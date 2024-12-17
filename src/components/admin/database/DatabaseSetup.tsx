import React, { useState } from 'react';
import { X } from 'lucide-react';
import DatabaseScripts from './DatabaseScripts';

interface DatabaseSetupProps {
  onComplete: () => void;
}

const DatabaseSetup: React.FC<DatabaseSetupProps> = ({ onComplete }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Configuración de Tablas</h2>
        <button onClick={onComplete} className="text-gray-500 hover:text-gray-700">
          <X className="w-5 h-5" />
        </button>
      </div>

      <DatabaseScripts />
    </div>
  );
};

export default DatabaseSetup;