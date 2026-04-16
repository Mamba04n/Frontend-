import { useState } from 'react';
import { Heart, MessageCircle, FileText, CheckCircle, Send, ThumbsUp, Trash2 } from 'lucide-react';
import api from '../api';
import { toAssetUrl, toDownloadUrl } from '../utils/assetUrl';

export default function GroupPost({ post, user, mutate, feedState }) {
  const [showComments, setShowComments] = useState(false);
  const [commentBody, setCommentBody] = useState('');
  const [isLiking, setIsLiking] = useState(false);
  const [isCommenting, setIsCommenting] = useState(false);

  const hasLiked = post.likes?.some((like) => like.user_id === user?.id) || false;
  const likesCount = post.likes_count ?? (post.likes?.length || 0);
  const commentsList = post.top_comments || post.comments || [];
  const commentsCount = post.comments_count ?? commentsList.length;

  const author = post.author || post.user;
  const canDelete = !!user && (user.id === post.user_id || user.id === author?.id || !!user.is_admin);

  const handleDelete = async () => {
    if (!window.confirm('¿Seguro que deseas eliminar esta publicación?')) return;

    try {
      await api.delete(`/posts/${post.id}`);
      if (feedState) {
        mutate(feedState.filter((p) => p.id !== post.id), false);
      } else {
        mutate();
      }
    } catch (error) {
      console.error('Error deleting post', error);
      alert('No se pudo eliminar la publicación.');
    }
  };

  const handleLike = async () => {
    setIsLiking(true);
    try {
      const response = await api.post(`/posts/${post.id}/like`);
      if (feedState) {
        mutate(
          feedState.map((p) => {
            if (p.id === post.id) {
              return {
                ...p,
                likes_count: response.data.liked ? likesCount + 1 : Math.max(0, likesCount - 1),
                likes: response.data.liked
                  ? [...(p.likes || []), { user_id: user.id }]
                  : (p.likes || []).filter((l) => l.user_id !== user.id),
              };
            }
            return p;
          }),
          false
        );
      } else {
        mutate();
      }
    } catch (error) {
      console.error('Error liking post', error);
    } finally {
      setIsLiking(false);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentBody.trim()) return;
    setIsCommenting(true);
    try {
      await api.post(`/posts/${post.id}/comments`, { body: commentBody });
      setCommentBody('');
      if (feedState) {
        mutate(
          feedState.map((p) => {
            if (p.id === post.id) {
              const tempComment = {
                id: Date.now(),
                body: commentBody,
                created_at: new Date().toISOString(),
                user,
                author: user,
              };
              return {
                ...p,
                comments_count: commentsCount + 1,
                top_comments: [...commentsList, tempComment],
                comments: [...commentsList, tempComment],
              };
            }
            return p;
          }),
          false
        );
      } else {
        mutate();
      }
    } catch (error) {
      console.error('Error commenting', error);
    } finally {
      setIsCommenting(false);
    }
  };

  return (
    <article className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200 mb-4">
      <div className="p-4 sm:p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
            <img src={author?.avatar_url ? toAssetUrl(author.avatar_url) : `https://ui-avatars.com/api/?name=${author?.name}&background=f3f4f6`} alt="Avatar" className="w-full h-full object-cover" />
          </div>
          <div>
            <h3 className="text-[15px] font-bold text-gray-900 leading-tight flex items-center gap-1.5">
              {author?.name}
              {post.is_verified && <CheckCircle className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
            </h3>
            <div className="flex items-center gap-2">
              <p className="text-[11px] text-gray-500 capitalize">{author?.role || 'Academico'}</p>
              <span className="text-gray-300 text-[10px]">*</span>
              <time className="text-xs text-gray-500 font-medium">
                {new Date(post.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </time>
            </div>
          </div>
          {canDelete && (
            <button
              onClick={handleDelete}
              className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
              title="Eliminar publicacion"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Eliminar
            </button>
          )}
        </div>

        <div className="text-gray-800 text-[15px] leading-relaxed whitespace-pre-wrap mb-3">{post.body}</div>
      </div>

      {(post.file_path || post.file_mime) && (
        <div className="bg-gray-50 border-y border-gray-100 p-0 m-0 overflow-hidden">
          {post.file_mime && (post.file_mime.includes('image') || post.file_mime.includes('video')) ? (
            post.file_mime.includes('video') ? (
              <video src={toAssetUrl(post.file_path)} controls className="w-full max-h-[500px] object-contain bg-black" />
            ) : (
              <img src={toAssetUrl(post.file_path)} className="w-full max-h-[500px] object-scale-down" alt="Attachment" />
            )
          ) : (
            <div className="p-4 flex items-center justify-between hover:bg-gray-100 transition-colors">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-10 h-10 rounded bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div className="truncate">
                  <p className="text-[14px] font-bold text-gray-900 truncate">{post.file_name || 'Documento adjunto'}</p>
                  <p className="text-[12px] text-gray-500 uppercase">{post.file_size ? `${Math.round(post.file_size / 1024)} KB` : 'Archivo'}</p>
                </div>
              </div>
              <a
                href={toDownloadUrl(post.file_path)}
                download
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 px-4 py-2 rounded-lg bg-white border border-gray-200 shadow-sm hover:border-blue-300 transition-all shrink-0 ml-3"
              >
                Descargar
              </a>
            </div>
          )}
        </div>
      )}

      {(likesCount > 0 || commentsCount > 0) && (
        <div className="px-5 py-2.5 flex items-center justify-between text-sm text-gray-500 border-b border-gray-100">
          <div className="flex items-center gap-1.5">
            {likesCount > 0 && (
              <>
                <div className="bg-red-500 rounded-full p-1 flex items-center justify-center">
                  <Heart className="w-3 h-3 text-white fill-white" />
                </div>
                <span>{likesCount}</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-3">
            {commentsCount > 0 && <span className="hover:underline cursor-pointer" onClick={() => setShowComments(!showComments)}>{commentsCount} comentarios</span>}
          </div>
        </div>
      )}

      <div className="flex items-center border-t border-gray-100 px-2 py-1">
        <button
          onClick={handleLike}
          disabled={isLiking}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-medium text-sm transition-colors ${hasLiked ? 'text-blue-600 hover:bg-blue-50' : 'text-gray-600 hover:bg-gray-100'}`}
        >
          <ThumbsUp className={`w-5 h-5 ${(hasLiked || isLiking) ? 'fill-blue-600 text-blue-600' : ''}`} />
          Me gusta
        </button>
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-medium text-sm text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <MessageCircle className="w-5 h-5" />
          Comentar
        </button>
      </div>

      {showComments && (
        <div className="px-5 py-4 bg-gray-50/50 border-t border-gray-100">
          {commentsList && commentsList.length > 0 && (
            <div className="space-y-4 mb-4">
              {commentsList.map((comment) => (
                <div key={comment.id} className="flex gap-2.5">
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 shrink-0">
                    <img
                      src={(comment.author || comment.user)?.avatar_url ? toAssetUrl((comment.author || comment.user)?.avatar_url) : `https://ui-avatars.com/api/?name=${(comment.author || comment.user)?.name}&background=f3f4f6`}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-none px-3.5 py-2 inline-block">
                      <span className="font-bold text-sm text-gray-900 block leading-tight mb-0.5">{(comment.author || comment.user)?.name}</span>
                      <span className="text-[14px] text-gray-800 leading-snug">{comment.body}</span>
                    </div>
                    <div className="text-[11px] text-gray-500 font-medium mt-1 ml-1">
                      {new Date(comment.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <form onSubmit={handleComment} className="flex gap-2">
            <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 shrink-0">
              <img src={user?.avatar_url ? toAssetUrl(user.avatar_url) : `https://ui-avatars.com/api/?name=${user?.name}&background=f3f4f6`} alt="Avatar" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 relative">
              <input
                type="text"
                value={commentBody}
                onChange={(e) => setCommentBody(e.target.value)}
                placeholder="Escribe un comentario..."
                className="w-full bg-white border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 pr-10"
              />
              <button
                type="submit"
                disabled={isCommenting || !commentBody.trim()}
                className="absolute right-1 top-1 bottom-1 w-8 flex items-center justify-center bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-full transition-colors"
              >
                <Send className="w-3.5 h-3.5 -ml-0.5" />
              </button>
            </div>
          </form>
        </div>
      )}
    </article>
  );
}
