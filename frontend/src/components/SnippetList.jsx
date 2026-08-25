import { useState, useEffect, useContext, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AuthContext } from '../context/AuthContext';
import { fetchSnippets, updateBookmark, removeSnippet, clearSnippets } from '../store/snippetSlice';
import SnippetCard from './SnippetCard';
import SearchBar from './SearchBar';
import { fetchJson } from '../utils/api';

const SnippetList = ({ mode = 'explore', title = 'Snippets', showSearch = true }) => {
  const dispatch = useDispatch();
  const { user, token } = useContext(AuthContext);
  const { items: snippets, loading, error, totalPages, totalCount: resultsCount, currentPage: page, availableLanguages } = useSelector(state => state.snippets);

  const [search, setSearch] = useState('');
  const [language, setLanguage] = useState('');
  const [localPage, setLocalPage] = useState(1);

  // ── Clear state when switching between Dashboard / Explore ──
  useEffect(() => {
    dispatch(clearSnippets());
    setSearch('');
    setLanguage('');
    setLocalPage(1);
  }, [dispatch, mode]);

  // ── Main fetch effect ──
  useEffect(() => {
    dispatch(fetchSnippets({ mode, search, language, page: localPage, token }));
  }, [dispatch, mode, search, language, localPage, token]);

  const handleSearch = useCallback((searchTerm, lang) => {
    setSearch(searchTerm);
    setLanguage(lang);
    setLocalPage(1);
  }, []);

  const handleBookmark = useCallback(async (snippetId) => {
    if (!user) return alert('Please login to bookmark snippets');

    // Optimistic UI update in Redux
    dispatch(updateBookmark({ snippetId, userId: user._id }));

    try {
      await fetchJson(`/api/snippets/${snippetId}/bookmark`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
    } catch {
      // Silent failure keeps UI responsive; state will resync on next fetch
    }
  }, [dispatch, token, user]);

  const handleDelete = useCallback(async (snippetId) => {
    if (!window.confirm('Are you sure you want to delete this snippet?')) return;
    try {
      const { response, json } = await fetchJson(`/api/snippets/${snippetId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok || !json.success) throw new Error(json.message);

      dispatch(removeSnippet(snippetId));
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
    }
  }, [dispatch, token]);

  const SkeletonGrid = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {Array.from({ length: 9 }).map((_, i) => (
        <div
          key={i}
          className="bg-slate-900/50 rounded-3xl h-72 animate-pulse border border-slate-800/50"
        />
      ))}
    </div>
  );

  return (
    <div className="container-page py-8 space-y-12">
      <div className="flex items-center justify-between border-b border-slate-900 pb-8">
        <div>
          <h2 className="text-3xl font-black text-white uppercase tracking-tighter italic">{title || 'Snippets'}</h2>
          {!loading && !error && (
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-2">
              {resultsCount} {resultsCount === 1 ? 'Logic Block' : 'Logic Blocks'} Found
            </p>
          )}
        </div>
      </div>

      {showSearch && (
        <SearchBar
          onSearch={handleSearch}
          initialSearch={search}
          initialLang={language}
        />
      )}

      {loading && <SkeletonGrid />}

      {!loading && error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-3xl p-12 text-center animate-fade-in">
          <p className="text-red-500 font-bold mb-6">{error}</p>
          <button 
            className="px-8 py-3 bg-red-500/20 text-red-500 rounded-xl font-bold hover:bg-red-500/30 transition-all" 
            onClick={() => dispatch(fetchSnippets({ mode, search, language, page: localPage, token }))}
          >
            Retry Connection
          </button>
        </div>
      )}

      {!loading && !error && snippets.length === 0 && (
        <div className="text-center py-32 animate-fade-in">
          <div className="w-20 h-20 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto mb-8">
            <div className="w-8 h-8 rounded-full bg-slate-800 opacity-20" />
          </div>
          <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Repository Empty</h3>
          <p className="text-slate-500 mt-2 font-medium">Try a different search or be the first to contribute.</p>
        </div>
      )}

      {!loading && !error && snippets.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {snippets.map((snippet) => {
            const isOwner =
              !!(
                user &&
                (snippet.author?._id?.toString() === user._id?.toString() ||
                  snippet.author?.toString() === user._id?.toString())
              );

            const isBookmarked =
              !!(
                user &&
                snippet.bookmarks?.some(
                  (b) => (b._id?.toString() || b?.toString()) === user._id?.toString()
                )
              );

            return (
              <SnippetCard
                key={snippet._id}
                snippet={snippet}
                onBookmark={handleBookmark}
                onDelete={handleDelete}
                isOwner={isOwner}
                isBookmarked={isBookmarked}
              />
            );
          })}
        </div>
      )}

      {!loading && !error && totalPages > 1 && (
        <div className="flex justify-center items-center gap-6 mt-16 pt-12 border-t border-slate-900">
          <button 
            className="px-6 py-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 font-bold hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed" 
            onClick={() => setLocalPage(p => p - 1)} 
            disabled={localPage === 1}
          >
            Previous
          </button>
          <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Page {localPage} of {totalPages}</span>
          <button 
            className="px-6 py-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 font-bold hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed" 
            onClick={() => setLocalPage(p => p + 1)} 
            disabled={localPage === totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default SnippetList;
