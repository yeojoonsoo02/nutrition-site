'use client';

import { useState, useEffect } from 'react';
import { foodList } from '../data/foodList';
import FoodSearch from './FoodSearch';

type SelectedFood = {
    name: string;
    unit: string;
    amount: number;
    displayAmount: string;
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
};

function getDisplayAmount(unit: string, amount: number): string {
    return unit === '100g' ? `${amount * 100}g` : `${amount}개`;
}

export default function NutritionTracker() {
    const [selectedFoods, setSelectedFoods] = useState<SelectedFood[]>([]);
    const [total, setTotal] = useState<{
        calories: number;
        protein: number;
        fat: number;
        carbs: number;
    } | null>(null);

    // ✅ 자동 총합 계산
    useEffect(() => {
        if (selectedFoods.length === 0) {
            setTotal(null);
            return;
        }

        const newTotal = selectedFoods.reduce(
            (acc, item) => ({
                calories: acc.calories + item.calories,
                protein: acc.protein + item.protein,
                fat: acc.fat + item.fat,
                carbs: acc.carbs + item.carbs,
            }),
            { calories: 0, protein: 0, fat: 0, carbs: 0 }
        );

        setTotal(newTotal);
    }, [selectedFoods]);

    const handleSelect = (food: typeof foodList[0]) => {
        const amount = 1;
        const multiplier = food.unit === '100g' ? amount * 100 / 100 : amount;

        const newFood: SelectedFood = {
            name: food.name,
            unit: food.unit,
            amount,
            displayAmount: getDisplayAmount(food.unit, amount),
            calories: food.calories * multiplier,
            protein: food.protein * multiplier,
            fat: food.fat * multiplier,
            carbs: food.carbs * multiplier,
        };

        setSelectedFoods((prev) => [...prev, newFood]);
    };

    const handleDelete = (index: number) => {
        setSelectedFoods((prev) => prev.filter((_, i) => i !== index));
    };

    const handleQuantityChange = (index: number, delta: number) => {
        setSelectedFoods((prev) => {
            const updated = [...prev];
            const target = updated[index];
            const newAmount = Math.max(1, target.amount + delta);
            const baseFood = foodList.find(f => f.name === target.name)!;
            const multiplier = target.unit === '100g' ? newAmount * 100 / 100 : newAmount;

            updated[index] = {
                ...target,
                amount: newAmount,
                displayAmount: getDisplayAmount(target.unit, newAmount),
                calories: baseFood.calories * multiplier,
                protein: baseFood.protein * multiplier,
                fat: baseFood.fat * multiplier,
                carbs: baseFood.carbs * multiplier,
            };

            return updated;
        });
    };

    return (
        <div className="text-left">
            <FoodSearch onSelect={handleSelect} />

            <ul>
                {selectedFoods.map((item, idx) => (
                    <li key={idx} className="mb-2 p-2 border rounded">
                        <div className="flex justify-between items-start">
                            <div>
                                <strong>{item.name}</strong> - {item.displayAmount}
                                <div className="text-sm text-gray-500">
                                    칼로리: {item.calories.toFixed(1)} kcal / 단백질: {item.protein.toFixed(1)}g / 지방: {item.fat.toFixed(1)}g / 탄수화물: {item.carbs.toFixed(1)}g
                                </div>
                            </div>
                            <button
                                onClick={() => handleDelete(idx)}
                                className="text-red-500 text-sm hover:underline ml-4"
                                title="삭제"
                            >
                                ❌
                            </button>
                        </div>

                        <div className="flex items-center gap-2 mt-2">
                            <button
                                onClick={() => handleQuantityChange(idx, -1)}
                                className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400 text-black"
                            >
                                ➖
                            </button>
                            <span className="w-10 text-center">{item.amount}</span>
                            <button
                                onClick={() => handleQuantityChange(idx, 1)}
                                className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400 text-black"
                            >
                                ➕
                            </button>
                        </div>
                    </li>
                ))}
            </ul>

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
    );
}