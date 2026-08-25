import { memo, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

const languageColors = {
  JavaScript: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  TypeScript: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  Python:     'bg-green-500/10 text-green-500 border-green-500/20',
  'C++':      'bg-purple-500/10 text-purple-500 border-purple-500/20',
  Java:       'bg-red-500/10 text-red-500 border-red-500/20',
  Go:         'bg-cyan-500/10 text-cyan-500 border-cyan-500/20',
  Rust:       'bg-orange-500/10 text-orange-500 border-orange-500/20',
};

const SnippetCardComponent = ({ snippet, onBookmark, onDelete, isOwner, isBookmarked }) => {
  const navigate = useNavigate();

  const badgeClass = useMemo(
    () =>
      languageColors[snippet.language] ||
      'bg-slate-800 text-slate-400 border-slate-700',
    [snippet.language]
  );

  const formattedDate = new Date(snippet.createdAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  const firstLetter = snippet.author?.name?.charAt(0).toUpperCase() || '?';

  const codePreview = (snippet.code || '').split('\n').slice(0, 4).join('\n');

  const handleDelete = (e) => {
    e.stopPropagation();
    const confirmed = window.confirm(
      'Are you sure you want to delete this snippet?'
    );
    if (confirmed) {
      onDelete(snippet._id);
    }
  };

  const goToDetail = () => {
    navigate(`/snippet/${snippet._id}`);
  };

  return (
    <div 
      onClick={goToDetail}
      className="group relative flex flex-col p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 transition-all duration-500 cursor-pointer overflow-hidden shadow-2xl animate-fade-in"
    >
      {/* ── HEADER ── */}
      <div className="flex items-start justify-between gap-4 mb-5">
        <h3 className="text-white font-bold leading-tight group-hover:text-indigo-400 transition-colors line-clamp-2">
          {snippet.title}
        </h3>
        <span className={`shrink-0 text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md border ${badgeClass}`}>
          {snippet.language}
        </span>
      </div>

      {/* ── PREVIEW ── */}
      <div className="relative rounded-2xl bg-slate-950 border border-slate-800/50 mb-6 p-4 overflow-hidden">
        <pre className="text-[12px] font-mono text-slate-500 leading-relaxed font-medium">
          <code>{codePreview}</code>
        </pre>
        <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-slate-950 to-transparent" />
      </div>

      {/* ── AUTHOR & DATA ── */}
      <div className="flex items-center gap-3 mt-auto pt-6 border-t border-slate-800/50">
        <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-indigo-500 font-black text-xs">
          {firstLetter}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white text-xs font-bold truncate">{snippet.author?.name}</p>
          <p className="text-slate-600 text-[10px] font-bold uppercase tracking-tighter">{formattedDate}</p>
        </div>
        
        {/* Actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onBookmark(snippet._id);
            }}
            className={`p-2 rounded-lg border transition-all duration-300 ${
              isBookmarked 
                ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-600/20' 
                : 'bg-slate-950 text-slate-500 border-slate-800 hover:text-white hover:border-slate-700'
            }`}
          >
            <div className={`w-3 h-3 rounded-full ${isBookmarked ? 'bg-white' : 'bg-current opacity-20'}`} />
          </button>
          
          {isOwner && (
            <button
              onClick={handleDelete}
              className="p-2 rounded-lg bg-slate-950 text-slate-500 border border-slate-800 hover:text-red-500 hover:border-red-500/30 transition-all"
            >
              <span className="text-xs font-black">X</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const SnippetCard = memo(SnippetCardComponent);

export default SnippetCard;

