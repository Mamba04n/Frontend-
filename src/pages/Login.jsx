import { useState } from 'react';
import { Loader2, ArrowRight } from 'lucide-react';
import api from '../api';
import logoUni from '../assets/logoUni.png';

export default function Login({ setToken }) {
  const [isRegistering, setIsRegistering] = useState(false);
  
  // States para el formulario
  const [name, setName] = useState('');
  const [carnet, setCarnet] = useState('');
  const [password, setPassword] = useState('');
  
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      let response;
      if (isRegistering) {
        response = await api.post('/register', { name, carnet, password });
      } else {
        response = await api.post('/login', { carnet, password });
      }
      
      const token = response.data.token || response.data?.data?.token;
      if (!token) throw new Error('Token no recuperado');
      
      localStorage.setItem('token', token);
      setToken(token);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 422) {
        const vErrors = err.response.data.errors;
        if (vErrors?.carnet) setError(vErrors.carnet[0]);
        else if (vErrors?.password) setError(vErrors.password[0]);
        else setError('Por favor, revisa que tus datos sean correctos.');
      } else {
        setError('El carnet o contraseña son incorrectos.');
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsRegistering(!isRegistering);
    setError('');
    setSuccessMsg('');
    setCarnet('');
    setPassword('');
    setName('');
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center font-sans p-4 sm:p-8">
      
      {/* Contenedor Principal: Split Screen */}
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 rounded-3xl overflow-hidden shadow-2xl shadow-zinc-900/10 bg-white min-h-[650px]">
        
        {/* Lado Izquierdo: Imagen Decorativa */}
        <div className="hidden lg:flex relative bg-zinc-900 flex-col justify-end p-16 text-white overflow-hidden group">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-40 mix-blend-overlay group-hover:scale-105 transition-transform duration-700"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
          
          <div className="relative z-10">
            <div className="w-16 h-1 bg-blue-500 rounded-full mb-6"></div>
            <h2 className="text-4xl font-black tracking-tight mb-4 text-white drop-shadow-lg leading-[1.1]">
              La red académica<br />más grande de tu<br />institución.
            </h2>
            <p className="text-zinc-200 font-medium max-w-sm text-sm leading-relaxed drop-shadow-sm opacity-90">
              Conéctate con tus compañeros, comparte investigaciones y forja un perfil universitario de excelencia usando tu carnet estudiantil.
            </p>
          </div>
        </div>

        {/* Lado Derecho: Formulario */}
        <div className="flex flex-col justify-center items-center p-8 sm:p-16 relative w-full h-full">
          
          {/* Logo Flotante */}
          <div className="absolute top-8 right-8">
            <img src={logoUni} alt="Logo" className="w-12 h-12 object-contain filter grayscale opacity-90 mix-blend-multiply" />
          </div>

          <div className="max-w-sm w-full mx-auto mt-6 lg:mt-0">
            <div className="mb-10">
              <h2 className="text-3xl font-black text-zinc-900 mb-2 tracking-tight">
                {isRegistering ? 'Únete hoy' : 'Hola de nuevo'}
              </h2>
              <p className="text-[13px] font-medium text-zinc-500">
                {isRegistering ? 'Ingresa tus datos como estudiante.' : 'Inicia sesión con tu carnet institucional.'}
              </p>
            </div>

            {error && (
               <div className="mb-6 p-4 bg-[#FFF5F5] border border-red-200 text-red-600 text-xs rounded-xl font-bold flex items-start gap-3 animate-in slide-in-from-top-1">
                 <span className="shrink-0 text-red-500 mt-0.5">⚠️</span>
                 <span>{error}</span>
               </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {isRegistering && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5 ml-1">Nombre completo</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3.5 text-sm text-zinc-900 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-semibold placeholder:font-medium placeholder:text-zinc-400"
                    placeholder="Juan Pérez"
                  />
                </div>
              )}

              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5 ml-1">Carnet Estudiantil</label>
                <input
                  type="text"
                  required
                  value={carnet}
                  onChange={(e) => setCarnet(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3.5 text-sm text-zinc-900 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-semibold placeholder:font-medium placeholder:text-zinc-400"
                  placeholder={isRegistering ? "Ej: 2023-0102U" : "Escribe tu carnet"}
                />
              </div>
              
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5 ml-1">Contraseña</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3.5 text-sm text-zinc-900 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-semibold placeholder:font-medium placeholder:text-zinc-400"
                  placeholder="••••••••"
                  minLength={isRegistering ? 8 : undefined}
                />
              </div>

              <button
                 type="submit"
                 disabled={loading}
                 className="mt-4 w-full bg-zinc-900 hover:bg-blue-600 text-white rounded-2xl py-4 text-sm font-bold transition-colors flex justify-center items-center gap-2 shadow-lg shadow-zinc-900/10 animate-in zoom-in-95 duration-300 group"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin text-white" />
                ) : (
                  <>
                    <span>{isRegistering ? 'Crear mi red' : 'Entrar a mi red'}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 text-center text-[13px] font-medium text-zinc-500">
              {isRegistering ? '¿Ya estás con nosotros? ' : '¿Aún no eres parte? '}
              <button 
                type="button" 
                onClick={toggleMode}
                className="font-bold text-zinc-900 hover:text-blue-600 transition-colors"
              >
                {isRegistering ? 'Inicia sesión ahí' : 'Solicita tu acceso aquí'}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
