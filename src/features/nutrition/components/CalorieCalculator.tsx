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
        <div className="card text-left dark:text-white max-w-xl mx-auto">
            <h1 className="text-2xl font-bold mb-8 text-center">🔥 하루 섭취량 계산기</h1>

            {/* 성별 선택 버튼 그룹 */}
            <div className="flex justify-center gap-4 mb-6">
                <button
                    type="button"
                    onClick={() => setGender('male')}
                    className={`flex-1 py-3 rounded-xl border font-semibold text-lg transition-all
                        ${gender === 'male' ? 'bg-primary text-white border-primary shadow' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-white border-gray-200 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900'}`}
                    aria-pressed={gender === 'male'}
                >
                    👨 남성
                </button>
                <button
                    type="button"
                    onClick={() => setGender('female')}
                    className={`flex-1 py-3 rounded-xl border font-semibold text-lg transition-all
                        ${gender === 'female' ? 'bg-primary text-white border-primary shadow' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-white border-gray-200 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900'}`}
                    aria-pressed={gender === 'female'}
                >
                    👩 여성
                </button>
            </div>

            {/* 입력 폼 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                <div>
                    <label className="block mb-2 font-semibold">나이 <span className="text-gray-400 text-sm">(만 나이)</span></label>
                    <input
                        type="number"
                        value={age}
                        min={1}
                        max={120}
                        onChange={(e) => setAge(Number(e.target.value))}
                        placeholder="예: 25"
                        className="w-full border rounded-xl p-3 bg-white dark:bg-gray-800 dark:text-white focus:border-blue-500 transition"
                    />
                </div>
                <div>
                    <label className="block mb-2 font-semibold">키 <span className="text-gray-400 text-sm">(cm)</span></label>
                    <input
                        type="number"
                        value={height}
                        min={100}
                        max={250}
                        onChange={(e) => setHeight(Number(e.target.value))}
                        placeholder="예: 170"
                        className="w-full border rounded-xl p-3 bg-white dark:bg-gray-800 dark:text-white focus:border-blue-500 transition"
                    />
                </div>
                <div>
                    <label className="block mb-2 font-semibold">몸무게 <span className="text-gray-400 text-sm">(kg)</span></label>
                    <input
                        type="number"
                        value={weight}
                        min={20}
                        max={200}
                        onChange={(e) => setWeight(Number(e.target.value))}
                        placeholder="예: 65"
                        className="w-full border rounded-xl p-3 bg-white dark:bg-gray-800 dark:text-white focus:border-blue-500 transition"
                    />
                </div>
                <div>
                    <label className="block mb-2 font-semibold">주간 운동 횟수 <span className="text-gray-400 text-sm">(0~7회)</span></label>
                    <input
                        type="number"
                        value={exercise}
                        min={0}
                        max={7}
                        onChange={(e) => setExercise(Number(e.target.value))}
                        placeholder="예: 3"
                        className="w-full border rounded-xl p-3 bg-white dark:bg-gray-800 dark:text-white focus:border-blue-500 transition"
                    />
                </div>
            </div>

            <button
                onClick={handleCalculate}
                className="w-full py-3 bg-primary text-white font-bold rounded-xl shadow hover:bg-primary-hover transition text-lg mb-2"
            >
                계산하기
            </button>

            {result && (
                <div className="mt-8 card border-0 bg-blue-50 dark:bg-blue-950 text-blue-900 dark:text-blue-200">
                    <h2 className="text-lg font-semibold mb-4 text-center">🧮 결과</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-base">
                        <div className="flex items-center gap-2"><span className="text-2xl">🔥</span> <b>기초대사량 (BMR):</b> {result.bmr.toFixed(0)} kcal</div>
                        <div className="flex items-center gap-2"><span className="text-2xl">🏃‍♂️</span> <b>총 소비 칼로리 (TDEE):</b> {result.tdee.toFixed(0)} kcal</div>
                        <div className="flex items-center gap-2"><span className="text-2xl">🍗</span> <b>권장 단백질:</b> {result.protein.toFixed(1)} g</div>
                        <div className="flex items-center gap-2"><span className="text-2xl">🥑</span> <b>권장 지방:</b> {result.fat.toFixed(1)} g</div>
                        <div className="flex items-center gap-2"><span className="text-2xl">🍚</span> <b>권장 탄수화물:</b> {result.carbs.toFixed(1)} g</div>
                    </div>
                </div>
            )}
        </div>
    );
}