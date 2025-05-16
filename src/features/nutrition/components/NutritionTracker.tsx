'use client';

import { useState } from 'react';
import { foodList } from '../data/foodList';
import FoodSearch from './FoodSearch';

export default function NutritionTracker() {
  const [selectedFoods, setSelectedFoods] = useState<{ name: string; unit: string; amount: number; calories: number; protein: number; fat: number; carbs: number; }[]>([]);
  const [selectedFood, setSelectedFood] = useState<typeof foodList[0] | null>(null);
  const [amount, setAmount] = useState<number>(0);

  const handleAdd = () => {
    if (!selectedFood || amount <= 0) return;

    const factor = selectedFood.unit === '100g' ? amount / 100 : amount;

    const newFood = {
      name: selectedFood.name,
      unit: selectedFood.unit,
      amount,
      calories: selectedFood.calories * factor,
      protein: selectedFood.protein * factor,
      fat: selectedFood.fat * factor,
      carbs: selectedFood.carbs * factor,
    };

    setSelectedFoods((prev) => [...prev, newFood]);
    setSelectedFood(null);
    setAmount(0);
  };

  return (
    <div className="text-left">
      <FoodSearch onSelect={(food) => setSelectedFood(food)} />

      {selectedFood && (
        <div className="mb-4 p-4 border rounded">
          <h2 className="text-lg font-semibold">{selectedFood.name}</h2>
          <p>기준량: {selectedFood.unit}</p>
          <input
            type="number"
            placeholder={`섭취량 (${selectedFood.unit})`}
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="mt-2 p-2 border rounded w-full"
          />
          <button
            onClick={handleAdd}
            className="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            추가
          </button>
        </div>
      )}

      <ul>
        {selectedFoods.map((item, idx) => (
          <li key={idx} className="mb-2 p-2 border rounded">
            <strong>{item.name}</strong> - {item.amount}{item.unit}
            <div className="text-sm text-gray-500">
              칼로리: {item.calories.toFixed(1)} kcal / 단백질: {item.protein.toFixed(1)}g / 지방: {item.fat.toFixed(1)}g / 탄수화물: {item.carbs.toFixed(1)}g
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}