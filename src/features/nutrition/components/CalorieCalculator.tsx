'use client';

import { useState } from 'react';

export default function CalorieCalculator() {
    const [gender, setGender] = useState<'male' | 'female'>('male');
    const [age, setAge] = useState(25);
    const [height, setHeight] = useState(170);
    const [weight, setWeight] = useState(65);
    const [exercise, setExercise] = useState(3);

    const [result, setResult] = useState<{
        bmr: number;
        tdee: number;
        carbs: number;
        protein: number;
        fat: number;
    } | null>(null);

    const handleCalculate = () => {
        const bmr = gender === 'male'
            ? 10 * weight + 6.25 * height - 5 * age + 5
            : 10 * weight + 6.25 * height - 5 * age - 161;

        const activityMap: Record<number, number> = {
            0: 1.2,
            1: 1.375,
            2: 1.55,
            3: 1.725,
            4: 1.9,
        };
        const tdee = bmr * activityMap[Math.min(exercise, 4)];

        const protein = 1.6 * weight;
        const fat = (tdee * 0.25) / 9;
        const carbs = (tdee - (protein * 4 + fat * 9)) / 4;

        setResult({ bmr, tdee, carbs, protein, fat });
    };

    return (
        <div className="card text-left dark:text-white">
            <h1 className="text-2xl font-bold mb-6">🔥 하루 섭취량 계산기</h1>

            <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                    <label className="block mb-2 font-semibold">성별</label>
                    <select value={gender} onChange={(e) => setGender(e.target.value as 'male' | 'female')} className="w-full border rounded-xl p-3 bg-white dark:bg-gray-800 dark:text-white focus:border-blue-500 transition">
                        <option value="male">남성</option>
                        <option value="female">여성</option>
                    </select>
                </div>
                <div>
                    <label className="block mb-2 font-semibold">나이</label>
                    <input type="number" value={age} onChange={(e) => setAge(Number(e.target.value))} className="w-full border rounded-xl p-3 bg-white dark:bg-gray-800 dark:text-white focus:border-blue-500 transition" />
                </div>
                <div>
                    <label className="block mb-2 font-semibold">키 (cm)</label>
                    <input type="number" value={height} onChange={(e) => setHeight(Number(e.target.value))} className="w-full border rounded-xl p-3 bg-white dark:bg-gray-800 dark:text-white focus:border-blue-500 transition" />
                </div>
                <div>
                    <label className="block mb-2 font-semibold">몸무게 (kg)</label>
                    <input type="number" value={weight} onChange={(e) => setWeight(Number(e.target.value))} className="w-full border rounded-xl p-3 bg-white dark:bg-gray-800 dark:text-white focus:border-blue-500 transition" />
                </div>
                <div className="col-span-2">
                    <label className="block mb-2 font-semibold">주간 운동 횟수</label>
                    <input type="number" value={exercise} onChange={(e) => setExercise(Number(e.target.value))} className="w-full border rounded-xl p-3 bg-white dark:bg-gray-800 dark:text-white focus:border-blue-500 transition" />
                </div>
            </div>

            <button
                onClick={handleCalculate}
                className="w-full py-3 bg-primary text-white font-bold rounded-xl shadow hover:bg-primary-hover transition"
            >
                계산하기
            </button>

            {result && (
                <div className="mt-8 card border-0 bg-blue-50 dark:bg-blue-950 text-blue-900 dark:text-blue-200">
                    <h2 className="text-lg font-semibold mb-2">🧮 결과</h2>
                    <div className="flex flex-wrap gap-6 text-base">
                        <span><b>기초대사량 (BMR):</b> {result.bmr.toFixed(0)} kcal</span>
                        <span><b>총 소비 칼로리 (TDEE):</b> {result.tdee.toFixed(0)} kcal</span>
                        <span><b>권장 단백질:</b> {result.protein.toFixed(1)} g</span>
                        <span><b>권장 지방:</b> {result.fat.toFixed(1)} g</span>
                        <span><b>권장 탄수화물:</b> {result.carbs.toFixed(1)} g</span>
                    </div>
                </div>
            )}
        </div>
    );
}