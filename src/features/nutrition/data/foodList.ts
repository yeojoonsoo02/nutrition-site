import data from './foodList.json';

export type FoodItem = {
  name: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  unit: string;
};

export const foodList = data as FoodItem[]; // 👈 이름 붙여서 export