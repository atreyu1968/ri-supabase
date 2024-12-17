import React, { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';
import type { Center } from '../../types/masterRecords';
import { useMasterRecordsStore } from '../../stores/masterRecordsStore';
import { mockLocations } from '../../data/mockLocations';

interface Location {
  province: string;
  island: string;
  municipality: string;
}

interface CenterFormProps {
  onSubmit: (data: Omit<Center, 'id'>) => void;
  onClose: () => void;
  initialData?: Center;
}

const CenterForm: React.FC<CenterFormProps> = ({ onSubmit, onClose, initialData }) => {
  const { networks } = useMasterRecordsStore();
  const [locations, setLocations] = useState<Location[]>([]);
  const [provinces, setProvinces] = useState<string[]>([]);
  const [islands, setIslands] = useState<string[]>([]);
  const [municipalities, setMunicipalities] = useState<string[]>([]);
  const [formData, setFormData] = useState<Omit<Center, 'id'>>({
    code: initialData?.code || '',
    name: initialData?.name || '',
    network: initialData?.network || '',
    address: initialData?.address || '',
    municipality: initialData?.municipality || '',
    province: initialData?.province || '',
    island: initialData?.island || '',
    phone: initialData?.phone || '',
    email: initialData?.email || '',
  });

  // Load locations from mock data
  useEffect(() => {
    setLocations(mockLocations);
    // Extract unique provinces
    const uniqueProvinces = [...new Set(mockLocations.map(loc => loc.province))];
    setProvinces(uniqueProvinces);

    // If there's initial data, load islands and municipalities
    if (initialData) {
      handleProvinceChange(initialData.province);
      handleIslandChange(initialData.province, initialData.island);
    }
  }, [initialData]);

  const handleProvinceChange = (province: string) => {
    setFormData(prev => ({ ...prev, province, island: '', municipality: '' }));
    const filteredIslands = [...new Set(
      locations
        .filter(loc => loc.province === province)
        .map(loc => loc.island)
    )];
    setIslands(filteredIslands);
    setMunicipalities([]);
  };

  const handleIslandChange = (province: string, island: string) => {
    setFormData(prev => ({ ...prev, island, municipality: '' }));
    const filteredMunicipalities = [...new Set(
      locations
        .filter(loc => loc.province === province && loc.island === island)
        .map(loc => loc.municipality)
    )];
    setMunicipalities(filteredMunicipalities);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-4 border-b bg-blue-600 text-white rounded-t-lg">
          <h2 className="text-lg font-semibold">
            {initialData ? 'Editar' : 'Nuevo'} Centro
          </h2>
          <button onClick={onClose} className="text-white hover:text-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1">
          <form onSubmit={handleSubmit} className="p-6">
          {/* Basic Information */}
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center justify-between">
                    <span>Red</span>
                    <span className="text-xs text-gray-500">Se asigna desde la gestión de redes</span>
                  </label>
                  <input
                    type="text"
                    value={formData.network}
                    className="w-full px-3 py-2 border rounded-md bg-gray-50 text-gray-500"
                    disabled
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre del Centro
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
            {/* Location Information */}
            <div>
              <h3 className="text-base font-medium text-gray-900 mb-4">
                Ubicación
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Provincia
                  </label>
                  <select
                    value={formData.province}
                    onChange={(e) => handleProvinceChange(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Seleccionar provincia</option>
                    {provinces.map(province => (
                      <option key={province} value={province}>
                        {province}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Isla
                  </label>
                  <select
                    value={formData.island}
                    onChange={(e) => handleIslandChange(formData.province, e.target.value)}
                    className="w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                    disabled={!formData.province}
                  >
                    <option value="">Seleccionar isla</option>
                    {islands.map(island => (
                      <option key={island} value={island}>
                        {island}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Municipio
                  </label>
                  <select
                    value={formData.municipality}
                    onChange={(e) => setFormData(prev => ({ ...prev, municipality: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                    disabled={!formData.island}
                  >
                    <option value="">Seleccionar municipio</option>
                    {municipalities.map(municipality => (
                      <option key={municipality} value={municipality}>
                        {municipality}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dirección
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <h3 className="text-base font-medium text-gray-900 mb-4">
                Contacto
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
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
              {initialData ? 'Guardar Cambios' : 'Crear Centro'}
            </button>
          </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CenterForm;