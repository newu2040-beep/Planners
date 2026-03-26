import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { WeightLog } from '../types';
import { format, subDays, parseISO } from 'date-fns';

export const Progress: React.FC = () => {
  const { profile } = useAuth();
  const [weightLogs, setWeightLogs] = useState<WeightLog[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    if (!profile?.uid) return;

    const q = query(
      collection(db, 'weightLogs'),
      where('userId', '==', profile.uid),
      orderBy('date', 'desc'),
      limit(30)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const logs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as WeightLog));
      setWeightLogs(logs);

      // Format data for chart
      const formattedData = logs.reverse().map(log => ({
        date: format(parseISO(log.date), 'MMM dd'),
        weight: log.weight
      }));

      // If no data, provide mock data for visual purposes
      if (formattedData.length === 0) {
        const mock = Array.from({ length: 7 }).map((_, i) => ({
          date: format(subDays(new Date(), 6 - i), 'MMM dd'),
          weight: profile.weight || 70 + (Math.random() * 2 - 1)
        }));
        setChartData(mock);
      } else {
        setChartData(formattedData);
      }
    });

    return () => unsubscribe();
  }, [profile?.uid, profile?.weight]);

  return (
    <div className="pt-28 pb-28 px-4 max-w-lg mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Progress Tracker</h2>
        <p className="text-gray-500 dark:text-gray-400">Monitor your weight journey</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm"
      >
        <div className="flex justify-between items-end mb-6">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Current Weight</p>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-bold text-gray-900 dark:text-white">
                {weightLogs.length > 0 ? weightLogs[0].weight : profile?.weight || '--'}
              </span>
              <span className="text-gray-500 dark:text-gray-400 font-medium">kg</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Goal</p>
            <div className="flex items-baseline gap-1 justify-end">
              <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                {profile?.goal || 'Maintain'}
              </span>
            </div>
          </div>
        </div>

        <div className="h-64 w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#9CA3AF', fontSize: 12 }} 
                dy={10}
              />
              <YAxis 
                domain={['dataMin - 2', 'dataMax + 2']} 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#9CA3AF', fontSize: 12 }}
              />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                cursor={{ stroke: '#9CA3AF', strokeWidth: 1, strokeDasharray: '3 3' }}
              />
              <Line 
                type="monotone" 
                dataKey="weight" 
                stroke="#2563EB" 
                strokeWidth={3} 
                dot={{ r: 4, fill: '#2563EB', strokeWidth: 2, stroke: '#fff' }} 
                activeDot={{ r: 6, fill: '#2563EB', strokeWidth: 2, stroke: '#fff' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      <div className="space-y-4">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Recent Logs</h3>
        <div className="space-y-3">
          {weightLogs.length === 0 ? (
            <div className="text-center py-8 bg-white dark:bg-gray-800 rounded-3xl border border-dashed border-gray-200 dark:border-gray-700">
              <p className="text-gray-500 dark:text-gray-400">No weight logs yet. Start tracking!</p>
            </div>
          ) : (
            weightLogs.slice(0, 5).map((log) => (
              <div key={log.id} className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold">
                    W
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">{format(parseISO(log.date), 'MMMM dd, yyyy')}</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Daily Log</p>
                  </div>
                </div>
                <div className="font-bold text-gray-900 dark:text-white">
                  {log.weight} <span className="text-xs font-normal text-gray-500">kg</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
