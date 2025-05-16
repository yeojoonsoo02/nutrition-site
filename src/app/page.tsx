'use client';

import { useState } from 'react';
import FoodSearch from '@/features/nutrition/components/FoodSearch';
import { foodList } from '@/features/nutrition/data/foodList';
import NutritionTracker from '@/features/nutrition/components/NutritionTracker';


export default function NutritionPage() {
  const [selectedFood, setSelectedFood] = useState<typeof foodList[0] | null>(null);

  return (
    <main className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">🥗 영양 분석</h1>
      <FoodSearch onSelect={(food) => setSelectedFood(food)} />
      <NutritionTracker />
      {selectedFood && (
        <div className="p-4 border rounded mt-4 text-left">
          <h2 className="text-xl font-semibold mb-2">{selectedFood.name}</h2>
          <p>기준: {selectedFood.unit}</p>
          <p>칼로리: {selectedFood.calories} kcal</p>
          <p>단백질: {selectedFood.protein} g</p>
          <p>지방: {selectedFood.fat} g</p>
          <p>탄수화물: {selectedFood.carbs} g</p>
        </div>
      )}
    </main>
  );
}
