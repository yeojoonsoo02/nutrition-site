'use client';

import NutritionTracker from '@/features/nutrition/components/NutritionTracker';
import CalorieCalculator from '@/features/nutrition/components/CalorieCalculator';

export default function NutritionPage() {
  return (
    <main className="max-w-xl mx-auto p-6 space-y-10">
      <section>
        <h1 className="text-2xl font-bold mb-4">🥗 영양 분석</h1>
        <NutritionTracker />
      </section>

      <hr className="my-6 border-gray-300" />

      <section>
        <h2 className="text-xl font-bold mb-4">🔥 하루 섭취량 계산</h2>
        <CalorieCalculator />
      </section>
    </main>
  );
}