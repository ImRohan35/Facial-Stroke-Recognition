import React, { createContext, useContext, useState, useEffect } from 'react';
import { login, getCurrentUser } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('strokecare_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('strokecare_token');
      if (savedToken) {
        try {
          const userData = await getCurrentUser();
          setUser(userData);
        } catch (err) {
          console.error("Session expired or invalid token:", err);
          logoutUser();
        }
      }
      setLoading(false);
    };
    initAuth();
  }, [token]);

  const loginUser = async (email, password) => {
    const data = await login(email, password);
    localStorage.setItem('strokecare_token', data.access_token);
    setToken(data.access_token);
    const profile = await getCurrentUser();
    setUser(profile);
    return profile;
  };

  const switchDemoRole = async (role) => {
    let email = "patient@strokecare.ai";
    let password = "patient123";

    if (role === "DOCTOR") {
      email = "doctor@strokecare.ai";
      password = "doctor123";
    } else if (role === "ADMIN") {
      email = "admin@strokecare.ai";
      password = "admin123";
    }

    return await loginUser(email, password);
  };

  const logoutUser = () => {
    localStorage.removeItem('strokecare_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, loginUser, logoutUser, switchDemoRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
