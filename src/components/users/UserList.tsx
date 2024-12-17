import React from 'react';
import { 
  Pencil, 
  Trash2, 
  Mail, 
  Phone, 
  Building2,
  MessageSquare,
  KeyRound,
  MessageCircle
} from 'lucide-react';
import type { User } from '../../types/user';
import { useAuthStore } from '../../stores/authStore';
import { useChatConfigStore } from '../../stores/chatConfigStore';

interface UserListProps {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (id: string) => void;
  onResetPassword: (id: string) => void;
}

const UserList: React.FC<UserListProps> = ({ users, onEdit, onDelete, onResetPassword }) => {
  const { user: currentUser } = useAuthStore();
  const { config: chatConfig } = useChatConfigStore();

  const getRoleName = (role: User['role']) => {
    switch (role) {
      case 'admin':
        return 'Administrador';
      case 'general_coordinator':
        return 'Coordinador General';
      case 'subnet_coordinator':
        return 'Coordinador de Subred';
      case 'manager':
        return 'Gestor';
      case 'guest':
        return 'Invitado';
      default:
        return role;
    }
  };

  const canResetPassword = (user: User) => {
    if (!currentUser) return false;
    if (currentUser.role === 'admin') return true;
    if (currentUser.role === 'general_coordinator') return true;
    return false;
  };

  const handleSendEmail = (email: string) => {
    window.location.href = `mailto:${email}`;
  };

  const handleCall = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  const handleWhatsApp = (phone: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    window.open(`https://wa.me/34${cleanPhone}`, '_blank');
  };

  const handleDirectMessage = (user: User) => {
    if (!chatConfig.enabled || !chatConfig.settings.url) return;

    // Generate direct message URL
    const dmUrl = `${chatConfig.settings.url}/direct/${user.email}`;
    window.open(dmUrl, '_blank');
  };

  const canUseWhatsApp = (phone: string) => {
    return phone.startsWith('6');
  };

  return (
    <div className="space-y-4">
      {users.map((user) => (
        <div key={user.id} className="bg-white border rounded-lg shadow-sm hover:shadow transition-shadow">
          <div className="grid grid-cols-12 gap-4 p-4">
            <div className="col-span-1">
              <img
                src={user.imageUrl || `https://ui-avatars.com/api/?name=${user.name}+${user.lastName}`}
                alt={`${user.name} ${user.lastName}`}
                className="w-12 h-12 rounded-full"
              />
            </div>

            <div className="col-span-3">
              <div className="font-medium text-gray-900">
                {user.name} {user.lastName}
              </div>
              <div className="text-sm text-blue-600 bg-blue-50 inline-block px-2 py-0.5 rounded mt-1">
                {user.medusaCode}
              </div>
              {user.passwordChangeRequired && (
                <div className="text-xs text-yellow-600 bg-yellow-50 inline-block px-2 py-0.5 rounded mt-1 ml-2">
                  Cambio de contraseña pendiente
                </div>
              )}
            </div>
            
            <div className="col-span-3">
              <div className="flex items-center text-sm text-gray-600 mb-1">
                <button
                  onClick={() => handleSendEmail(user.email)}
                  className="flex items-center hover:text-blue-600"
                >
                  <Mail className="w-4 h-4 mr-1" />
                  <span>{user.email}</span>
                </button>
              </div>
              {user.phone && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <button
                    onClick={() => handleCall(user.phone!)}
                    className="flex items-center hover:text-blue-600"
                  >
                    <Phone className="w-4 h-4 mr-1" />
                    <span>{user.phone}</span>
                  </button>
                  {canUseWhatsApp(user.phone) && (
                    <button
                      onClick={() => handleWhatsApp(user.phone!)}
                      className="flex items-center text-green-600 hover:text-green-700"
                      title="Contactar por WhatsApp"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </button>
                  )}
                  {chatConfig.enabled && (
                    <button
                      onClick={() => handleDirectMessage(user)}
                      className="flex items-center text-blue-600 hover:text-blue-700"
                      title="Enviar mensaje directo"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}
            </div>
            
            <div className="col-span-3">
              <div className="flex items-center text-sm text-gray-600 mb-1">
                <Building2 className="w-4 h-4 mr-1" />
                <span>{user.center}</span>
              </div>
              <div className="text-sm font-medium text-gray-700">
                {getRoleName(user.role)}
              </div>
            </div>

            <div className="col-span-2 flex items-center justify-end space-x-2">
              {canResetPassword(user) && (
                <button
                  onClick={() => onResetPassword(user.id)}
                  className="p-2 text-gray-500 hover:text-yellow-600 rounded-full hover:bg-yellow-50"
                  title="Resetear contraseña"
                >
                  <KeyRound className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => onEdit(user)}
                className="p-2 text-gray-500 hover:text-blue-600 rounded-full hover:bg-blue-50"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDelete(user.id)}
                className="p-2 text-gray-500 hover:text-red-600 rounded-full hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default UserList;