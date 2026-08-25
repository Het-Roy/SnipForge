import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import SnippetList from '../components/SnippetList';
import { fetchJson } from '../utils/api';

const Dashboard = () => {
  const { user, token } = useContext(AuthContext);
  const [stats, setStats] = useState({ totalSnippets: 0, totalBookmarks: 0, languages: [] });
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { response, json } = await fetchJson('/api/snippets/my/stats', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (response.ok && json.success && json.data) {
          setStats(json.data);
        }
      } catch (err) {
        // Silently fail stats display if there's an error
      } finally {
        setStatsLoading(false);
      }
    };
    
    if (token) {
      fetchStats();
    }
  }, [token]);

  return (
    <div className="relative min-h-screen">
      {/* ── BACKGROUND GLOWS ── */}
      <div className="absolute top-0 left-[10%] w-[30%] h-[30%] bg-indigo-600/5 blur-[120px] rounded-full pointer-events-none" />

      {/* ── HEADER & STATS ── */}
      <div className="container-page py-12 relative z-10">
        
        <div className="flex flex-col md:flex-row items-baseline justify-between gap-6 mb-12 border-b border-slate-900 pb-8">
          <div className="animate-fade-in">
            <p className="text-slate-500 font-bold tracking-widest text-[10px] uppercase mb-1">Developer Portal</p>
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase">
              {user?.name || 'Dashboard'}
            </h1>
          </div>
          <Link to="/create" className="px-6 py-3 bg-indigo-600 rounded-xl text-white font-bold text-sm hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/10 active:scale-95">
            Create Snippet
          </Link>
        </div>

        {/* ── STATS CARDS ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {statsLoading ? (
            <>
              <div className="bg-slate-900/50 border border-slate-800 rounded-2xl h-32 animate-pulse" />
              <div className="bg-slate-900/50 border border-slate-800 rounded-2xl h-32 animate-pulse" />
              <div className="bg-slate-900/50 border border-slate-800 rounded-2xl h-32 animate-pulse" />
            </>
          ) : (
            <>
              {/* Snippets Card */}
              <div className="group relative overflow-hidden rounded-2xl bg-slate-900 border border-slate-800 p-6 transition-all duration-300 hover:border-indigo-500/30">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-indigo-500 font-black">
                    {stats.totalSnippets}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Snippets</div>
                    <div className="text-white font-bold">Total Collection</div>
                  </div>
                </div>
              </div>

              {/* Bookmarks Card */}
              <div className="group relative overflow-hidden rounded-2xl bg-slate-900 border border-slate-800 p-6 transition-all duration-300 hover:border-amber-500/30">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-amber-500 font-black">
                    {stats.totalBookmarks}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Bookmarks</div>
                    <div className="text-white font-bold">Saved Items</div>
                  </div>
                </div>
              </div>

              {/* Languages Card */}
              <div className="group relative overflow-hidden rounded-2xl bg-slate-900 border border-slate-800 p-6 transition-all duration-300 hover:border-emerald-500/30">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-emerald-500 font-black">
                    {stats.languages ? stats.languages.length : 0}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Tech Stack</div>
                    <div className="text-white font-bold">Unique Languages</div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── SNIPPET LIST ── */}
      <div className="pb-20">
        <SnippetList mode="dashboard" title="My Repository" showSearch={true} />
      </div>
    </div>
  );
};

export default Dashboard;
