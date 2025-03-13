import React, { createContext, useState, useEffect, useContext } from 'react'; // Add useContext
import { auth, onAuthStateChanged, signInAnonymously } from '../firebase';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  console.error('AuthContext: PROVIDER MOUNTED');

  useEffect(() => {
    console.error('AuthContext: INITIALIZING');
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        console.error('AuthContext: User set:', currentUser.uid);
        setUser(currentUser);
        setLoading(false);
      } else {
        console.error('AuthContext: No user, signing in anonymously...');
        signInAnonymously(auth)
          .then((result) => {
            console.error('AuthContext: Anonymous user set:', result.user.uid);
            setUser(result.user);
            setLoading(false);
          })
          .catch((error) => {
            console.error('AuthContext: Anonymous sign-in failed:', error);
            setLoading(false);
          });
      }
    });

    return () => {
      console.error('AuthContext: CLEANUP');
      unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {console.error('AuthContext: RENDERING, user=', user ? user.uid : 'null', 'loading=', loading)}
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext); // Export useAuth correctly