import { useState, useEffect } from 'react';
import { BookmarkMinus, BookOpenText } from 'lucide-react';
import api from '../api';

export default function Bookmarks() {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookmarks();
  }, []);

  const fetchBookmarks = async () => {
    try {
      const response = await api.get('/bookmarks');
      let payload = response.data?.data?.data || response.data?.data || response.data;
      if (!Array.isArray(payload)) {
        payload = [];
      }
      setBookmarks(payload);
    } catch (err) {
      console.error(err);
      setBookmarks([]);
    } finally {
      setLoading(false);
    }
  };

  const removeBookmark = async (postId) => {
    try {
      await api.post(`/posts/${postId}/bookmark`);
      setBookmarks(prev => prev.filter(b => b.post_id !== postId));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="w-5 h-5 border-2 border-zinc-200 border-t-zinc-900 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="mb-8 border-b border-zinc-200 pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 flex items-center gap-2">
          <BookOpenText className="w-6 h-6" />
          Mi Biblioteca
        </h1>
        <p className="text-zinc-500 text-sm mt-1">Investigaciones guardadas para leer después.</p>
      </div>

      {bookmarks.length === 0 ? (
        <div className="text-center py-20 bg-white border border-zinc-200 rounded-xl mt-8">
          <BookmarkMinus className="w-10 h-10 text-zinc-300 mx-auto mb-4" />
          <h3 className="text-zinc-500 text-sm font-medium">No tienes elementos guardados</h3>
        </div>
      ) : (
        <div className="space-y-4">
          {bookmarks.map((b) => (
            <div key={b.id} className="bg-white p-5 rounded-xl border border-zinc-200 hover:border-zinc-300 transition-colors relative group">
              <button 
                onClick={() => removeBookmark(b.post_id)}
                className="absolute top-4 right-4 text-zinc-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                title="Quitar"
              >
                <BookmarkMinus className="w-4 h-4" />
              </button>
              
              <div className="flex flex-col gap-2 pr-8">
                <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold flex items-center gap-2">
                   {b.post?.author?.name || 'Autor'} 
                 </span>
                <h4 className="font-semibold text-zinc-900 leading-snug">
                  {b.post?.body || 'Contenido sin título'}
                </h4>
                
                <div className="mt-3 flex items-center justify-between">
                  <p className="text-xs text-zinc-500">Guardado el {new Date(b.created_at).toLocaleDateString()}</p>
                  <button className="text-black text-xs font-semibold hover:underline">
                    Leer más
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}