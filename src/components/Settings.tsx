import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Moon, Sun, User, Bell, Shield, LogOut, ChevronRight, Camera, Loader2 } from 'lucide-react';
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
  const [isUploading, setIsUploading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      // Compress and resize image using Canvas
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = async () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 400;
          const MAX_HEIGHT = 400;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          // Convert to base64 (JPEG, 0.8 quality)
          const base64String = canvas.toDataURL('image/jpeg', 0.8);
          
          await updateProfileData({ photoURL: base64String });
          setIsUploading(false);
        };
      };
    } catch (error) {
      console.error("Error uploading photo:", error);
      setIsUploading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="pt-20 pb-28 px-4 max-w-lg mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-1 tracking-tight">Settings</h2>
        <p className="text-gray-500 dark:text-gray-400">Manage your preferences</p>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-4"
      >
        <motion.div variants={itemVariants} className="bg-white dark:bg-gray-800 rounded-[2rem] p-6 shadow-sm border border-gray-100 dark:border-gray-700/50">
          <div className="flex items-center gap-5 mb-6">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center overflow-hidden shadow-sm shrink-0 border-2 border-white dark:border-gray-800">
                {isUploading ? (
                  <Loader2 className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-spin" />
                ) : profile?.photoURL ? (
                  <img src={profile.photoURL} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <User className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                )}
              </div>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-md hover:bg-blue-700 transition-colors"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
              <input 
                type="file" 
                accept="image/*" 
                ref={fileInputRef} 
                onChange={handlePhotoUpload} 
                className="hidden" 
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2 truncate tracking-tight">
                <span className="truncate">{profile?.displayName || 'Guest User'}</span>
                {!isEditing && (
                  <button onClick={() => setIsEditing(true)} className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors shrink-0">Edit</button>
                )}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{profile?.email || 'No email provided'}</p>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {isEditing ? (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4 border-t border-gray-100 dark:border-gray-700/50 pt-5 overflow-hidden"
              >
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Display Name</label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full p-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-2xl text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-shadow"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Age</label>
                    <input
                      type="number"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      className="w-full p-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-2xl text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-shadow"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Goal</label>
                    <select
                      value={goal}
                      onChange={(e) => setGoal(e.target.value as any)}
                      className="w-full p-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-2xl text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-shadow"
                    >
                      <option value="Loss">Loss</option>
                      <option value="Maintain">Maintain</option>
                      <option value="Gain">Gain</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Weight (kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      className="w-full p-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-2xl text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-shadow"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Height (cm)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                      className="w-full p-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-2xl text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-shadow"
                    />
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="flex-1 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-2xl font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveProfile}
                    className="flex-1 py-3 bg-blue-600 text-white rounded-2xl font-medium hover:bg-blue-700 transition-colors shadow-md shadow-blue-500/20"
                  >
                    Save Changes
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-4 gap-2 border-t border-gray-100 dark:border-gray-700/50 pt-5"
              >
                <div className="text-center p-2 bg-gray-50 dark:bg-gray-900/30 rounded-2xl">
                  <p className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Age</p>
                  <p className="font-bold text-gray-900 dark:text-white">{profile?.age || '--'}</p>
                </div>
                <div className="text-center p-2 bg-gray-50 dark:bg-gray-900/30 rounded-2xl">
                  <p className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Weight</p>
                  <p className="font-bold text-gray-900 dark:text-white">{profile?.weight ? `${profile.weight}kg` : '--'}</p>
                </div>
                <div className="text-center p-2 bg-gray-50 dark:bg-gray-900/30 rounded-2xl">
                  <p className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Height</p>
                  <p className="font-bold text-gray-900 dark:text-white">{profile?.height ? `${profile.height}cm` : '--'}</p>
                </div>
                <div className="text-center p-2 bg-gray-50 dark:bg-gray-900/30 rounded-2xl">
                  <p className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Goal</p>
                  <p className="font-bold text-gray-900 dark:text-white text-sm">{profile?.goal || '--'}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-white dark:bg-gray-800 rounded-[2rem] p-2 shadow-sm border border-gray-100 dark:border-gray-700/50">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">Dark Mode</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">Toggle app theme</p>
              </div>
            </div>
            <button
              onClick={toggleTheme}
              className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                theme === 'dark' ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow-sm ${
                  theme === 'dark' ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-2xl transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-orange-50 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400">
                <Bell className="w-5 h-5" />
              </div>
              <div className="text-left">
                <h4 className="font-semibold text-gray-900 dark:text-white">Notifications</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">Meal reminders</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>

          <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-2xl transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <Shield className="w-5 h-5" />
              </div>
              <div className="text-left">
                <h4 className="font-semibold text-gray-900 dark:text-white">Privacy & Security</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">Manage your data</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
        </motion.div>

        <motion.button
          variants={itemVariants}
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 py-4 px-4 bg-white dark:bg-gray-800 text-red-600 dark:text-red-400 rounded-[2rem] font-semibold hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors shadow-sm border border-gray-100 dark:border-gray-700/50"
        >
          <LogOut className="w-5 h-5" />
          Log Out
        </motion.button>
      </motion.div>
    </div>
  );
};
