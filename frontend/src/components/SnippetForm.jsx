import { useState, useEffect } from 'react';

// Pure controlled form — receives onSubmit, loading, error from parent.
// Used by CreateSnippet (POST) and SnippetDetail edit mode (PUT).
const SnippetForm = ({ onSubmit, loading = false, error = '', submitLabel = 'Publish Snippet', initialData = null }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    language: 'JavaScript',
    tags: '',
    code: ''
  });

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

  const handleSubmit = (e) => {
    e.preventDefault();
    const tagsArray = formData.tags
      ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '')
      : [];
    onSubmit({ ...formData, tags: tagsArray });
  };

  return (
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
            <option value="HTML">HTML</option>
            <option value="CSS">CSS</option>
            <option value="Bash">Bash</option>
            <option value="SQL">SQL</option>
            <option value="PHP">PHP</option>
            <option value="C#">C#</option>
            <option value="Ruby">Ruby</option>
            <option value="Swift">Swift</option>
            <option value="Kotlin">Kotlin</option>
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
          placeholder="What does this code do? Why is it useful? (min 10 characters)"
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
          placeholder="Paste your code here... (min 10 characters)"
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
          {loading ? 'Forging...' : submitLabel}
        </button>
      </div>
    </form>
  );
};

export default SnippetForm;
