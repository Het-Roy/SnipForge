import { createContext, useState, useEffect, useContext } from 'react';

export const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [token, setToken]     = useState(null);
  const [loading, setLoading] = useState(true);

  // ── Restore session from localStorage on first mount ──
  useEffect(() => {
    const storedToken = localStorage.getItem('snipforge_token');
    const storedUser  = localStorage.getItem('snipforge_user');

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch {
        // Corrupted data — clear it
        localStorage.removeItem('snipforge_token');
        localStorage.removeItem('snipforge_user');
      }
    }

    setLoading(false);
  }, []);

  // ── Called by Login / Signup pages after a successful API response ──
  const login = (userData, jwtToken) => {
    setUser(userData);
    setToken(jwtToken);
    localStorage.setItem('snipforge_token', jwtToken);
    localStorage.setItem('snipforge_user', JSON.stringify(userData));
  };

  // ── Clears all auth state and removes persisted data ──
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('snipforge_token');
    localStorage.removeItem('snipforge_user');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
