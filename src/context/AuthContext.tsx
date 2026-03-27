import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInWithPopup, signOut, signInAnonymously } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, googleProvider } from '../firebase';
import { UserProfile } from '../types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isLocalGuest: boolean;
  signInWithGoogle: () => Promise<void>;
  signInAsGuest: () => Promise<void>;
  logout: () => Promise<void>;
  updateProfileData: (data: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLocalGuest, setIsLocalGuest] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (isLocalGuest) return; // Ignore Firebase auth changes if in local guest mode
      
      setUser(currentUser);
      if (currentUser) {
        try {
          const userRef = doc(db, 'users', currentUser.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            setProfile(userSnap.data() as UserProfile);
          } else {
            const newProfile: UserProfile = {
              uid: currentUser.uid,
              displayName: currentUser.displayName || 'Guest',
              email: currentUser.email || '',
              photoURL: currentUser.photoURL || '',
              createdAt: serverTimestamp(),
              targetCalories: 2000,
            };
            await setDoc(userRef, newProfile);
            setProfile(newProfile);
          }
        } catch (error) {
          console.error("Error fetching or creating user profile:", error);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [isLocalGuest]);

  const signInWithGoogle = async () => {
    try {
      setIsLocalGuest(false);
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Error signing in with Google", error);
      throw error;
    }
  };

  const signInAsGuest = async () => {
    try {
      setIsLocalGuest(false);
      await signInAnonymously(auth);
    } catch (error: any) {
      // If Firebase anonymous auth fails (e.g., not enabled), fallback to local guest mode
      if (error.code === 'auth/admin-restricted-operation' || error.code === 'auth/operation-not-allowed') {
        console.log("Anonymous auth not enabled, falling back to local guest mode...");
        setIsLocalGuest(true);
        const mockUid = 'local-guest-' + Date.now();
        setUser({ uid: mockUid, displayName: 'Local Guest' } as User);
        setProfile({
          uid: mockUid,
          displayName: 'Local Guest',
          email: '',
          photoURL: '',
          createdAt: new Date(),
          targetCalories: 2000,
          goal: 'Maintain',
          weight: 70,
          height: 170,
          age: 30
        });
        setLoading(false);
      } else {
        console.error("Error signing in anonymously", error);
        throw error;
      }
    }
  };

  const logout = async () => {
    try {
      if (isLocalGuest) {
        setIsLocalGuest(false);
        setUser(null);
        setProfile(null);
      } else {
        await signOut(auth);
      }
    } catch (error) {
      console.error("Error signing out", error);
    }
  };

  const updateProfileData = async (data: Partial<UserProfile>) => {
    if (!user) return;
    
    if (isLocalGuest) {
      setProfile((prev) => prev ? { ...prev, ...data } : null);
      return;
    }

    try {
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, data, { merge: true });
      setProfile((prev) => prev ? { ...prev, ...data } : null);
    } catch (error) {
      console.error("Error updating profile", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, isLocalGuest, signInWithGoogle, signInAsGuest, logout, updateProfileData }}>
      {children}
    </AuthContext.Provider>
  );
};
