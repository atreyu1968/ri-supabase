import React from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import type { Quarter } from '../../types/academicYear';

interface QuarterManagerProps {
  quarter: Quarter;
  onToggleActive: (quarterId: string) => void;
}

const QuarterManager: React.FC<QuarterManagerProps> = ({ quarter, onToggleActive }) => {
  const formatDate = (date: string) => new Date(date).toLocaleDateString('es-ES');

  return (
    <div className="flex items-center justify-between text-sm bg-gray-50 p-3 rounded-lg hover:bg-gray-100 transition-colors">
      <div className="flex-1">
        <div className="font-medium">{quarter.name}</div>
        <div className="text-xs text-gray-500">
          {formatDate(quarter.startDate)} - {formatDate(quarter.endDate)}
        </div>
      </div>
      
      <button
        onClick={() => onToggleActive(quarter.id)}
        className={`flex items-center px-3 py-1.5 rounded-full transition-colors ${
          quarter.isActive
            ? 'bg-green-100 text-green-600 hover:bg-green-200'
            : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
        }`}
      >
        {quarter.isActive ? (
          <>
            <CheckCircle2 className="w-4 h-4 mr-1.5" />
            <span>Activo</span>
          </>
        ) : (
          <>
            <XCircle className="w-4 h-4 mr-1.5" />
            <span>Inactivo</span>
          </>
        )}
      </button>
    </div>
  );
};

export default QuarterManager;