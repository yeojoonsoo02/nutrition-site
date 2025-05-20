'use client';

import { useState } from 'react';
import { foodList } from '../data/foodList';

type Props = {
  onSelect: (food: typeof foodList[0]) => void;
};

export default function FoodSearch({ onSelect }: Props) {
  const [query, setQuery] = useState('');

  const filtered = query.trim()
    ? foodList.filter((food) => food.name.includes(query.trim()))
    : [];

  return (
    <div className="mb-4">
      <input
        type="text"
        placeholder="음식 이름을 입력하세요"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full p-2 border rounded mb-2"
      />
      <ul className="border rounded">
        {filtered.map((food) => (
          <li
            key={food.name}
            onClick={() => onSelect(food)}
            className="p-2 hover:bg-gray-100 cursor-pointer"
          >
            {food.name}
          </li>
        ))}
      </ul>
    </div>
  );
}