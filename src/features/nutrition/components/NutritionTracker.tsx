'use client';

import { useEffect, useState } from 'react';
import { foodList } from '../data/foodList';
import FoodSearch from './FoodSearch';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

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
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [editValue, setEditValue] = useState('');
    const [total, setTotal] = useState<{
        calories: number;
        protein: number;
        fat: number;
        carbs: number;
    } | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());

    useEffect(() => {
        const fetchData = async () => {
            const dateKey = selectedDate.toISOString().split('T')[0];
            const docRef = doc(db, 'records', dateKey);
            const snapshot = await getDoc(docRef);

            if (snapshot.exists()) {
                const data = snapshot.data();
                setSelectedFoods(data.foods || []);
                setTotal(data.total || null);
            } else {
                setSelectedFoods([]);
                setTotal(null);
            }
        };
        fetchData();
    }, [selectedDate]);

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

    const saveToFirestore = async () => {
        const dateKey = selectedDate.toISOString().split('T')[0];
        try {
            await setDoc(doc(db, 'records', dateKey), {
                foods: selectedFoods,
                total,
            });
            alert('✅ 저장 완료!');
        } catch (err) {
            console.error('❌ 저장 실패:', err);
            alert('저장 중 오류가 발생했어요.');
        }
    };

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

        setSelectedFoods((prev) => [newFood, ...prev]);
    };

    const handleDelete = (index: number) => {
        setSelectedFoods((prev) => prev.filter((_, i) => i !== index));
    };

    const handleEditSubmit = (index: number) => {
        const value = parseFloat(editValue);
        if (isNaN(value) || value <= 0) return;

        const target = selectedFoods[index];
        const baseFood = foodList.find(f => f.name === target.name)!;
        const multiplier = target.unit === '100g' ? value * 100 / 100 : value;

        const updatedFood: SelectedFood = {
            ...target,
            amount: value,
            displayAmount: getDisplayAmount(target.unit, value),
            calories: baseFood.calories * multiplier,
            protein: baseFood.protein * multiplier,
            fat: baseFood.fat * multiplier,
            carbs: baseFood.carbs * multiplier,
        };

        setSelectedFoods((prev) => {
            const updated = [...prev];
            updated[index] = updatedFood;
            return updated;
        });

        setEditingIndex(null);
        setEditValue('');
    };

    return (
        <div className="text-left dark:text-white">
            <div className="mb-4">
                <label className="block mb-1 font-medium">날짜 선택</label>
                <DatePicker
                    selected={selectedDate}
                    onChange={(date) => {
                        if (date) setSelectedDate(date);
                    }}
                    dateFormat="yyyy-MM-dd"
                    className="border rounded p-2 w-full dark:bg-gray-800 dark:text-white"
                />
            </div>

            <FoodSearch onSelect={handleSelect} />

            <ul>
                {selectedFoods.map((item, idx) => (
                    <li key={idx} className="mb-2 p-2 border rounded dark:border-gray-600 dark:bg-gray-800">
                        <div className="flex justify-between items-start">
                            <div>
                                <strong>{item.name}</strong> - {item.displayAmount}
                                <div className="text-sm text-gray-500 dark:text-gray-300">
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

                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                            {editingIndex === idx ? (
                                <>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={editValue}
                                        onChange={(e) => setEditValue(e.target.value)}
                                        className="w-20 px-2 py-1 border rounded text-center dark:bg-gray-700 dark:text-white appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                    />
                                    <button
                                        onClick={() => handleEditSubmit(idx)}
                                        className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                                    >
                                        확인
                                    </button>
                                </>
                            ) : (
                                <span
                                    className="w-14 text-center cursor-pointer border px-2 py-1 rounded bg-white dark:bg-gray-700 dark:text-white"
                                    onClick={() => {
                                        setEditingIndex(idx);
                                        setEditValue(String(item.amount));
                                    }}
                                >
                                    {item.amount}
                                </span>
                            )}
                        </div>
                    </li>
                ))}
            </ul>

            {total && (
                <div className="mt-4 border rounded p-4 text-left dark:border-gray-600 dark:bg-gray-800">
                    <h3 className="text-lg font-bold mb-2">🍽 총 섭취 영양소</h3>
                    <p>칼로리: {total.calories.toFixed(1)} kcal</p>
                    <p>단백질: {total.protein.toFixed(1)} g</p>
                    <p>지방: {total.fat.toFixed(1)} g</p>
                    <p>탄수화물: {total.carbs.toFixed(1)} g</p>
                </div>
            )}

            {selectedFoods.length > 0 && (
                <div className="mt-4 text-center">
                    <button
                        onClick={saveToFirestore}
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                        💾 이 날의 기록 저장
                    </button>
                </div>
            )}
        </div>
    );
}