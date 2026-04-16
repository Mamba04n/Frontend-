import re

with open('src/pages/AdminDashboard.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update the main layout wrapper and aside
content = content.replace(
    '<div className="min-h-screen bg-slate-50 flex">',
    '<div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">'
)

aside_old = """      <aside className="w-72 bg-white border-r border-slate-200 p-6 flex flex-col slide-in">
         <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-blue-600 text-white rounded-xl shadow-lg flex items-center justify-center font-bold text-xl">VC</div>
            <div>
               <h1 className="font-black text-slate-800 tracking-tight leading-none text-xl">Panel Admin</h1>
               <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Gestión Total</span>
            </div>
         </div>

         <nav className="flex-1 space-y-2.5">
           <button onClick={() => setActiveTab('summary')} className={"w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl text-left transition-colors " + (activeTab === 'summary' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900')}>
             <BarChart3 className="w-5 h-5"/> Resumen y Datos
           </button>
           <button onClick={() => setActiveTab('grades')} className={"w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl text-left transition-colors " + (activeTab === 'grades' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900')}>
             <GraduationCap className="w-5 h-5"/> Grupos, Notas & Evaluaciones
           </button>
         </nav>

         <div className="mt-auto border-t border-slate-100 pt-6">
           <Link to="/" className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-xl transition-colors w-full mb-2">
             <ArrowLeft className="w-5 h-5" /> Volver a Feed
           </Link>
           <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-colors w-full">
             <LogOut className="w-5 h-5" /> Cerrar Sesión
           </button>
         </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10 overflow-y-auto w-full h-screen">"""

aside_new = """      <aside className="w-full md:w-72 bg-white border-b md:border-b-0 md:border-r border-slate-200 p-4 md:p-6 flex flex-col shrink-0 z-10 sticky top-0 md:relative">
         <div className="flex flex-col md:flex-row items-center md:items-start gap-4 mb-4 md:mb-10 w-full">
            <div className="flex items-center gap-3 w-full justify-center md:justify-start">
              <div className="w-10 h-10 bg-blue-600 text-white rounded-xl shadow-lg flex items-center justify-center font-bold text-xl shrink-0">VC</div>
              <div>
                 <h1 className="font-black text-slate-800 tracking-tight leading-none text-xl">Panel Admin</h1>
                 <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold block mt-0.5">Gestión Total</span>
              </div>
            </div>
         </div>

         <nav className="flex flex-row md:flex-col gap-2 overflow-x-auto whitespace-nowrap scrollbar-hide pb-2 md:pb-0 flex-1 md:space-y-2.5 w-full items-center md:items-stretch">
           <button onClick={() => setActiveTab('summary')} className={"flex-1 md:w-full flex items-center justify-center md:justify-start gap-2 md:gap-3 px-4 py-2.5 md:py-3 text-sm font-semibold rounded-xl transition-colors " + (activeTab === 'summary' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900')}>
             <BarChart3 className="w-4 h-4 md:w-5 md:h-5 shrink-0"/> <span>Resumen</span>
           </button>
           <button onClick={() => setActiveTab('grades')} className={"flex-1 md:w-full flex items-center justify-center md:justify-start gap-2 md:gap-3 px-4 py-2.5 md:py-3 text-sm font-semibold rounded-xl transition-colors " + (activeTab === 'grades' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900')}>
             <GraduationCap className="w-4 h-4 md:w-5 md:h-5 shrink-0"/> <span>Notas y Grupos</span>
           </button>
         </nav>

         <div className="mt-2 md:mt-auto border-t border-slate-100 pt-3 md:pt-6 flex flex-row md:flex-col gap-2 w-full">
           <Link to="/" className="flex-1 md:w-full flex items-center justify-center md:justify-start gap-2 px-4 py-2.5 md:py-3 text-sm font-semibold text-slate-600 border border-slate-200 md:border-0 hover:bg-slate-100 hover:text-slate-900 rounded-xl transition-colors mb-0 md:mb-2">
             <ArrowLeft className="w-4 h-4 shrink-0" /> <span className="hidden md:inline">Volver</span>
           </Link>
           <button onClick={handleLogout} className="flex items-center justify-center md:justify-start gap-2 px-4 py-2.5 md:py-3 text-sm font-semibold text-red-600 border border-red-200 md:border-0 hover:bg-red-50 rounded-xl transition-colors flex-1 md:w-full">
             <LogOut className="w-4 h-4 shrink-0" /> <span className="hidden md:inline">Salir</span>
           </button>
         </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-10 overflow-y-auto w-full min-h-screen pb-20 md:pb-10">"""
content = content.replace(aside_old, aside_new)

# 2. Update Header Summary
hdr_sum_old = """              <header className="mb-10">
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Datos en Tiempo Real</h1>
                <p className="text-sm font-medium text-slate-500 mt-1">Monitorea y administra la plataforma institucional rápidamente.</p>
              </header>"""

hdr_sum_new = """              <header className="mb-6 md:mb-10 mt-2 md:mt-0 text-center md:text-left">
                <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Datos en Tiempo Real</h1>
                <p className="text-xs md:text-sm font-medium text-slate-500 mt-1">Monitorea y administra la plataforma rápida.</p>
              </header>"""
content = content.replace(hdr_sum_old, hdr_sum_new)

# 3. Update Header Grades
hdr_grad_old = """              <header className="mb-8 flex justify-between items-end">
                <div>
                   <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                      <BookOpen className="w-8 h-8 text-blue-600"/>
                      Administrador de Grupos y Evaluaciones
                   </h1>
                   <p className="text-sm font-medium text-slate-500 mt-1">Crea grupos, genera links de invitación (para que estudiantes se unan) y califica trabajos.</p>
                </div>
                <button onClick={() => setShowGroupForm(!showGroupForm)} className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-sm transition-colors shadow-sm">
                   {showGroupForm ? <ArrowLeft className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                   {showGroupForm ? 'Volver a lista' : 'Crear Nuevo Grupo'}
                </button>
              </header>"""

hdr_grad_new = """              <header className="mb-6 md:mb-8 flex flex-col md:flex-row items-center md:items-end md:justify-between gap-4 mt-2 md:mt-0 text-center md:text-left">
                <div>
                   <h1 className="text-xl md:text-3xl font-black text-slate-900 tracking-tight flex flex-col md:flex-row items-center gap-2 md:gap-3 leading-tight md:leading-normal">
                      <BookOpen className="w-6 h-6 md:w-8 md:h-8 text-blue-600 shrink-0"/>
                      Admin Grupos y Notas
                   </h1>
                   <p className="text-xs md:text-sm font-medium text-slate-500 mt-1">Crea grupos, genera links y califica trabajos.</p>
                </div>
                <button onClick={() => setShowGroupForm(!showGroupForm)} className="w-full md:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-sm transition-colors shadow-sm shrink-0">
                   {showGroupForm ? <ArrowLeft className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                   {showGroupForm ? 'Volver a lista' : 'Crear Grupo'}
                </button>
              </header>"""
content = content.replace(hdr_grad_old, hdr_grad_new)

with open('src/pages/AdminDashboard.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
