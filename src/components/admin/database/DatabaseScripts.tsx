import React, { useState } from 'react';
import { Database, Server, Activity, AlertCircle, Play, Download } from 'lucide-react';
import { supabase } from '../../../config/supabase';

interface DatabaseScriptsProps {
  onClose: () => void;
}

interface TableScript {
  name: string;
  description: string;
  sql: string;
  dependencies?: string[];
}

const tableScripts: TableScript[] = [
  {
    name: 'networks',
    description: 'Redes de centros',
    sql: `
      CREATE TABLE IF NOT EXISTS networks (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        code VARCHAR(50) NOT NULL UNIQUE,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        center_count INTEGER DEFAULT 0,
        headquarter_id UUID,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `
  },
  {
    name: 'centers',
    description: 'Centros educativos',
    sql: `
      CREATE TABLE IF NOT EXISTS centers (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        code VARCHAR(50) NOT NULL UNIQUE,
        name VARCHAR(100) NOT NULL,
        network VARCHAR(50) REFERENCES networks(code),
        address TEXT NOT NULL,
        municipality VARCHAR(100) NOT NULL,
        province VARCHAR(100) NOT NULL,
        island VARCHAR(100) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        email VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `,
    dependencies: ['networks']
  },
  {
    name: 'departments',
    description: 'Departamentos',
    sql: `
      CREATE TABLE IF NOT EXISTS departments (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        code VARCHAR(50) NOT NULL UNIQUE,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        head_teacher VARCHAR(100),
        email VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `
  },
  {
    name: 'professional_families',
    description: 'Familias profesionales',
    sql: `
      CREATE TABLE IF NOT EXISTS professional_families (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        code VARCHAR(50) NOT NULL UNIQUE,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `
  },
  {
    name: 'studies',
    description: 'Estudios',
    sql: `
      CREATE TABLE IF NOT EXISTS studies (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        code VARCHAR(50) NOT NULL UNIQUE,
        name VARCHAR(100) NOT NULL,
        level VARCHAR(20) CHECK (level IN ('basic', 'medium', 'higher')),
        family_id UUID REFERENCES professional_families(id),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `,
    dependencies: ['professional_families']
  },
  {
    name: 'groups',
    description: 'Grupos',
    sql: `
      CREATE TABLE IF NOT EXISTS groups (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        code VARCHAR(50) NOT NULL UNIQUE,
        name VARCHAR(100) NOT NULL,
        shift VARCHAR(20) CHECK (shift IN ('morning', 'afternoon', 'evening')),
        year INTEGER CHECK (year IN (1, 2)),
        study_id UUID REFERENCES studies(id),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `,
    dependencies: ['studies']
  },
  {
    name: 'academic_years',
    description: 'Cursos académicos',
    sql: `
      CREATE TABLE IF NOT EXISTS academic_years (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(100) NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        is_active BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT valid_dates CHECK (end_date > start_date)
      );
    `
  },
  {
    name: 'quarters',
    description: 'Trimestres',
    sql: `
      CREATE TABLE IF NOT EXISTS quarters (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(100) NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        is_active BOOLEAN DEFAULT false,
        academic_year_id UUID REFERENCES academic_years(id),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT valid_dates CHECK (end_date > start_date)
      );
    `,
    dependencies: ['academic_years']
  },
  {
    name: 'objectives',
    description: 'Objetivos de red',
    sql: `
      CREATE TABLE IF NOT EXISTS objectives (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        code VARCHAR(50) NOT NULL UNIQUE,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        priority VARCHAR(20) CHECK (priority IN ('high', 'medium', 'low')),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `
  },
  {
    name: 'center_objectives',
    description: 'Objetivos de centro',
    sql: `
      CREATE TABLE IF NOT EXISTS center_objectives (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        code VARCHAR(50) NOT NULL UNIQUE,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        priority VARCHAR(20) CHECK (priority IN ('high', 'medium', 'low')),
        is_active BOOLEAN DEFAULT true,
        center VARCHAR(100) REFERENCES centers(name),
        category VARCHAR(100) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `,
    dependencies: ['centers']
  },
  {
    name: 'ods',
    description: 'Objetivos de Desarrollo Sostenible',
    sql: `
      CREATE TABLE IF NOT EXISTS ods (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        code VARCHAR(50) NOT NULL UNIQUE,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        priority VARCHAR(20) CHECK (priority IN ('high', 'medium', 'low')),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `
  },
  {
    name: 'actions',
    description: 'Acciones',
    sql: `
      CREATE TABLE IF NOT EXISTS actions (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(255) NOT NULL,
        location VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        departments TEXT[] NOT NULL,
        professional_families TEXT[] NOT NULL,
        selected_groups TEXT[] NOT NULL,
        student_participants INTEGER NOT NULL DEFAULT 0,
        teacher_participants INTEGER NOT NULL DEFAULT 0,
        rating INTEGER NOT NULL DEFAULT 5,
        comments TEXT,
        created_by UUID NOT NULL,
        network VARCHAR(50) REFERENCES networks(code),
        center VARCHAR(100) REFERENCES centers(name),
        quarter UUID REFERENCES quarters(id),
        objectives UUID[] REFERENCES objectives(id),
        center_objectives UUID[] REFERENCES center_objectives(id),
        ods UUID[] REFERENCES ods(id),
        image_url TEXT,
        document_url TEXT,
        document_name VARCHAR(255),
        is_imported BOOLEAN DEFAULT false,
        is_incomplete BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT valid_dates CHECK (end_date >= start_date),
        CONSTRAINT valid_rating CHECK (rating BETWEEN 1 AND 5)
      );
    `,
    dependencies: ['networks', 'centers', 'quarters', 'objectives', 'center_objectives', 'ods']
  },
  {
    name: 'observatory',
    description: 'Observatorio de innovación',
    sql: `
      CREATE TABLE IF NOT EXISTS observatory (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        type VARCHAR(20) CHECK (type IN ('practice', 'research', 'resource')),
        network VARCHAR(50) REFERENCES networks(code),
        title VARCHAR(255) NOT NULL,
        topic VARCHAR(100) NOT NULL,
        description TEXT NOT NULL,
        resource_url TEXT NOT NULL,
        publish_date DATE NOT NULL,
        tags TEXT[] NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `,
    dependencies: ['networks']
  },
  {
    name: 'registration_codes',
    description: 'Códigos de registro',
    sql: `
      CREATE TABLE IF NOT EXISTS registration_codes (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        code VARCHAR(50) NOT NULL UNIQUE,
        role VARCHAR(50) NOT NULL,
        expiration_date TIMESTAMP WITH TIME ZONE NOT NULL,
        max_uses INTEGER NOT NULL DEFAULT 1,
        used_count INTEGER NOT NULL DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        network VARCHAR(50) REFERENCES networks(code),
        center VARCHAR(100) REFERENCES centers(name),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT valid_role CHECK (role IN ('admin', 'general_coordinator', 'subnet_coordinator', 'manager', 'guest')),
        CONSTRAINT valid_max_uses CHECK (max_uses > 0),
        CONSTRAINT valid_used_count CHECK (used_count >= 0 AND used_count <= max_uses)
      );
    `,
    dependencies: ['networks', 'centers']
  }
];

