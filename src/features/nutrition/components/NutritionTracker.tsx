'use client';

import { useState } from 'react';
import { foodList } from '../data/foodList';
import FoodSearch from './FoodSearch';

export default function NutritionTracker() {
    const [selectedFoods, setSelectedFoods] = useState<{ name: string; unit: string; amount: number; calories: number; protein: number; fat: number; carbs: number; displayAmount: string; }[]>([]);
    const [selectedFood, setSelectedFood] = useState<typeof foodList[0] | null>(null);
    const [amount, setAmount] = useState<string>('');
    const [total, setTotal] = useState<{
        calories: number;
        protein: number;
        fat: number;
        carbs: number;
    } | null>(null);
    const handleAdd = () => {
        const parsedAmount = parseFloat(amount);
        if (!selectedFood || isNaN(parsedAmount) || parsedAmount <= 0) return;

        const multiplier =
            selectedFood.unit === '100g' ? parsedAmount * 100 / 100 : parsedAmount;

        const newFood = {
            name: selectedFood.name,
            unit: selectedFood.unit,
            amount: parsedAmount,
            displayAmount:
                selectedFood.unit === '100g'
                    ? `${parsedAmount * 100}g`
                    : `${parsedAmount}개`,
            calories: selectedFood.calories * multiplier,
            protein: selectedFood.protein * multiplier,
            fat: selectedFood.fat * multiplier,
            carbs: selectedFood.carbs * multiplier,
        };

        setSelectedFoods((prev) => [...prev, newFood]);
        setSelectedFood(null);
        setAmount('');
    };

    const calculateTotal = () => {
        const total = selectedFoods.reduce(
            (acc, item) => ({
                calories: acc.calories + item.calories,
                protein: acc.protein + item.protein,
                fat: acc.fat + item.fat,
                carbs: acc.carbs + item.carbs,
            }),
            { calories: 0, protein: 0, fat: 0, carbs: 0 }
        );

        setTotal(total);
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
                        inputMode="numeric"      // 🔥 모바일 키패드도 숫자 전용으로
                        placeholder={`섭취량 (${selectedFood.unit})`}
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="mt-2 p-2 border rounded w-full appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
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
                        <strong>{item.name}</strong> - {item.displayAmount}
                        <div className="text-sm text-gray-500">
                            칼로리: {item.calories.toFixed(1)} kcal / 단백질: {item.protein.toFixed(1)}g / 지방: {item.fat.toFixed(1)}g / 탄수화물: {item.carbs.toFixed(1)}g
                        </div>
                    </li>
                ))}
            </ul>
            {selectedFoods.length > 0 && (
                <div className="mt-4 text-center">
                    <button
                        onClick={calculateTotal}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        총합 계산
                    </button>

                    {total && (
                        <div className="mt-4 border rounded p-4 text-left">
                            <h3 className="text-lg font-bold mb-2">🍽 총 섭취 영양소</h3>
                            <p>칼로리: {total.calories.toFixed(1)} kcal</p>
                            <p>단백질: {total.protein.toFixed(1)} g</p>
                            <p>지방: {total.fat.toFixed(1)} g</p>
                            <p>탄수화물: {total.carbs.toFixed(1)} g</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}