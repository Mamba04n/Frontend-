import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Users, CheckCircle, Loader2, ArrowLeft } from 'lucide-react';
import api from '../api';

export default function JoinGroup() {
   const { code } = useParams();
   const navigate = useNavigate();
   const [status, setStatus] = useState('loading'); // loading, success, error
   const [message, setMessage] = useState('Verificando Enlace...');
   const [groupName, setGroupName] = useState('');

   useEffect(() => {
      joinRequest();
   }, [code]);

   const joinRequest = async () => {
      try {
         const res = await api.post('/groups/join/' + code);
         setStatus('success');
         setMessage(res.data.message || '¡Te has unido exitosamente!');
         setGroupName(res.data.group?.name || 'la clase');
         setTimeout(() => navigate('/'), 3000);
      } catch (err) {
         setStatus('error');
         setMessage(err.response?.data?.message || 'Enlace inválido o grupo no encontrado.');
      }
   };

   return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
         <div className="bg-white max-w-md w-full p-8 rounded-3xl shadow-sm border border-slate-200 text-center animate-in zoom-in-95 duration-300">
            {status === 'loading' && (
               <>
                  <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                     <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                  </div>
                  <h1 className="text-2xl font-black text-slate-800 tracking-tight">Uniendo al Grupo...</h1>
                  <p className="text-sm font-medium text-slate-500 mt-2">{message}</p>
               </>
            )}

            {status === 'success' && (
               <>
                  <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 slide-in-from-bottom-4 animate-in">
                     <CheckCircle className="w-10 h-10 text-emerald-500" />
                  </div>
                  <h1 className="text-2xl font-black text-slate-800 tracking-tight">¡Bienvenido!</h1>
                  <p className="text-sm font-medium text-slate-500 mt-2">
                     {message} ahora eres parte de <strong>{groupName}</strong>. Redirigiendo al feed escolar...
                  </p>
               </>
            )}

            {status === 'error' && (
               <>
                  <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                     <Users className="w-10 h-10 text-red-500" />
                  </div>
                  <h1 className="text-2xl font-black text-slate-800 tracking-tight">No se pudo Unir</h1>
                  <p className="text-sm font-medium text-slate-500 mt-2">{message}</p>
                  <button onClick={() => navigate('/')} className="mt-8 px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-sm transition-colors flex items-center justify-center gap-2 mx-auto w-full">
                     <ArrowLeft className="w-4 h-4" /> Volver al Inicio
                  </button>
               </>
            )}
         </div>
      </div>
   );
}