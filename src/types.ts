export interface UserProfile {
  uid: string;
  displayName?: string;
  email?: string;
  photoURL?: string;
  goal?: 'Loss' | 'Gain' | 'Maintain';
  age?: number;
  weight?: number;
  height?: number;
  targetCalories?: number;
  createdAt: any; // Timestamp
}

export interface MealLog {
  id: string;
  userId: string;
  type: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
  name: string;
  calories: number;
  date: string; // YYYY-MM-DD
  createdAt: any; // Timestamp
}

export interface WeightLog {
  id: string;
  userId: string;
  weight: number;
  date: string; // YYYY-MM-DD
  createdAt: any; // Timestamp
}
