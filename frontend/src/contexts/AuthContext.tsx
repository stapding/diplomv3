import React, { useEffect, useState, createContext, useContext } from 'react';
interface User {
  firstName: string;
  lastName: string;
  middleName: string;
  email: string;
  avatar: string;
}
interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}
interface RegisterData {
  firstName: string;
  lastName: string;
  middleName: string;
  email: string;
  password: string;
}
const AuthContext = createContext<AuthContextType | undefined>(undefined);
export const AuthProvider = ({
  children
}: {
  children: React.ReactNode;
}) => {
  const [user, setUser] = useState<User | null>(null);
  useEffect(() => {
    // Check for saved user data in localStorage
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);
  const login = async (email: string, password: string) => {
    // Simulate API call
    // In a real app, this would be an actual API request
    if (email && password) {
      const savedUser = localStorage.getItem('registeredUser');
      if (savedUser) {
        const userData = JSON.parse(savedUser);
        if (userData.email === email && userData.password === password) {
          const user = {
            firstName: userData.firstName,
            lastName: userData.lastName,
            middleName: userData.middleName,
            email: userData.email,
            avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80'
          };
          localStorage.setItem('user', JSON.stringify(user));
          setUser(user);
          return;
        }
      }
      throw new Error('Неверный адрес электронной почты или пароль');
    }
  };
  const register = async (userData: RegisterData) => {
    // Simulate API call
    // In a real app, this would be an actual API request
    if (userData) {
      localStorage.setItem('registeredUser', JSON.stringify(userData));
      return;
    }
    throw new Error('Registration failed');
  };
  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };
  const value = {
    user,
    login,
    register,
    logout,
    isAuthenticated: !!user
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};