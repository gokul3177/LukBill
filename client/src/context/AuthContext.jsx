import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [clinic, setClinic] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      if (token && storedUser) {
        setUser(JSON.parse(storedUser));
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        try {
          const res = await axios.get('/api/clinic/me');
          setClinic(res.data);
        } catch (error) {
          console.error("Clinic not setup yet or error fetching clinic config");
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await axios.post('/api/auth/login', { email, password });
    localStorage.setItem('token', res.data.token);
    localStorage.setItem('user', JSON.stringify(res.data.user));
    setUser(res.data.user);
    axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
    
    try {
      const clinicRes = await axios.get('/api/clinic/me');
      setClinic(clinicRes.data);
    } catch (error) {
      console.error("Clinic not setup yet");
      setClinic(null);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setClinic(null);
    delete axios.defaults.headers.common['Authorization'];
  };

  const updateClinic = (newClinicData) => {
    setClinic(newClinicData);
  };

  const updateUser = (newUserData) => {
    setUser(newUserData);
    localStorage.setItem('user', JSON.stringify(newUserData));
  };

  return (
    <AuthContext.Provider value={{ user, clinic, login, logout, loading, updateClinic, updateUser }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
