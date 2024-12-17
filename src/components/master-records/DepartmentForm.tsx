import React, { useState } from 'react';
import { X } from 'lucide-react';
import type { Department } from '../../types/masterRecords';

interface DepartmentFormProps {
  onSubmit: (data: Omit<Department, 'id'>) => void;
  onClose: () => void;
  initialData?: Department;
}

const DepartmentForm: React.FC<DepartmentFormProps> = ({ onSubmit, onClose, initialData }) => {
  const [formData, setFormData] = useState<Omit<Department, 'id'>>({
    code: initialData?.code || '',
    name: initialData?.name || '',
    description: '',
    headTeacher: '',
    email: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      description: '',
      headTeacher: '',
      email: '',
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b bg-blue-600 text-white rounded-t-lg">
          <h2 className="text-lg font-semibold">
            {initialData ? 'Editar' : 'Nuevo'} Departamento
          </h2>
          <button onClick={onClose} className="text-white hover:text-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-medium text-gray-900 mb-4">
                Información Básica
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Código
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-base font-medium text-gray-900 mb-4">
                Contacto
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Jefe de Departamento
                  </label>
                  <input
                    type="text"
                    value={formData.headTeacher}
                    onChange={(e) => setFormData(prev => ({ ...prev, headTeacher: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-8 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 border rounded-md"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
            >
              {initialData ? 'Guardar Cambios' : 'Crear Departamento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DepartmentForm;