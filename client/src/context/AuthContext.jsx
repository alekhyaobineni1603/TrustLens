import { createContext, useContext, useEffect, useState } from 'react';
import api from '../api';
const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (localStorage.getItem('trustlens_token')) api.get('/auth/me').then(r => setUser(r.data.data.user)).catch(() => localStorage.removeItem('trustlens_token')).finally(() => setLoading(false));
    else setLoading(false);
  }, []);
  const login = async (email,password) => { const { data } = await api.post('/auth/login',{email,password}); localStorage.setItem('trustlens_token',data.data.token); setUser(data.data.user); };
  const register = async (name,email,password) => { const { data } = await api.post('/auth/register',{name,email,password}); localStorage.setItem('trustlens_token',data.data.token); setUser(data.data.user); };
  const logout = () => { localStorage.removeItem('trustlens_token'); setUser(null); };
  return <AuthContext.Provider value={{user,loading,login,register,logout,setUser}}>{children}</AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);
