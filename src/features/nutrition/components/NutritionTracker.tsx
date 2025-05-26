'use client';

import { useEffect, useState } from 'react';
import { foodList } from '../data/foodList';
import FoodSearch from './FoodSearch';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { doc, setDoc, getDoc, collection, getDocs } from 'firebase/firestore';
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
    const [total, setTotal] = useState<{
        calories: number;
        protein: number;
        fat: number;
        carbs: number;
    } | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [isSaved, setIsSaved] = useState(false);
    const [viewOnly, setViewOnly] = useState(true);
    const [dateColorMap, setDateColorMap] = useState<Record<string, string>>({});

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

    // 기록이 있는 날짜 목록 + 권장 섭취량 불러오기 및 색상 계산
    useEffect(() => {
        async function fetchData() {
            // 권장 섭취량
            const recSnap = await getDoc(doc(db, 'calorieRecords', 'latest'));
            let rec = null;
            if (recSnap.exists()) {
                const d = recSnap.data();
                rec = {
                    calories: d.tdee,
                    protein: d.protein,
                    fat: d.fat,
                    carbs: d.carbs,
                };
            }
            // 실제 기록
            const snapshot = await getDocs(collection(db, 'records'));
            const colorMap: Record<string, string> = {};
            snapshot.docs.forEach(docSnap => {
                const ymd = docSnap.id;
                const data = docSnap.data();
                if (!rec) {
                    colorMap[ymd] = 'bg-gray-200';
                    return;
                }
                const total = data.total || {};
                // 각 영양소별 달성률(%)
                const rates = [
                    total.calories && rec.calories ? total.calories / rec.calories : 0,
                    total.protein && rec.protein ? total.protein / rec.protein : 0,
                    total.fat && rec.fat ? total.fat / rec.fat : 0,
                    total.carbs && rec.carbs ? total.carbs / rec.carbs : 0,
                ];
                // 가장 벗어난(나쁜) 달성률을 기준으로 색상 결정
                const worst = Math.max(
                    Math.abs(1 - rates[0]),
                    Math.abs(1 - rates[1]),
                    Math.abs(1 - rates[2]),
                    Math.abs(1 - rates[3])
                );
                // 색상 결정
                let color = '';
                if (rates.every(r => r >= 0.9 && r <= 1.1)) color = 'bg-green-500'; // 진한 초록
                else if (rates.every(r => r >= 0.7 && r <= 1.3)) color = 'bg-yellow-300'; // 연두/주황
                else color = 'bg-red-400'; // 빨강
                // 진하기 조절(달성률이 더 나쁘면 더 진한 빨강)
                if (worst > 0.5) color = 'bg-red-600';
                colorMap[ymd] = color;
            });
            setDateColorMap(colorMap);
        }
        fetchData();
    }, []);

    const saveToFirestore = async () => {
        const dateKey = selectedDate.toISOString().split('T')[0];
        try {
            await setDoc(doc(db, 'records', dateKey), {
                foods: selectedFoods,
                total,
            });
            alert('✅ 저장 완료!');
            setIsSaved(true);
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

    const handleQuantityChange = (index: number, delta: number) => {
        setSelectedFoods((prev) => {
            const updated = [...prev];
            const target = updated[index];
            const newAmount = Math.max(0.1, parseFloat((target.amount + delta).toFixed(1)));
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
        <div className="card text-left dark:text-white">
            <div className="flex justify-end mb-4">
                <button
                    className={`px-4 py-2 rounded-lg font-semibold border transition text-sm ${viewOnly ? 'bg-primary text-white border-primary' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-white border-gray-300 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900'}`}
                    onClick={() => setViewOnly(v => !v)}
                >
                    {viewOnly ? '편집 모드로' : '정보만 보기'}
                </button>
            </div>
            <div className="mb-6">
                <label className="block mb-2 font-semibold text-base">날짜 선택</label>
                <DatePicker
                    selected={selectedDate}
                    onChange={(date) => {
                        if (date) setSelectedDate(date);
                    }}
                    dateFormat="yyyy-MM-dd"
                    className="w-full border rounded-xl p-3 bg-white dark:bg-gray-800 dark:text-white focus:border-blue-500 transition cursor-pointer"
                    disabled={false}
                    calendarClassName="rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-2"
                    popperClassName="z-30"
                    showPopperArrow={false}
                    customInput={<input readOnly className="w-full border rounded-xl p-3 bg-white dark:bg-gray-800 dark:text-white focus:border-blue-500 transition cursor-pointer" />}
                    dayClassName={date => {
                        const ymd = date.toISOString().split('T')[0];
                        return dateColorMap[ymd] || '';
                    }}
                />
            </div>

            {!isSaved && !viewOnly && <FoodSearch onSelect={handleSelect} />}

            <ul className="space-y-3">
                {selectedFoods.map((item, idx) => (
                    <li key={idx} className="rounded-xl bg-white dark:bg-gray-900 shadow-sm border border-gray-200 dark:border-gray-700 px-4 py-3 flex flex-col gap-2">
                        <div className="flex justify-between items-start">
                            <div>
                                <strong className="text-base">{item.name}</strong> <span className="text-gray-400 text-sm">{item.displayAmount}</span>
                                <div className="text-xs text-gray-500 dark:text-gray-300 mt-1">
                                    칼로리: {item.calories.toFixed(1)} kcal / 단백질: {item.protein.toFixed(1)}g / 지방: {item.fat.toFixed(1)}g / 탄수화물: {item.carbs.toFixed(1)}g
                                </div>
                            </div>
                            {!viewOnly && (
                                <button
                                    onClick={() => handleDelete(idx)}
                                    className="text-gray-400 hover:text-red-500 text-lg ml-4 transition-colors"
                                    title="삭제"
                                >
                                    ×
                                </button>
                            )}
                        </div>

                        <div className="flex items-center gap-1 flex-nowrap overflow-x-auto min-w-0">
                            {viewOnly ? null : (
                                <>
                                    <button onClick={() => handleQuantityChange(idx, -1)} className="px-2 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition whitespace-nowrap min-w-[32px]">-1</button>
                                    <button onClick={() => handleQuantityChange(idx, -0.1)} className="px-2 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition whitespace-nowrap min-w-[32px]">-0.1</button>
                                    <span
                                        className="w-12 text-center border px-1 py-1 rounded-lg bg-gray-50 dark:bg-gray-800 dark:text-white select-none whitespace-nowrap text-sm min-w-[32px]"
                                        style={{ userSelect: 'none', pointerEvents: 'none' }}
                                    >
                                        {item.amount}
                                    </span>
                                    <button onClick={() => handleQuantityChange(idx, 0.1)} className="px-2 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition whitespace-nowrap min-w-[32px]">+0.1</button>
                                    <button onClick={() => handleQuantityChange(idx, 1)} className="px-2 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition whitespace-nowrap min-w-[32px]">+1</button>
                                </>
                            )}
                        </div>
                    </li>
                ))}
            </ul>

            {total && (
                <div className="mt-8 card border-0 bg-blue-50 dark:bg-blue-950 text-blue-900 dark:text-blue-200">
                    <h3 className="text-lg font-bold mb-2">🍽 총 섭취 영양소</h3>
                    <div className="flex flex-wrap gap-6 text-base">
                        <span>칼로리: <b>{total.calories.toFixed(1)}</b> kcal</span>
                        <span>단백질: <b>{total.protein.toFixed(1)}</b> g</span>
                        <span>지방: <b>{total.fat.toFixed(1)}</b> g</span>
                        <span>탄수화물: <b>{total.carbs.toFixed(1)}</b> g</span>
                    </div>
                </div>
            )}

            {!isSaved && !viewOnly && selectedFoods.length > 0 && (
                <div className="mt-6 text-center">
                    <button
                        onClick={saveToFirestore}
                        className="w-full py-3 bg-primary text-white font-bold rounded-xl shadow hover:bg-primary-hover transition"
                    >
                        💾 이 날의 기록 저장
                    </button>
                </div>
            )}
        </div>
    );
}