const DatabaseScripts: React.FC<DatabaseScriptsProps> = ({ onClose }) => {
  const [selectedTables, setSelectedTables] = useState<string[]>([]);
  const [executing, setExecuting] = useState(false);
  const [progress, setProgress] = useState<{[key: string]: 'pending' | 'success' | 'error'}>({});
  const [error, setError] = useState<string | null>(null);
  const [showScriptModal, setShowScriptModal] = useState(false);
  const [scriptContent, setScriptContent] = useState('');

  const handleSelectAll = () => {
    if (selectedTables.length === tableScripts.length) {
      setSelectedTables([]);
    } else {
      setSelectedTables(tableScripts.map(t => t.name));
    }
  };

  const downloadScript = () => {
    const selectedScripts = tableScripts
      .filter(t => selectedTables.includes(t.name))
      .sort((a, b) => {
        // Sort by dependencies
        if (a.dependencies?.some(d => b.name === d)) return 1;
        if (b.dependencies?.some(d => a.name === d)) return -1;
        return 0;
      });

    const script = selectedScripts
      .map(t => `-- ${t.description}\n${t.sql}`)
      .join('\n\n');

    const blob = new Blob([script], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'database_setup.sql';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const showSelectedScript = () => {
    const selectedScripts = tableScripts
      .filter(t => selectedTables.includes(t.name))
      .sort((a, b) => {
        if (a.dependencies?.some(d => b.name === d)) return 1;
        if (b.dependencies?.some(d => a.name === d)) return -1;
        return 0;
      });

    const script = selectedScripts
      .map(t => `-- ${t.description}\n${t.sql}`)
      .join('\n\n');

    setScriptContent(script);
  };

  const executeScript = async () => {
    setExecuting(true);
    setError(null);
    setError('Para ejecutar estos scripts, primero debes crear la función get_connection_status en el Editor SQL de Supabase. Luego podrás ejecutar el resto de los scripts de creación de tablas.');
    setExecuting(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Database className="w-6 h-6 text-blue-600" />
          <h3 className="text-lg font-medium">Scripts de Base de Datos</h3>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleSelectAll}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            {selectedTables.length === tableScripts.length ? 'Deseleccionar Todo' : 'Seleccionar Todo'}
          </button>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 rounded-lg flex items-center space-x-2 text-red-600">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        {tableScripts.map((table) => (
          <div
            key={table.name}
            className={`p-4 rounded-lg border transition-colors ${
              selectedTables.includes(table.name)
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-blue-300'
            }`}
          >
            <label className="flex items-start space-x-3">
              <input
                type="checkbox"
                checked={selectedTables.includes(table.name)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedTables(prev => [...prev, table.name]);
                  } else {
                    setSelectedTables(prev => prev.filter(t => t !== table.name));
                  }
                }}
                className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">{table.name}</span>
                  {progress[table.name] && (
                    <span className={`text-sm ${
                      progress[table.name] === 'success' ? 'text-green-600' :
                      progress[table.name] === 'error' ? 'text-red-600' :
                      'text-blue-600'
                    }`}>
                      {progress[table.name] === 'success' ? '✓ Creada' :
                       progress[table.name] === 'error' ? '✗ Error' :
                       '⟳ Pendiente'}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-1">{table.description}</p>
                {table.dependencies && (
                  <p className="text-xs text-gray-400 mt-1">
                    Depende de: {table.dependencies.join(', ')}
                  </p>
                )}
              </div>
            </label>
          </div>
        ))}
      </div>

      <div className="flex justify-end space-x-3">
        <button
          onClick={downloadScript}
          disabled={selectedTables.length === 0 || executing}
          className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 border rounded-md disabled:opacity-50"
        >
          <Download className="w-5 h-5" />
          <span>Descargar Script</span>
        </button>

        <button
          onClick={() => {
            showSelectedScript();
            setShowScriptModal(true);
          }}
          disabled={selectedTables.length === 0 || executing}
          className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 border rounded-md disabled:opacity-50"
        >
          <Server className="w-5 h-5" />
          <span>Ver Script</span>
        </button>

        <button
          onClick={executeScript}
          disabled={selectedTables.length === 0 || executing}
          className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50"
        >
          <Play className="w-4 h-4" />
          <span>{executing ? 'Ejecutando...' : 'Ejecutar'}</span>
        </button>
      </div>
      {showScriptModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <h3 className="text-lg font-medium text-white">Script SQL</h3>
              <button
                onClick={() => setShowScriptModal(false)}
                className="text-gray-400 hover:text-white"
              >
                ×
              </button>
            </div>
            <div className="p-4 overflow-auto">
              <pre className="text-sm font-mono text-green-400 whitespace-pre-wrap">
                {scriptContent}
              </pre>
            </div>
            <div className="flex justify-end space-x-3 p-4 border-t border-gray-700">
              <button
                onClick={() => setShowScriptModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-300 hover:bg-gray-800 rounded-md"
              >
                Cerrar
              </button>
              <button
                onClick={executeScript}
                disabled={executing}
                className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                <Play className="w-4 h-4" />
                <span>{executing ? 'Ejecutando...' : 'Ejecutar'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DatabaseScripts;