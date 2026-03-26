import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Moon, Sun, User, Bell, Shield, LogOut, ChevronRight } from 'lucide-react';
import { UserProfile } from '../types';

export const Settings: React.FC = () => {
  const { profile, updateProfileData, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  
  const [displayName, setDisplayName] = useState(profile?.displayName || '');
  const [age, setAge] = useState(profile?.age?.toString() || '');
  const [weight, setWeight] = useState(profile?.weight?.toString() || '');
  const [height, setHeight] = useState(profile?.height?.toString() || '');
  const [goal, setGoal] = useState<'Loss' | 'Gain' | 'Maintain'>(profile?.goal || 'Maintain');
  const [isEditing, setIsEditing] = useState(false);

  const handleSaveProfile = async () => {
    const updates: Partial<UserProfile> = {};
    
    if (displayName !== profile?.displayName) updates.displayName = displayName;
    
    const parsedAge = parseInt(age);
    if (!isNaN(parsedAge) && parsedAge !== profile?.age) updates.age = parsedAge;
    
    const parsedWeight = parseFloat(weight);
    if (!isNaN(parsedWeight) && parsedWeight !== profile?.weight) updates.weight = parsedWeight;
    
    const parsedHeight = parseFloat(height);
    if (!isNaN(parsedHeight) && parsedHeight !== profile?.height) updates.height = parsedHeight;
    
    if (goal !== profile?.goal) updates.goal = goal;

    if (Object.keys(updates).length > 0) {
      await updateProfileData(updates);
    }
    setIsEditing(false);
  };

  return (
    <div className="pt-20 pb-24 px-4 max-w-lg mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Settings</h2>
        <p className="text-gray-500 dark:text-gray-400">Manage your preferences</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm"
      >
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center overflow-hidden shadow-sm shrink-0">
            {profile?.photoURL ? (
              <img src={profile.photoURL} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <User className="w-8 h-8 text-blue-600 dark:text-blue-300" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 truncate">
              <span className="truncate">{profile?.displayName || 'Guest User'}</span>
              {!isEditing && (
                <button onClick={() => setIsEditing(true)} className="text-xs text-blue-600 dark:text-blue-400 font-medium hover:underline shrink-0">Edit</button>
              )}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{profile?.email || 'No email provided'}</p>
          </div>
        </div>

        {isEditing ? (
          <div className="space-y-4 mb-6 border-t border-gray-100 dark:border-gray-700 pt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Display Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Age</label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Goal</label>
                <select
                  value={goal}
                  onChange={(e) => setGoal(e.target.value as any)}
                  className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Loss">Loss</option>
                  <option value="Maintain">Maintain</option>
                  <option value="Gain">Gain</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Weight (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Height (cm)</label>
                <input
                  type="number"
                  step="0.1"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setIsEditing(false)}
                className="flex-1 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProfile}
                className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-2 mb-6 border-t border-gray-100 dark:border-gray-700 pt-4">
            <div className="text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400">Age</p>
              <p className="font-semibold text-gray-900 dark:text-white">{profile?.age || '--'}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400">Weight</p>
              <p className="font-semibold text-gray-900 dark:text-white">{profile?.weight ? `${profile.weight}kg` : '--'}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400">Height</p>
              <p className="font-semibold text-gray-900 dark:text-white">{profile?.height ? `${profile.height}cm` : '--'}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400">Goal</p>
              <p className="font-semibold text-gray-900 dark:text-white">{profile?.goal || '--'}</p>
            </div>
          </div>
        )}

        <div className="space-y-1">
          <div className="flex items-center justify-between py-4 border-t border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300">
                {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">Dark Mode</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">Toggle app theme</p>
              </div>
            </div>
            <button
              onClick={toggleTheme}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                theme === 'dark' ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  theme === 'dark' ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <button className="w-full flex items-center justify-between py-4 border-t border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-xl px-2 -mx-2 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300">
                <Bell className="w-5 h-5" />
              </div>
              <div className="text-left">
                <h4 className="font-medium text-gray-900 dark:text-white">Notifications</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">Meal reminders</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>

          <button className="w-full flex items-center justify-between py-4 border-t border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-xl px-2 -mx-2 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300">
                <Shield className="w-5 h-5" />
              </div>
              <div className="text-left">
                <h4 className="font-medium text-gray-900 dark:text-white">Privacy & Security</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">Manage your data</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </motion.div>

      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        onClick={logout}
        className="w-full flex items-center justify-center gap-2 py-4 px-4 bg-white dark:bg-gray-800 text-red-600 dark:text-red-400 rounded-3xl font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors shadow-sm"
      >
        <LogOut className="w-5 h-5" />
        Log Out
      </motion.button>
    </div>
  );
};
