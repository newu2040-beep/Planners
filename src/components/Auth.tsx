import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'motion/react';
import { Mail, Lock, User, LogIn, UserPlus, ArrowRight, AlertCircle } from 'lucide-react';

export const Auth: React.FC = () => {
  const { signInWithGoogle, signInAsGuest } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleEmailAuth = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, we'd use signInWithEmailAndPassword or createUserWithEmailAndPassword here.
    // Since the prompt requested Google Sign-in and Guest, we'll just alert for email auth.
    alert('Email authentication is a placeholder. Please use Google Sign-In or Continue as Guest.');
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setIsLoading(true);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      console.error("Google sign in error:", err);
      let errorMessage = err.message || 'Failed to sign in with Google. Please try again.';
      
      if (err.code === 'auth/unauthorized-domain') {
        errorMessage = 'This domain is not authorized. Please ensure you added exactly "planners-v1.vercel.app" (without https://) to Firebase Console -> Authentication -> Settings -> Authorized domains.';
      } else if (err.code === 'auth/popup-closed-by-user') {
        errorMessage = 'The sign-in popup was closed before completing. Please try again.';
      } else if (err.code === 'auth/popup-blocked') {
        errorMessage = 'The sign-in popup was blocked by your browser. Please allow popups for this site and try again.';
      } else if (err.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your internet connection and try again.';
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4 transition-colors duration-300">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden"
      >
        <div className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Planners</h1>
            <p className="text-gray-500 dark:text-gray-400">Your personal diet companion</p>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-100 dark:border-red-800 rounded-2xl flex items-start gap-3 text-red-600 dark:text-red-400 text-sm"
            >
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <p className="break-words">{error}</p>
            </motion.div>
          )}

          <form onSubmit={handleEmailAuth} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white transition-shadow"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white transition-shadow"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              {isLogin ? 'Login' : 'Sign Up'}
            </button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">Or continue with</span>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <button
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full inline-flex justify-center items-center py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm bg-white dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-gray-400 border-t-gray-700 dark:border-gray-500 dark:border-t-gray-200 rounded-full animate-spin mr-2"></div>
                ) : (
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                )}
                {isLoading ? 'Signing in...' : 'Continue with Google'}
              </button>

              <button
                onClick={async () => {
                  setError(null);
                  try {
                    await signInAsGuest();
                  } catch (err: any) {
                    if (err.code === 'auth/admin-restricted-operation') {
                      setError('Guest login is disabled. Please enable "Anonymous" provider in Firebase Console -> Authentication -> Sign-in method.');
                    } else {
                      setError(err.message || 'Failed to sign in as guest.');
                    }
                  }
                }}
                className="w-full inline-flex justify-center items-center py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm bg-gray-50 dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <User className="w-5 h-5 mr-2 text-gray-500 dark:text-gray-400" />
                Continue as Guest
              </button>
            </div>
          </div>
        </div>
        
        <div className="px-8 py-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
            >
              {isLogin ? 'Sign up' : 'Log in'}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
};
