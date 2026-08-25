import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { fetchJson } from '../utils/api';

const SnippetForm = ({ initialData = null, isEdit = false }) => {
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    language: 'JavaScript',
    tags: '',
    code: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        language: initialData.language || 'JavaScript',
        tags: initialData.tags ? initialData.tags.join(', ') : '',
        code: initialData.code || ''
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) return;

    setLoading(true);
    setError('');

    const tagsArray = formData.tags
      ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '')
      : [];

    const payload = { ...formData, tags: tagsArray };

    try {
      const url = isEdit ? `/api/snippets/${initialData._id}` : '/api/snippets';
      const method = isEdit ? 'PUT' : 'POST';

      const { response, json } = await fetchJson(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok && json.success) {
        navigate(isEdit ? `/snippet/${initialData._id}` : '/dashboard');
      } else {
        setError(json.message || 'Something went wrong');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-page py-12 max-w-4xl">
      <div className="mb-12 border-b border-slate-900 pb-8">
        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase mb-2">
          {isEdit ? 'Edit Snippet' : 'Create Snippet'}
        </h1>
        <p className="text-slate-500 font-medium">Define your logic and share it with the collective.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 animate-fade-in">
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm font-bold">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">
              Title
            </label>
            <input
              type="text"
              name="title"
              className="input w-full"
              placeholder="e.g. Optimized Sorting Algorithm"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">
              Language
            </label>
            <select
              name="language"
              className="input w-full appearance-none bg-slate-900"
              value={formData.language}
              onChange={handleChange}
            >
              <option value="JavaScript">JavaScript</option>
              <option value="TypeScript">TypeScript</option>
              <option value="Python">Python</option>
              <option value="C++">C++</option>
              <option value="Java">Java</option>
              <option value="Go">Go</option>
              <option value="Rust">Rust</option>
            </select>
          </div>
        </div>

        <div>
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">
            Description
          </label>
          <textarea
            name="description"
            className="textarea w-full min-h-[100px]"
            placeholder="What does this code do? Why is it useful?"
            value={formData.description}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">
            Source Code
          </label>
          <textarea
            name="code"
            className="textarea w-full font-mono text-sm min-h-[300px] border-indigo-500/20 focus:border-indigo-500"
            placeholder="Paste your code here..."
            value={formData.code}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">
            Tags (comma separated)
          </label>
          <input
            type="text"
            name="tags"
            className="input w-full"
            placeholder="frontend, react, optimization"
            value={formData.tags}
            onChange={handleChange}
          />
        </div>

        <div className="flex gap-4 pt-6">
          <button
            type="submit"
            className="px-8 py-4 bg-indigo-600 rounded-2xl text-white font-bold text-lg hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? 'Forging...' : (isEdit ? 'Update Repository' : 'Publish Snippet')}
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-8 py-4 bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 font-bold text-lg hover:bg-slate-800 transition-all active:scale-95"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default SnippetForm;
