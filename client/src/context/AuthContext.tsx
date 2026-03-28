import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    token: null,
    role: null,
    isAuthenticated: false,
  });

  // Load from localStorage on first mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (token && role) {
      setAuth({
        token,
        role: role.toUpperCase(),   // 🔥 Normalize role
        isAuthenticated: true,
      });
    } else {
      setAuth({ token: null, role: null, isAuthenticated: false });
    }
  }, []);

  // Listen for changes to localStorage (multi-tab sync)
  useEffect(() => {
    const handleStorageChange = () => {
      const token = localStorage.getItem("token");
      const role = localStorage.getItem("role");

      if (token && role) {
        setAuth({
          token,
          role: role.toUpperCase(),  // 🔥 Normalize here too
          isAuthenticated: true,
        });
      } else {
        setAuth({ token: null, role: null, isAuthenticated: false });
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Login function
  const login = (token, role) => {
    localStorage.setItem("token", token);
    localStorage.setItem("role", role.toUpperCase()); // 🔥 Always uppercase
    setAuth({ token, role: role.toUpperCase(), isAuthenticated: true });
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setAuth({ token: null, role: null, isAuthenticated: false });
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
