import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { fetchJson } from '../utils/api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const { response, json } = await fetchJson('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (response.ok && json.success) {
        login(json.data.user, json.data.token);
        navigate('/dashboard');
      } else {
        setError(json.message || 'Login failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-page py-20 flex flex-col items-center">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase mb-4">Welcome Back</h1>
          <p className="text-slate-500 font-medium">Access your personal code repository.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-10 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-8">
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm font-bold">
              {error}
            </div>
          )}

          <div>
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Email Address</label>
            <input
              type="email"
              className="input w-full"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Password</label>
            <input
              type="password"
              className="input w-full"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-indigo-600 rounded-2xl text-white font-bold text-lg hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/20 active:scale-95 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>

          <p className="text-center text-slate-500 text-sm font-medium pt-4">
            New to SnipForge?{' '}
            <Link to="/signup" className="text-indigo-400 font-bold hover:text-indigo-300 transition-colors">Create account</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
