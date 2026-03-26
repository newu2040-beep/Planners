import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { Calculator, CheckCircle2, ChevronRight, Apple, Coffee, Moon } from 'lucide-react';

export const Planner: React.FC = () => {
  const { profile, updateProfileData } = useAuth();
  const [goal, setGoal] = useState<'Loss' | 'Gain' | 'Maintain'>(profile?.goal || 'Maintain');
  const [age, setAge] = useState(profile?.age?.toString() || '');
  const [weight, setWeight] = useState(profile?.weight?.toString() || '');
  const [height, setHeight] = useState(profile?.height?.toString() || '');
  const [planGenerated, setPlanGenerated] = useState(false);
  const [targetCalories, setTargetCalories] = useState(profile?.targetCalories || 0);

  const calculatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic BMR calculation (Mifflin-St Jeor Equation approximation)
    const w = parseFloat(weight);
    const h = parseFloat(height);
    const a = parseInt(age);
    
    if (isNaN(w) || isNaN(h) || isNaN(a)) return;

    // Rough average BMR
    let bmr = (10 * w) + (6.25 * h) - (5 * a) + 5;
    
    // Apply goal modifier
    let target = bmr * 1.2; // Sedentary multiplier
    if (goal === 'Loss') target -= 500;
    if (goal === 'Gain') target += 500;
    
    const finalTarget = Math.round(target);
    setTargetCalories(finalTarget);
    setPlanGenerated(true);

    // Save to profile
    await updateProfileData({
      goal,
      age: a,
      weight: w,
      height: h,
      targetCalories: finalTarget
    });
  };

  const mockMeals = [
    { type: 'Breakfast', icon: Coffee, calories: Math.round(targetCalories * 0.25), suggestion: 'Oatmeal with berries & nuts' },
    { type: 'Lunch', icon: Apple, calories: Math.round(targetCalories * 0.35), suggestion: 'Grilled chicken salad with quinoa' },
    { type: 'Dinner', icon: Moon, calories: Math.round(targetCalories * 0.30), suggestion: 'Baked salmon with roasted vegetables' },
    { type: 'Snack', icon: Apple, calories: Math.round(targetCalories * 0.10), suggestion: 'Greek yogurt or mixed almonds' },
  ];

  return (
    <div className="pt-20 pb-24 px-4 max-w-lg mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Diet Planner</h2>
        <p className="text-gray-500 dark:text-gray-400">Customize your nutrition journey</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm"
      >
        <form onSubmit={calculatePlan} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Your Goal</label>
            <div className="grid grid-cols-3 gap-2">
              {['Loss', 'Maintain', 'Gain'].map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGoal(g as any)}
                  className={`py-2 px-3 rounded-xl text-sm font-medium transition-colors ${
                    goal === g 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Age</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                placeholder="Years"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Weight (kg)</label>
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                placeholder="kg"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Height (cm)</label>
            <input
              type="number"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              placeholder="cm"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-md shadow-blue-500/20"
          >
            <Calculator className="w-5 h-5" />
            Generate Plan
          </button>
        </form>
      </motion.div>

      {planGenerated && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-4 flex items-start gap-3">
            <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-green-900 dark:text-green-100">Plan Generated!</h3>
              <p className="text-sm text-green-700 dark:text-green-300">
                Based on your profile, your daily target is <strong className="text-lg">{targetCalories} kcal</strong>.
              </p>
            </div>
          </div>

          <h3 className="text-lg font-bold text-gray-900 dark:text-white pt-2">Suggested Macro Split</h3>
          <div className="space-y-3">
            {mockMeals.map((meal, idx) => {
              const Icon = meal.icon;
              return (
                <div key={idx} className="flex items-center p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                  <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 mr-4">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <h4 className="font-bold text-gray-900 dark:text-white">{meal.type}</h4>
                      <span className="text-sm font-medium text-blue-600 dark:text-blue-400">{meal.calories} kcal</span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{meal.suggestion}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
};
