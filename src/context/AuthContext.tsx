// mobile/src/context/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { getAuthInstance } from '../firebase';

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signup: (email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const auth = await getAuthInstance();
      const unsubscribe = auth.onAuthStateChanged(
        (u) => {
          setUser(u);
          setLoading(false);
        },
        () => setLoading(false)
      );
      return unsubscribe;
    })();
  }, []);

  const signup = async (email: string, password: string) => {
    const auth = await getAuthInstance();
    await auth.createUserWithEmailAndPassword(auth, email, password);
  };

  const login = async (email: string, password: string) => {
    const auth = await getAuthInstance();
    await auth.signInWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    const auth = await getAuthInstance();
    await auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, loading, signup, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
