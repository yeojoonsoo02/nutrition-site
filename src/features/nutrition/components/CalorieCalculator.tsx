'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function CalorieCalculator() {
    const [gender, setGender] = useState<'male' | 'female'>('male');
    const [age, setAge] = useState(25);
    const [height, setHeight] = useState(170);
    const [weight, setWeight] = useState(65);
    const [exercise, setExercise] = useState(3);
    const [viewOnly, setViewOnly] = useState(true);

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

        // 운동량에 따라 단백질 배수 결정
        let proteinFactor = 1.2;
        if (exercise >= 6) proteinFactor = 2.2;
        else if (exercise >= 4) proteinFactor = 2.0;
        else if (exercise >= 2) proteinFactor = 1.6;
        // 0~1은 1.2
        const protein = proteinFactor * weight;
        const fat = (tdee * 0.25) / 9;
        const carbs = (tdee - (protein * 4 + fat * 9)) / 4;

        setResult({ bmr, tdee, carbs, protein, fat });
    };

    // Firestore 저장 함수
    const saveToFirestore = async () => {
        if (!result) return;
        try {
            await setDoc(doc(db, 'calorieRecords', 'latest'), {
                gender,
                age,
                height,
                weight,
                exercise,
                bmr: result.bmr,
                tdee: result.tdee,
                carbs: result.carbs,
                protein: result.protein,
                fat: result.fat,
                createdAt: new Date().toISOString(),
            });
            alert('✅ 하루 섭취량 계산 결과가 저장되었습니다!');
        } catch {
            alert('❌ 저장 중 오류가 발생했습니다.');
        }
    };

    // Firestore에서 오늘 날짜의 데이터 불러오기
    useEffect(() => {
        async function fetchCalorieRecord() {
            const docRef = doc(db, 'calorieRecords', 'latest');
            const snapshot = await getDoc(docRef);
            if (snapshot.exists()) {
                const data = snapshot.data();
                setGender(data.gender);
                setAge(data.age);
                setHeight(data.height);
                setWeight(data.weight);
                setExercise(data.exercise);
                setResult({
                    bmr: data.bmr,
                    tdee: data.tdee,
                    carbs: data.carbs,
                    protein: data.protein,
                    fat: data.fat,
                });
            }
        }
        fetchCalorieRecord();
    }, []);

    // 커스텀 NumberPicker 컴포넌트
    function NumberPicker({ value, setValue, min, max, step = 1, placeholder }: {
        value: number;
        setValue: (v: number) => void;
        min: number;
        max: number;
        step?: number;
        placeholder?: string;
    }) {
        const [open, setOpen] = useState(false);
        const ref = useRef<HTMLDivElement>(null);
        const listRef = useRef<HTMLDivElement>(null);
        const numbers = useMemo(() => {
            const arr: number[] = [];
            for (let i = min; i <= max; i += step) arr.push(i);
            return arr;
        }, [min, max, step]);

        // open 시 선택된 값이 중앙에 오도록 스크롤
        useEffect(() => {
            if (open && listRef.current) {
                const idx = numbers.indexOf(value);
                if (idx !== -1) {
                    const itemHeight = 40;
                    listRef.current.scrollTop = Math.max(0, itemHeight * idx - (listRef.current.clientHeight / 2) + (itemHeight / 2));
                }
            }
        }, [open, value, numbers]);

        useEffect(() => {
            function handleClick(e: MouseEvent) {
                if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
            }
            if (open) document.addEventListener('mousedown', handleClick);
            return () => document.removeEventListener('mousedown', handleClick);
        }, [open]);

        return (
            <div className="relative" ref={ref}>
                <button
                    type="button"
                    className={`w-full border rounded-xl p-3 bg-white dark:bg-gray-800 dark:text-white focus:border-blue-500 transition text-left cursor-pointer select-none ${open ? 'ring-2 ring-primary/40' : ''}`}
                    onClick={() => setOpen((v) => !v)}
                >
                    {value ? value : <span className="text-gray-400">{placeholder}</span>}
                </button>
                {open && (
                    <div
                        ref={listRef}
                        className="absolute z-20 mt-2 w-full max-h-48 overflow-y-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg animate-fade-in"
                        style={{scrollBehavior: 'smooth'}}
                    >
                        {numbers.map((num) => (
                            <div
                                key={num}
                                className={`px-4 py-2 cursor-pointer select-none text-center text-lg transition
                                    ${value === num
                                        ? 'bg-gray-900 text-white dark:bg-gray-100 dark:text-black font-bold'
                                        : 'hover:bg-gray-200 dark:hover:bg-gray-800 hover:text-black dark:hover:text-white'}
                                `}
                                style={{minHeight: 40}}
                                onClick={() => { setValue(num); setOpen(false); }}
                            >
                                {num}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="card text-left dark:text-white max-w-xl mx-auto">
            {/* 정보만 보기/편집 모드 토글 */}
            <div className="flex justify-end mb-4">
                <button
                    className={`px-4 py-2 rounded-lg font-semibold border transition text-sm ${viewOnly ? 'bg-primary text-white border-primary' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-white border-gray-300 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900'}`}
                    onClick={() => setViewOnly(v => !v)}
                >
                    {viewOnly ? '편집 모드로' : '정보만 보기'}
                </button>
            </div>
            <h1 className="text-2xl font-bold mb-8 text-center">🔥 하루 섭취량 계산기</h1>

            {/* 입력 폼: viewOnly가 아닐 때만 보임 */}
            {!viewOnly && (
                <>
                <div className="flex justify-center gap-4 mb-6">
                    <button
                        type="button"
                        onClick={() => setGender('male')}
                        className={`flex-1 py-3 rounded-xl border font-semibold text-lg transition-all
                            ${gender === 'male'
                                ? 'bg-primary text-white border-primary shadow-lg translate-y-1 scale-95 ring-2 ring-primary/30'
                                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-white border-gray-200 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900'}
                            focus:outline-none`}
                        aria-pressed={gender === 'male'}
                    >
                        👨 남성
                    </button>
                    <button
                        type="button"
                        onClick={() => setGender('female')}
                        className={`flex-1 py-3 rounded-xl border font-semibold text-lg transition-all
                            ${gender === 'female'
                                ? 'bg-primary text-white border-primary shadow-lg translate-y-1 scale-95 ring-2 ring-primary/30'
                                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-white border-gray-200 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900'}
                            focus:outline-none`}
                        aria-pressed={gender === 'female'}
                    >
                        👩 여성
                    </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                    <div>
                        <label className="block mb-2 font-semibold">나이 <span className="text-gray-400 text-sm">(만 나이)</span></label>
                        <NumberPicker
                            value={age}
                            setValue={setAge}
                            min={1}
                            max={120}
                            placeholder="예: 25"
                        />
                    </div>
                    <div>
                        <label className="block mb-2 font-semibold">키 <span className="text-gray-400 text-sm">(cm)</span></label>
                        <NumberPicker
                            value={height}
                            setValue={setHeight}
                            min={100}
                            max={250}
                            placeholder="예: 170"
                        />
                    </div>
                    <div>
                        <label className="block mb-2 font-semibold">몸무게 <span className="text-gray-400 text-sm">(kg)</span></label>
                        <NumberPicker
                            value={weight}
                            setValue={setWeight}
                            min={20}
                            max={200}
                            placeholder="예: 65"
                        />
                    </div>
                    <div>
                        <label className="block mb-2 font-semibold">주간 운동 횟수 <span className="text-gray-400 text-sm">(0~7회)</span></label>
                        <NumberPicker
                            value={exercise}
                            setValue={setExercise}
                            min={0}
                            max={7}
                            placeholder="예: 3"
                        />
                    </div>
                </div>

                <button
                    onClick={handleCalculate}
                    className="w-full py-3 bg-primary text-white font-bold rounded-xl shadow hover:bg-primary-hover transition text-lg mb-2"
                >
                    계산하기
                </button>
                </>
            )}

            {/* 결과/저장 버튼은 항상 보임 */}
            {result && (
                <>
                <div className="mt-8 card border-0 bg-blue-50 dark:bg-blue-950 text-blue-900 dark:text-blue-200">
                    {/* 정보만 보기 모드일 때 개인 정보 표시 */}
                    {viewOnly && (
                        <div className="mb-4 flex flex-wrap gap-4 items-center justify-center text-base text-blue-900 dark:text-blue-200">
                            <span>👤 <b>{gender === 'male' ? '남성' : '여성'}</b></span>
                            <span>나이: <b>{age}</b>세</span>
                            <span>키: <b>{height}</b>cm</span>
                            <span>몸무게: <b>{weight}</b>kg</span>
                        </div>
                    )}
                    <h2 className="text-lg font-semibold mb-4 text-center">🧮 결과</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-base">
                        <div className="flex items-center gap-2"><span className="text-2xl">🔥</span> <b>기초대사량 (BMR):</b> {result.bmr.toFixed(0)} kcal</div>
                        <div className="flex items-center gap-2"><span className="text-2xl">🏃‍♂️</span> <b>총 소비 칼로리 (TDEE):</b> {result.tdee.toFixed(0)} kcal</div>
                        <div className="flex items-center gap-2"><span className="text-2xl">🍗</span> <b>권장 단백질:</b> {result.protein.toFixed(1)} g</div>
                        <div className="flex items-center gap-2"><span className="text-2xl">🥑</span> <b>권장 지방:</b> {result.fat.toFixed(1)} g</div>
                        <div className="flex items-center gap-2"><span className="text-2xl">🍚</span> <b>권장 탄수화물:</b> {result.carbs.toFixed(1)} g</div>
                    </div>
                </div>
                {!viewOnly && (
                <div className="mt-4 text-center">
                    <button
                        onClick={saveToFirestore}
                        className="px-6 py-3 bg-primary text-white font-bold rounded-xl shadow hover:bg-primary-hover transition text-lg"
                    >
                        💾 결과 저장
                    </button>
                </div>
                )}
                </>
            )}
        </div>
    );
}