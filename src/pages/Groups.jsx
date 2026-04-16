import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Library, ChevronRight, Hash } from 'lucide-react';
import api from '../api';
import { toAssetUrl } from '../utils/assetUrl';

export default function Groups({ user }) {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMyGroups();
  }, []);

  const fetchMyGroups = async () => {
    try {
      const response = await api.get('/groups/mine');
      setGroups(response.data.groups || []);
    } catch (error) {
      console.error('Failed to fetch user groups', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto slide-in">
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
             <Library className="w-6 h-6 text-blue-600" /> Mis Grupos
          </h2>
          <p className="text-gray-500 font-medium text-sm mt-1">
             Explora y accede a tus comunidades académicas.
          </p>
        </div>
      </div>

      {groups.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-gray-200 p-10 text-center shadow-sm">
          <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-2">No estás en ningún grupo</h3>
          <p className="text-gray-500 text-sm max-w-sm mx-auto mb-6">
            Pídele a un profesor que te invite o comparte un código de acceso para unirte a una clase.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups.map((group) => (
            <div
              key={group.id}
              onClick={() => navigate(`/groups/${group.id}`)}
              className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-300 transition cursor-pointer group flex flex-col h-full overflow-hidden"
            >
               {group.cover_url ? (
                  <div className="h-32 w-full overflow-hidden">
                     <img src={toAssetUrl(group.cover_url)} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="Cover" />
                  </div>
               ) : (
                  <div className="h-32 w-full bg-gradient-to-tr from-blue-600 to-indigo-700 flex items-center justify-center relative overflow-hidden">
                     <Hash className="w-20 h-20 text-white/10 absolute right-4 bottom-4" />
                     <span className="text-5xl font-black text-white/90">{(group.name || 'G').substring(0, 1).toUpperCase()}</span>
                  </div>
               )}
               <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                      <h3 className="font-bold text-gray-900 text-lg leading-tight mb-2 line-clamp-2">
                        {group.name}
                      </h3>
                      {group.description && (
                        <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                          {group.description}
                        </p>
                      )}
                  </div>
                  <div className="flex items-center justify-between mt-auto">
                      <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-wider">
                         Ir a Clases
                      </span>
                      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                  </div>
               </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}