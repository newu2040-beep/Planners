import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { Plus, Droplets, Activity, Utensils } from 'lucide-react';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { MealLog } from '../types';

export const Dashboard: React.FC = () => {
  const { profile, updateProfileData } = useAuth();
  const [meals, setMeals] = useState<MealLog[]>([]);
  const [waterIntake, setWaterIntake] = useState(0); // Mock water intake
  const [showAddMeal, setShowAddMeal] = useState(false);
  const [showTrackWeight, setShowTrackWeight] = useState(false);

  // Form state
  const [mealName, setMealName] = useState('');
  const [mealCalories, setMealCalories] = useState('');
  const [mealType, setMealType] = useState<'Breakfast' | 'Lunch' | 'Dinner' | 'Snack'>('Breakfast');
  const [currentWeight, setCurrentWeight] = useState(profile?.weight?.toString() || '');

  useEffect(() => {
    if (!profile?.uid) return;
    
    const today = new Date().toISOString().split('T')[0];
    const q = query(
      collection(db, 'meals'),
      where('userId', '==', profile.uid),
      where('date', '==', today)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const mealData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MealLog));
      setMeals(mealData);
    });

    return () => unsubscribe();
  }, [profile?.uid]);

  const totalCalories = meals.reduce((sum, meal) => sum + meal.calories, 0);
  const targetCalories = profile?.targetCalories || 2000;
  const progressPercentage = Math.min((totalCalories / targetCalories) * 100, 100);

  const handleAddMeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.uid || !mealName || !mealCalories) return;

    try {
      await addDoc(collection(db, 'meals'), {
        userId: profile.uid,
        type: mealType,
        name: mealName,
        calories: Number(mealCalories),
        date: new Date().toISOString().split('T')[0],
        createdAt: serverTimestamp()
      });
      setShowAddMeal(false);
      setMealName('');
      setMealCalories('');
    } catch (error) {
      console.error("Error adding meal", error);
    }
  };

  const handleTrackWeight = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.uid || !currentWeight) return;

    try {
      const weightNum = Number(currentWeight);
      await addDoc(collection(db, 'weightLogs'), {
        userId: profile.uid,
        weight: weightNum,
        date: new Date().toISOString().split('T')[0],
        createdAt: serverTimestamp()
      });
      await updateProfileData({ weight: weightNum });
      setShowTrackWeight(false);
    } catch (error) {
      console.error("Error tracking weight", error);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div className="pt-28 pb-28 px-4 max-w-lg mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {getGreeting()}, {profile?.displayName?.split(' ')[0] || 'Guest'}
        </h2>
        <p className="text-gray-500 dark:text-gray-400">Here's your daily summary</p>
      </motion.div>

      {/* Goal Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl p-6 text-white shadow-lg shadow-blue-500/20"
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold opacity-90">Daily Calories</h3>
          <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm">
            {profile?.goal || 'Maintain'} Goal
          </span>
        </div>
        
        <div className="flex items-end gap-2 mb-4">
          <span className="text-4xl font-bold">{totalCalories}</span>
          <span className="text-blue-100 mb-1">/ {targetCalories} kcal</span>
        </div>

        <div className="h-2 bg-black/20 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className={`h-full rounded-full ${progressPercentage > 100 ? 'bg-red-400' : 'bg-white'}`}
          />
        </div>
      </motion.div>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-4">
        <button
          onClick={() => setShowAddMeal(true)}
          className="flex flex-col items-center justify-center p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full flex items-center justify-center mb-2">
            <Utensils className="w-6 h-6" />
          </div>
          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Add Meal</span>
        </button>
        
        <button
          onClick={() => setShowTrackWeight(true)}
          className="flex flex-col items-center justify-center p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mb-2">
            <Activity className="w-6 h-6" />
          </div>
          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Log Weight</span>
        </button>
        
        <button
          onClick={() => setWaterIntake(w => w + 1)}
          className="flex flex-col items-center justify-center p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <div className="w-12 h-12 bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 rounded-full flex items-center justify-center mb-2 relative overflow-hidden">
            <Droplets className="w-6 h-6 relative z-10" />
            <div 
              className="absolute bottom-0 left-0 right-0 bg-cyan-200 dark:bg-cyan-800/50 transition-all duration-500"
              style={{ height: `${Math.min((waterIntake / 8) * 100, 100)}%` }}
            />
          </div>
          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{waterIntake}/8 Glasses</span>
        </button>
      </div>

      {/* Today's Meals */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Today's Meals</h3>
        <div className="space-y-3">
          {meals.length === 0 ? (
            <div className="text-center py-8 bg-white dark:bg-gray-800 rounded-3xl border border-dashed border-gray-200 dark:border-gray-700">
              <p className="text-gray-500 dark:text-gray-400">No meals logged yet today.</p>
            </div>
          ) : (
            meals.map((meal) => (
              <motion.div
                key={meal.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400">
                    <Utensils className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">{meal.name}</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{meal.type}</p>
                  </div>
                </div>
                <div className="font-bold text-gray-900 dark:text-white">
                  {meal.calories} <span className="text-xs font-normal text-gray-500">kcal</span>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Add Meal Modal */}
      {showAddMeal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-900 w-full max-w-md rounded-3xl p-6 shadow-2xl"
          >
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Add Meal</h3>
            <form onSubmit={handleAddMeal} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Meal Type</label>
                <select
                  value={mealType}
                  onChange={(e) => setMealType(e.target.value as any)}
                  className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Breakfast">Breakfast</option>
                  <option value="Lunch">Lunch</option>
                  <option value="Dinner">Dinner</option>
                  <option value="Snack">Snack</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Food Name</label>
                <input
                  type="text"
                  value={mealName}
                  onChange={(e) => setMealName(e.target.value)}
                  placeholder="e.g., Oatmeal with Berries"
                  className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Calories</label>
                <input
                  type="number"
                  value={mealCalories}
                  onChange={(e) => setMealCalories(e.target.value)}
                  placeholder="e.g., 350"
                  className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddMeal(false)}
                  className="flex-1 py-3 px-4 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
                >
                  Save Meal
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Track Weight Modal */}
      {showTrackWeight && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-900 w-full max-w-md rounded-3xl p-6 shadow-2xl"
          >
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Log Weight</h3>
            <form onSubmit={handleTrackWeight} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current Weight (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={currentWeight}
                  onChange={(e) => setCurrentWeight(e.target.value)}
                  placeholder="e.g., 70.5"
                  className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowTrackWeight(false)}
                  className="flex-1 py-3 px-4 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
                >
                  Save Weight
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

