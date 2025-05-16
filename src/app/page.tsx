'use client';

import NutritionTracker from '@/features/nutrition/components/NutritionTracker';

export default function NutritionPage() {
  return (
    <main className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">🥗 영양 분석</h1>
      <NutritionTracker />
    </main>
  );
}