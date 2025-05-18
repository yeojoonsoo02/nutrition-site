'use client';

import { useState } from 'react';
import { foodList } from '../data/foodList';

type FoodSearchProps = {
  onSelect: (food: typeof foodList[0]) => void;
};

export default function FoodSearch({ onSelect }: FoodSearchProps) {
  const [query, setQuery] = useState('');

  const filtered = foodList.filter((food) =>
    food.name.toLowerCase().includes(query.trim().toLowerCase())
  );

  const handleSelect = (food: typeof foodList[0]) => {
    onSelect(food);
    setQuery(''); // 👉 선택 후 입력 초기화
  };

  return (
    <div className="mb-4">
      <input
        type="text"
        placeholder="음식 이름을 입력하세요"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full p-2 border rounded mb-2"
      />
      <ul className="border rounded max-h-60 overflow-y-auto">
        {filtered.length > 0 ? (
          filtered.map((food) => (
            <li
              key={food.name}
              onClick={() => handleSelect(food)}
              className="p-2 hover:bg-gray-100 cursor-pointer"
            >
              {food.name}
            </li>
          ))
        ) : (
          <li className="p-2 text-gray-400">검색 결과가 없습니다</li>
        )}
      </ul>
    </div>
  );
}