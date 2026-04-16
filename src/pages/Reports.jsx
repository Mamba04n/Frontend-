import { useState, useEffect } from 'react';
import { ShieldAlert, CheckCircle2, AlertTriangle, UserRound, ArrowRight, BarChart3, Users, Settings, Filter, Download, BookOpen, Clock, AlertOctagon, TrendingUp } from 'lucide-react';
import api from '../api';

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('reportes');

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await api.get('/reports');
      let payload = response.data?.data?.data || response.data?.data || response.data;
      setReports(Array.isArray(payload) ? payload : []);
    } catch (error) {
       console.error('Error fetching reports:', error);
    } finally {
       setLoading(false);
    }
  };

  const verifyReport = async (id) => {
     try {
       await api.post(/reports//verify);
       fetchReports(); // re-fetch after verifying
     } catch (error) {
       console.error('Failed to verify report', error);
     }
  };

  if (loading) {
     return (
       <div className="flex justify-center items-center py-20">
          <div className="w-10 h-10 border-4 border-slate-100 border-t-purple-600 rounded-full animate-spin"></div>
       </div>
     );
  }

  const pendingCount = reports.filter(r => r.status === 'pending').length;
  const verifiedCount = reports.length - pendingCount;

  return (
    <div className="space-y-6 slide-in pt-4">
      {/* Header Panel */}
      <div className="bg-gradient-to-br from-indigo-900 to-purple-900 rounded-[2.5rem] p-8 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between text-white relative overflow-hidden group">
        <div className="z-10 w-full">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full">
              <div>
                  <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6 border border-white/20">
                    <ShieldAlert className="w-7 h-7 text-purple-300" />
                  </div>
                  <h2 className="text-3xl font-black tracking-tight mb-2 font-sans">
                    Panel de Profesora
                  </h2>
                  <p className="text-purple-200 font-medium max-w-md leading-relaxed text-sm">Gestiona la comunidad, revisa estadisticas de los estudiantes y modera reportes de actividad en tus grupos clines.</p>
              </div>
              
              {/* Acciones rapidas Desktop */}
              <div className="flex flex-wrap sm:flex-nowrap gap-3 mt-6 sm:mt-4 w-full sm:w-auto">
                  <button className="bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition">
                      <Download className="w-4 h-4" /> Exportar Data
                  </button>
                  <button className="bg-purple-600 hover:bg-purple-500 border border-purple-500 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg transition">
                      <Settings className="w-4 h-4" /> Configuracion
                  </button>
              </div>
          </div>
        </div>
        <div className="absolute right-0 top-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-700"></div>
      </div>

      {/* KPI Cards / Metricas Dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition group">
              <div className="flex items-center justify-between mb-3">
                  <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Reportes Pendientes</span>
                  <div className="p-2 bg-rose-50 rounded-lg group-hover:bg-rose-100 transition"><AlertOctagon className="w-4 h-4 text-rose-500" /></div>
              </div>
              <div className="text-3xl font-black text-slate-800">{pendingCount}</div>
              <div className="text-xs text-slate-400 font-medium mt-1">Requieren atencion</div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition group">
              <div className="flex items-center justify-between mb-3">
                  <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Casos Resueltos</span>
                  <div className="p-2 bg-emerald-50 rounded-lg group-hover:bg-emerald-100 transition"><CheckCircle2 className="w-4 h-4 text-emerald-500" /></div>
              </div>
              <div className="text-3xl font-black text-slate-800">{verifiedCount}</div>
              <div className="text-xs text-slate-400 font-medium mt-1">Historial limpio</div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition group">
              <div className="flex items-center justify-between mb-3">
                  <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Alumnos Activos</span>
                  <div className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition"><Users className="w-4 h-4 text-blue-500" /></div>
              </div>
              <div className="text-3xl font-black text-slate-800">124</div>
              <div className="text-xs text-blue-500 font-bold mt-1 flex items-center gap-1"><TrendingUp className="w-3 h-3"/> +12% esta semana</div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition group">
              <div className="flex items-center justify-between mb-3">
                  <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Grupos Academicos</span>
                  <div className="p-2 bg-amber-50 rounded-lg group-hover:bg-amber-100 transition"><BookOpen className="w-4 h-4 text-amber-500" /></div>
              </div>
              <div className="text-3xl font-black text-slate-800">8</div>
              <div className="text-xs text-slate-400 font-medium mt-1">Semestre actual</div>
          </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-1 overflow-x-auto whitespace-nowrap scrollbar-hide w-full">
          <button 
             onClick={() => setActiveTab('reportes')}
             className={`px-4 py-2.5 text-sm font-bold rounded-t-xl transition-all flex items-center gap-2 inline-flex ${activeTab === 'reportes' ? 'bg-white border text-purple-700 border-slate-200 border-b-transparent shadow-[0_-4px_6px_-2px_rgba(0,0,0,0.02)] translate-y-px' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}
          >
             <ShieldAlert className="w-4 h-4" /> Moderacion ({pendingCount})
          </button>
          <button 
             onClick={() => setActiveTab('estadisticas')}
             className={`px-4 py-2.5 text-sm font-bold rounded-t-xl transition-all flex items-center gap-2 inline-flex ${activeTab === 'estadisticas' ? 'bg-white border border-slate-200 border-b-transparent shadow-[0_-4px_6px_-2px_rgba(0,0,0,0.02)] text-purple-700 translate-y-px' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}
          >
             <BarChart3 className="w-4 h-4" /> Estadisticas
          </button>
          <button 
             onClick={() => setActiveTab('alumnos')}
             className={`px-4 py-2.5 text-sm font-bold rounded-t-xl transition-all flex items-center gap-2 inline-flex ${activeTab === 'alumnos' ? 'bg-white border border-slate-200 border-b-transparent shadow-[0_-4px_6px_-2px_rgba(0,0,0,0.02)] text-purple-700 translate-y-px' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}
          >
             <Users className="w-4 h-4" /> Alumnos
          </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'reportes' && (
          <div className="animate-in fade-in duration-300">
             <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-800">Cola de Reportes</h3>
                <button className="text-slate-500 hover:text-slate-800 text-sm font-bold flex items-center gap-1"><Filter className="w-4 h-4"/> Filtrar</button>
             </div>
             
             {reports.length === 0 ? (
               <div className="text-center py-12 px-4 bg-white rounded-3xl border border-slate-100 border-dashed">
                  <div className="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center mx-auto mb-6 transform -rotate-3 border border-emerald-100 shadow-sm">
                    <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2 tracking-tight">Comunidad Limpia</h3>
                  <p className="text-slate-500 font-medium max-w-md mx-auto text-sm">Actualmente no existen reportes activos. Buen trabajo manteniendo la convivencia intachable.</p>
               </div>
             ) : (
               <div className="space-y-4">
                 {reports.map((report) => (
                    <div key={report.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                       <div className="flex justify-between items-start gap-4 flex-col sm:flex-row">
                          <div className="flex-1 w-full">
                             <div className="flex flex-wrap items-center gap-2 mb-3">
                                <span className="bg-rose-50 text-rose-700 border border-rose-100 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md flex items-center gap-1.5">
                                   <AlertTriangle className="w-3 h-3" />
                                   Reporte #{report.id}
                                </span>
                                <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md border ${report.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                                   {report.status === 'pending' ? 'Pendiente' : 'Verificado / Resuelto'}
                                </span>
                                <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1 ml-auto">
                                    <Clock className="w-3 h-3" /> Hace poco
                                </span>
                             </div>
                             
                             <p className="text-slate-700 font-medium text-sm leading-relaxed bg-slate-50 p-4 rounded-xl mb-4 border border-slate-100">
                               <span className="text-slate-400 font-bold block mb-1 text-xs">Causa o Razón:</span>
                               &quot;{report.reason}&quot;
                             </p>

                             <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-slate-100 bg-slate-50/50 -mx-6 px-6 -mb-6 pb-6 rounded-b-2xl">
                                <div className="flex items-center gap-2 text-xs font-bold text-slate-500 bg-white px-3 py-1.5 rounded-lg border border-slate-200">
                                  <UserRound className="w-4 h-4 text-slate-400" />
                                  Denunciante: ID {report.user_id}
                                </div>
                                <div className="flex items-center gap-2 text-xs font-bold text-slate-500 bg-white px-3 py-1.5 rounded-lg border border-slate-200">
                                  <ArrowRight className="w-4 h-4 text-slate-400" />
                                  Objetivo: {report.reportable_type.split('\\').pop()} #{report.reportable_id}
                                </div>
                             </div>
                          </div>

                          {report.status === 'pending' && (
                            <button 
                              onClick={() => verifyReport(report.id)}
                              className="w-full sm:w-auto mt-4 sm:mt-0 px-6 py-2.5 bg-slate-900 border border-transparent rounded-xl shadow-md text-sm font-bold text-white hover:bg-purple-600 focus:outline-none transition-colors shrink-0 flex items-center justify-center gap-2"
                            >
                              <ShieldAlert className="w-4 h-4" />
                              Resolver y Sancionar
                            </button>
                          )}
                       </div>
                    </div>
                 ))}
               </div>
             )}
          </div>
      )}

      {activeTab === 'estadisticas' && (
          <div className="animate-in fade-in duration-300 py-8 text-center bg-white rounded-3xl border border-slate-100 shadow-sm">
             <div className="w-20 h-20 bg-purple-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-purple-100">
                 <BarChart3 className="w-10 h-10 text-purple-400" />
             </div>
             <h3 className="text-xl font-bold text-slate-800 mb-2">Módulo de Estadísticas</h3>
             <p className="text-slate-500 font-medium text-sm max-w-sm mx-auto">Esta sección estará conectada pronto a los gráficos analíticos de retención de alumnos y métricas académicas.</p>
          </div>
      )}

      {activeTab === 'alumnos' && (
          <div className="animate-in fade-in duration-300 py-8 text-center bg-white rounded-3xl border border-slate-100 shadow-sm">
             <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-100">
                 <Users className="w-10 h-10 text-blue-400" />
             </div>
             <h3 className="text-xl font-bold text-slate-800 mb-2">Directorio de Alumnos</h3>
             <p className="text-slate-500 font-medium text-sm max-w-sm mx-auto">Aquí podrás ver el listado completo, credenciales (Carnet ID) y estado de participación de tus estudiantes.</p>
          </div>
      )}

    </div>
  );
}
