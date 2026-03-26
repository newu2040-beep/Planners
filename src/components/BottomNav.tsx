import React from 'react';
import { Home, Calendar, LineChart, Settings } from 'lucide-react';
import { motion } from 'motion/react';

interface BottomNavProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, setCurrentTab }) => {
  const navItems = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'planner', icon: Calendar, label: 'Plan' },
    { id: 'progress', icon: LineChart, label: 'Progress' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 pb-safe z-50 px-4 mb-4 pointer-events-none">
      <div className="max-w-md mx-auto bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-800/50 rounded-full shadow-lg shadow-gray-200/20 dark:shadow-black/20 pointer-events-auto">
        <div className="flex justify-around items-center p-2">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            const Icon = item.icon;
            
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className="relative flex flex-col items-center justify-center w-16 h-14 rounded-full transition-colors"
              >
                {isActive && (
                  <motion.div
                    layoutId="bottomNavIndicator"
                    className="absolute inset-0 bg-blue-100 dark:bg-blue-900/40 rounded-full"
                    initial={false}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
                <Icon 
                  className={`w-6 h-6 relative z-10 transition-colors duration-300 ${
                    isActive ? 'text-blue-600 dark:text-blue-400 stroke-[2.5px]' : 'text-gray-500 dark:text-gray-400 stroke-2'
                  }`} 
                />
                <span className={`text-[10px] font-medium mt-1 relative z-10 transition-colors duration-300 ${
                  isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'
                }`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
