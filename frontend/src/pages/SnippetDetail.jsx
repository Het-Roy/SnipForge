import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { fetchJson } from '../utils/api';

const SnippetDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useContext(AuthContext);
  
  const [snippet, setSnippet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchSnippet = async () => {
      try {
        const { response, json } = await fetchJson(`/api/snippets/${id}`);
        if (response.ok && json.success) {
          setSnippet(json.data.snippet);
        } else {
          setError(json.message || 'Failed to load snippet');
        }
      } catch (err) {
        setError(err.message || 'Network error loading snippet');
      } finally {
        setLoading(false);
      }
    };
    fetchSnippet();
  }, [id]);

  const handleCopy = () => {
    if (snippet?.code) {
      navigator.clipboard.writeText(snippet.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleRate = async (value) => {
    if (!token) return alert('You must be logged in to rate a snippet.');
    try {
      const { response, json } = await fetchJson(`/api/snippets/${id}/rate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ value })
      });
      if (response.ok && json.success) {
        setSnippet(json.data.snippet);
      } else {
        alert(json.message || 'Failed to rate snippet');
      }
    } catch (err) {
      alert('Error rating snippet');
    }
  };

  const submitComment = async (e) => {
    e.preventDefault();
    if (!token) return alert('You must be logged in to comment.');
    if (!commentText.trim()) return;

    setSubmittingComment(true);
    try {
      const { response, json } = await fetchJson(`/api/snippets/${id}/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ text: commentText })
      });
      if (response.ok && json.success) {
        setSnippet(json.data.snippet);
        setCommentText('');
      } else {
        alert(json.message || 'Failed to post comment');
      }
    } catch (err) {
      alert('Error posting comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  if (loading) {
    return (
      <div className="container-page py-16 flex justify-center">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl h-96 w-full max-w-4xl animate-pulse" />
      </div>
    );
  }

  if (error || !snippet) {
    return (
      <div className="container-page py-20 text-center">
        <h2 className="text-xl font-bold text-red-500 mb-6 tracking-tight">{error || 'Snippet not found'}</h2>
        <button onClick={() => navigate(-1)} className="px-6 py-3 bg-slate-900 border border-slate-800 rounded-xl text-white font-bold text-sm hover:bg-slate-800 transition-all">Go Back</button>
      </div>
    );
  }

  const averageRating = snippet.ratings && snippet.ratings.length > 0
    ? (snippet.ratings.reduce((acc, curr) => acc + curr.value, 0) / snippet.ratings.length).toFixed(1)
    : 0;

  const userRating = user ? snippet.ratings?.find(r => r.user === user._id || r.user?._id === user._id)?.value : null;

  return (
    <div className="container-page py-12 max-w-5xl animate-fade-in">
      {/* ── HEADER ── */}
      <div className="flex flex-col md:flex-row items-start justify-between gap-8 mb-10 border-b border-slate-900 pb-10">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 bg-indigo-600/10 border border-indigo-500/20 text-indigo-500 text-[10px] font-black uppercase tracking-widest rounded-md">
              {snippet.language}
            </span>
            <span className="text-slate-600 text-xs font-bold tracking-widest uppercase">
              {new Date(snippet.createdAt).toLocaleDateString()}
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tighter leading-none">
            {snippet.title}
          </h1>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-indigo-500 font-black text-xs">
              {snippet.author?.name?.charAt(0).toUpperCase()}
            </div>
            <span className="text-slate-400 text-sm font-bold tracking-tight">
              {snippet.author?.name}
            </span>
          </div>
        </div>
        
        {/* Rating Block */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col items-center min-w-[160px]">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Rating</div>
          <div className="text-3xl font-black text-white mb-1">
            {averageRating}
          </div>
          <div className="flex gap-1.5 mb-4">
            {[1, 2, 3, 4, 5].map(star => (
              <button
                key={star}
                onClick={() => handleRate(star)}
                disabled={!user}
                className={`w-2 h-2 rounded-full transition-all ${userRating >= star ? 'bg-indigo-500' : 'bg-slate-800 hover:bg-slate-700'}`}
                title={user ? `Rate ${star}` : 'Log in to rate'}
              />
            ))}
          </div>
          <p className="text-[10px] font-bold text-slate-600 uppercase tracking-tighter">
            {snippet.ratings?.length || 0} reviews
          </p>
        </div>
      </div>

      <p className="text-slate-400 text-lg mb-12 leading-relaxed font-medium max-w-3xl">
        {snippet.description}
      </p>

      {/* ── CODE SECTION ── */}
      <div className="relative rounded-3xl overflow-hidden border border-slate-800 bg-slate-950 mb-12 shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900/50 border-b border-slate-800/50 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-800"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-slate-800"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-slate-800"></div>
          </div>
          <button
            onClick={handleCopy}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              copied ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {copied ? 'Copied' : 'Copy Code'}
          </button>
        </div>
        <pre className="p-8 overflow-x-auto text-[15px] font-mono leading-relaxed text-slate-300">
          <code>{snippet.code}</code>
        </pre>
      </div>

      {/* ── TAGS ── */}
      {snippet.tags && snippet.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-20">
          {snippet.tags.map(tag => (
            <span key={tag} className="bg-slate-900 text-slate-500 px-4 py-2 rounded-xl border border-slate-800 text-xs font-bold tracking-tight">
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* ── COMMENTS ── */}
      <div className="max-w-3xl">
        <h3 className="text-2xl font-black text-white mb-8 tracking-tighter uppercase">Discussion</h3>
        
        {user ? (
          <form onSubmit={submitComment} className="mb-12">
            <textarea
              className="textarea w-full min-h-[120px] mb-4 p-5"
              placeholder="Write your comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
            />
            <button 
              type="submit" 
              className="px-6 py-3 bg-indigo-600 rounded-xl text-white font-bold text-sm hover:bg-indigo-500 transition-all"
              disabled={submittingComment || !commentText.trim()}
            >
              Post Comment
            </button>
          </form>
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-10 text-center mb-12">
            <p className="text-slate-500 font-bold mb-6">Login to join the conversation.</p>
            <button onClick={() => navigate('/login')} className="px-6 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white font-bold text-sm hover:bg-slate-700 transition-all">Log In</button>
          </div>
        )}

        <div className="space-y-6">
          {snippet.comments && snippet.comments.length > 0 ? (
            snippet.comments.map((comment, index) => (
              <div key={index} className="flex gap-5 p-6 rounded-2xl bg-slate-900 border border-slate-800 animate-fade-in">
                <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 font-black text-sm shrink-0">
                  {comment.user?.name?.charAt(0).toUpperCase() || '?'}
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-bold text-white text-sm">{comment.user?.name || 'User'}</span>
                    <span className="text-slate-600 text-[10px] font-black uppercase tracking-widest">{new Date(comment.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-slate-400 text-sm leading-relaxed font-medium">{comment.text}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-slate-600 text-sm font-bold tracking-tight py-10 uppercase italic">No comments available.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SnippetDetail;

