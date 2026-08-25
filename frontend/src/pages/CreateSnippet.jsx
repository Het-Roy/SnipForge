import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import SnippetForm from '../components/SnippetForm';
import { fetchJson } from '../utils/api';

const CreateSnippet = () => {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (formData) => {
    setLoading(true);
    setError('');

    try {
      const { response, json } = await fetchJson('/api/snippets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok || !json.success) {
        throw new Error(json.message || 'Failed to create snippet.');
      }

      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'An error occurred while creating snippet.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-page py-8 max-w-3xl">
      <Link to="/dashboard" className="text-slate-400 hover:text-white text-sm flex items-center gap-1 mb-6 transition-colors">
        <span>←</span> Back to Dashboard
      </Link>
      
      <h1 className="text-3xl font-bold text-white">Create a Snippet</h1>
      <p className="text-slate-400 mt-1">Share a useful piece of code with the community</p>

      <div className="card mt-8">
        <SnippetForm
          onSubmit={handleSubmit}
          loading={loading}
          error={error}
          submitLabel="Create Snippet"
        />
      </div>
    </div>
  );
};

export default CreateSnippet;
